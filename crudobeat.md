# CrudoBeat — Documentazione del progetto

CrudoBeat è una **DAW / groovebox browser-based** (PWA installabile, funziona offline).
Tutta l'app vive in un **singolo file** `index.html` (HTML + CSS + JavaScript inline).
Sintesi audio 100% Web Audio API — **nessun campione audio**, tutti i suoni sono generati.

---

## 1. File del progetto (cosa serve per farlo funzionare)

| File | Ruolo | Da modificare? |
|---|---|---|
| **index.html** | 🔑 TUTTA l'app (UI, audio, generatore, mixer, export…) | Sì — è il file principale |
| **sw.js** | Service worker: cache offline. Contiene `CACHE='crudobeat-vNNN'` | Solo per il bump di versione cache |
| **lame.min.js** | Libreria [lamejs](https://github.com/zhuker/lamejs) per l'export MP3 | No (libreria stabile di terze parti) |
| **manifest.webmanifest** | Configurazione PWA (nome, icone) | Raramente |
| **icon-192.png / icon-512.png / icon.svg** | Icone dell'app | Raramente |
| `make-icons.js`, `server.log`, `*.bak*` | Utility / backup / cronologia | Non necessari |

**Deploy:** repo GitHub pubblica (GitHub Pages). Dopo ogni modifica a `index.html`
si carica il file su GitHub. Se cambia `sw.js` (bump cache) va caricato anche quello.

**Nota cache:** il service worker serve i file dalla cache. Dopo un aggiornamento,
per vedere le novità: hard-refresh, oppure il bump di `CACHE` in `sw.js` forza la
pulizia della cache vecchia al successivo caricamento. In dubbio, prova in incognito.

---

## 2. Struttura dell'app

- **Canvas / griglia principale** (`#canvas`): superficie X/Y per suonare LIVE col dito,
  piazzare "nodi" (note), "pulsar" che li fanno suonare a tempo, e pad di batteria.
- **Topbar** (`#topbar`): strumenti griglia, cambio strumento, tonalità/scala, ottava, zoom.
- **Multitraccia Studio** (`#looper` → `#studio`): timeline in stile DAW con corsie,
  blocchi audio trascinabili, playhead, righello.
- **Pannelli:** Synth, Drum Machine (`#seqPanel`), Melody Sequencer (`#melPanel`),
  HiChord (`#hiPanel`), Mixer (`#mixerPanel`).
- **Dialoghi:** Genera base (`#fullBaseDlg`), Mastering & Export (`#masterDlg`),
  Carica progetto (`#loadDlg`), input custom (`#askDlg`), generatore random (`#randDlg`).

---

## 3. Funzionalità principali

### Strumenti (sintetizzati)
Node, Bass, Bass acustico, Pad, Lead, Organo, Piano (FM), E-Piano, Ambient/Effect,
Synth (Freq/Dirty), Chitarra elettrica, Fisarmonica, Banjo, Tromba, HiChord.
Tonalità/scale complete (Pen Maggiore/Minore, Maggiore, Minore, Dorica, Frigia, Blues, Cromatica).

### Generatore di basi ("Genera intera base")
Crea tracce coerenti per **genere → band → mood → parte**:
- **Generi/band:** Rock (Pink Floyd, Led Zeppelin, The National), Punk/Grunge (Nirvana,
  Joy Division, Verdena), Indie (Modest Mouse, Built to Spill, Sonic Youth), Bedroom
  (Sufjan, Bon Iver, Mac DeMarco), French touch (Daft Punk, Justice, Cassius), Electro
  (Crystal Castles, Apparat, The Knife), Ambient (Löffler, Air, Populous), Pop (STRFKR,
  MGMT, Wixel).
- **Arrangiamento per parte:** Intro = batteria+basso; **Strofa = 3 tracce**
  (batteria+basso+accordi, no lead); **Ritornello = 4** (aggiunge il lead → contrasto);
  Chiusura = batteria+basso+accordi; Stacco = solo batteria.
- **Bassi:** riff/motivi FISSI e riconoscibili per ogni band (non casuali) — groovosi,
  ritmici, coerenti allo stile.
- **Batterie:** minimal per Electro/French touch/Ambient; di accompagnamento per
  Bedroom/Pop; più intense per Rock/Punk/Indie.
- **Accordi:** ritmica dedicata per band + voice-leading (inversioni rotanti); settime/none
  per generi morbidi (Bedroom, Ambient, Pop, French touch), triadi per Rock/Punk/Indie.
  Ogni band ha **uno strumento accordi fisso** (niente più strumento casuale a ogni generazione).

### Griglia con accordi in armonia
Sia sul **canvas** sia nel **melody sequencer**:
- **🎹 Acc / Accordi**: inserisce/suona accordi (triadi diatoniche) invece di note singole,
  sempre in tonalità con la base.
- **🎯 Segui base**: vincola gli accordi alla **progressione** della base generata
  (snap al grado più vicino) per massima armonia. Stato condiviso tra i due pannelli.

### Multitraccia / editing
Drag dei blocchi, mute/solo, volume/pan, FX per traccia (Riverbero/Delay/Drive),
**Split interattivo** (⿻: attiva e tocca il blocco dove vuoi tagliare, ripetibile),
Taglia, Fade in/out, Normalizza, Reverse, cambio BPM per traccia, copia/incolla,
undo/redo, selezione multipla.

### Mixer (per corsia)
Volume, Pan, **EQ 3 bande** (A=Alti / M=Medi / B=Bassi), **Compressore** (CMP 0-3),
**Sidechain/pumping** (SC 0-3), Mute/Solo, **preset FX** (Caldo/Brillante/Punch/Ampio/
Lo-Fi/Pump/Pulito), strip Master.

### Registrazione & Input
REC (griglia/overdub con click a tempo), **microfono** (con scelta device e anti-rientro),
**MIDI** (Web MIDI: suona lo strumento della traccia attiva; iOS/Safari non supportato).

### Export
- **WAV** (senza perdita) e **MP3** (256/192/128 kbps, via lamejs).
- Export di: singola clip, mix (loop), timeline.
- **Mastering** con preset per genere (EQ 4 bande → glue comp → pre-limiter → saturazione
  dolce → makeup → brickwall limiter → ceiling). Catena tarata per essere forte ma
  **senza distorsione** (headroom + soft-clip di sicurezza sul buffer finale).

### Persistenza
Progetti salvati in **IndexedDB**; export/import progetto come file **`.crudo`** (JSON
con audio in WAV base64). Import di **file audio esterni** (wav/mp3/ogg/m4a/aac/flac)
come nuove tracce (bottone 🎵📥 o drag&drop).

---

## 4. Mappa del codice (dentro `index.html`)

- **CSS**: tutto nel `<style>` in `<head>`.
- **HTML**: topbar, looper/studio, pannelli, dialoghi, controlli.
- **JS** (nell'ultimo `<script>`), sezioni principali:
  - Layout e canvas (`applyLayout`, `resize`, `computeGridBounds`).
  - **Audio engine** (`initAudio`, bus master/warm/room/delay/reverb, `rewireMaster`).
  - **Strumenti** (`triggerNote` → `play*`), impulsi riverbero, distorsioni.
  - Scale/tonalità (`SCALES`, `midiForStep`, `degToMidi`).
  - **HiChord** (`chordDegrees`, `hiStartChord`).
  - Griglia + pulsar (`addNode`, `playNodeInstrument`, `firePulsars`, pointer handlers).
  - **Grid chords** (`gridChordMode`, `gridChordFollow`, `snapDegreeToProg`, `gridChordDegrees`).
  - Drum machine (`seqPattern`, `renderPatternExact`) e Melody sequencer (`melPattern`, `melTick`).
  - **Generatore** (`BANDS`, `PROGRESSIONS`, `randomBeat`, `renderDrumsPattern`,
    `renderBassLine`, `renderChordBed`, `renderLeadLine`, `generateFullBase`).
  - Multitraccia/Studio (`buildStudio`, blocchi, `blockTools`, split/cut/fade).
  - **Mixer** (`laneMix`, `getLaneBus`, `buildMixer`, sidechain scheduler).
  - **Export/Mastering** (`bufferToWav`, `bufferToMp3`, `softClipBuffer`, `buildMastering`,
    `renderMasteredMix`, `exportAll`, `exportBuffer`).
  - Recording (`startCapture`/`stopCapture`), Mic, **MIDI**.
  - Persistenza (`openDB`, `collectProject`, `applyProject`, save/load/import).
  - Dialoghi custom (`askText`, `askConfirm`).

---

## 5. Diagnostica & fix (revisione del 2026-09-19)

Revisione totale del codice. Trovati e corretti:
1. **Mic – crash su selezione**: `micSel.options[micSel.selectedIndex]` poteva essere
   `undefined` (selectedIndex = -1) → aggiunta guardia.
2. **Rinomina progetto – crash**: `dbGet` poteva restituire `undefined` e `rec.name=…`
   crashava → aggiunta guardia con messaggio "Progetto non trovato".
3. **Banjo – routing bus**: instradato esplicitamente al proprio warm bus (`warmOut('banjo')`),
   timbro invariato (banjo è già in `WARM_INSTR`).

Il resto del codice è risultato robusto: gestione errori estesa, sanitizzazione dei valori
audio (`finiteOr`, `clamp`, `isFinite`), cleanup dei nodi, retrocompatibilità dei progetti.

---

## 6. Come riprendere il lavoro

1. Clona/scarica la repo GitHub (Code → Download ZIP per un backup locale).
2. Apri `index.html` in un editor: è tutto lì.
3. Per provare in locale basta aprire `index.html` in un browser (per MP3/mic serve
   un contesto sicuro: `https://` o `localhost`).
4. Dopo le modifiche: carica `index.html` (e `sw.js` se hai bumpato la cache) su GitHub.
5. Bump della cache: incrementa `CACHE='crudobeat-vNNN'` in `sw.js` a ogni release
   per forzare l'aggiornamento sui dispositivi.

Buona musica. 🎧
