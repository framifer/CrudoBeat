// Dependency-free PNG icon generator for CrudoBeat.
// Renders a rounded orange tile with a dark "speaker" bar, matching the app's look.
// Produces icon-192.png and icon-512.png (opaque, suitable for PWABuilder/Android).
const zlib = require('zlib');
const fs = require('fs');

function crc32(buf){let c=~0;for(let i=0;i<buf.length;i++){c^=buf[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return ~c>>>0;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);const t=Buffer.from(type,'ascii');const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])),0);return Buffer.concat([len,t,data,crc]);}

function makePNG(size){
  const W=size,H=size;
  // RGBA pixel buffer
  const px=Buffer.alloc(W*H*4);
  const set=(x,y,r,g,b,a=255)=>{if(x<0||y<0||x>=W||y>=H)return;const o=(y*W+x)*4;px[o]=r;px[o+1]=g;px[o+2]=b;px[o+3]=a;};
  const radius=Math.round(size*0.1875); // rounded corners
  const inCorner=(x,y)=>{
    const near=(cx,cy)=>{const dx=x-cx,dy=y-cy;return dx*dx+dy*dy>radius*radius;};
    if(x<radius&&y<radius)return near(radius,radius);
    if(x>=W-radius&&y<radius)return near(W-radius-1,radius);
    if(x<radius&&y>=H-radius)return near(radius,H-radius-1);
    if(x>=W-radius&&y>=H-radius)return near(W-radius-1,H-radius-1);
    return false;
  };
  // speaker bar geometry (centered), matching icon.svg proportions
  const sx=Math.round(size*0.109), sw=Math.round(size*0.781);
  const sy=Math.round(size*0.293), sh=Math.round(size*0.293);
  const meshX=Math.round(size*0.14), meshW=Math.round(size*0.45);
  const meshY=Math.round(size*0.324), meshH=Math.round(size*0.230);
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      if(inCorner(x,y)){set(x,y,0,0,0,0);continue;} // transparent outside rounded tile
      let r=0xe3,g=0x3f,b=0x1a; // base orange
      if(x>=sx&&x<sx+sw&&y>=sy&&y<sy+sh){r=0x0c;g=0x0c;b=0x0e;} // dark speaker box
      if(x>=meshX&&x<meshX+meshW&&y>=meshY&&y<meshY+meshH){ // mesh stripes
        r=((x-meshX)%8<3)?0xd9:0x3a;g=((x-meshX)%8<3)?0xd9:0x3a;b=((x-meshX)%8<3)?0xde:0x40;
      }
      set(x,y,r,g,b,255);
    }
  }
  // build raw image data with filter byte per row
  const raw=Buffer.alloc(H*(W*4+1));
  for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;px.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const png=Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
  return png;
}

fs.writeFileSync(__dirname+'/icon-192.png',makePNG(192));
fs.writeFileSync(__dirname+'/icon-512.png',makePNG(512));
console.log('Wrote icon-192.png and icon-512.png');
