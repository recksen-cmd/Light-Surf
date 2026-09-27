# Light Surf

A browser surfing game based on the N64 R7 prototype. Carve a luminous ocean, launch from its crests, and carry momentum through cushioned landings.

The complete game and **Plastic Wave Boy** soundtrack are embedded in `index.html`. Drums and percussion fade away during flight and return on landing, synchronized with the rest of the track.

## Play

**[Play Light Surf](https://recksen-cmd.github.io/Light-Surf/)**

Or download `index.html` and open it in a WebGL-capable browser. Click or press a key to enable music.

- **Arrow keys / WASD:** carve, dive, float.
- **Space / Z:** hold the edge.
- **Q / E:** look sideways; **1 / 2:** camera distance.
- **Escape / P:** pause and help; **R:** reset.
- **Music button:** mute/unmute; **L:** diagnostics.
- Standard gamepad and touch controls are included.

## Hosting and editing

This is a self-contained static site. GitHub Pages can publish it from the `main` branch, repository root. No build service or dependencies are required. The JavaScript, styles, and encoded soundtrack are all inside `index.html`.

## Validation

Physics were compared against 20 snapshots from the archived R7 C implementation; maximum sampled difference was 0.000345. Five-minute simulations and keyboard/touch/gamepad input integration passed. Browser rendering, synchronized audio decoding, pause/resume and mute were checked. Physical gamepad and mobile-device playtesting remain pending.

## Local development: softer dives

Branch: `codex/web-development`, based on uploaded commit `f88a2f6`.

Hold Dive to ease beneath the surface; release to recover gradually. Underwater music softly reduces treble (up to 5 dB above 2.2 kHz), with a smooth transition. Airborne percussion behavior is retained.

Build: `node build.js`. Open `index.html` directly for the standalone game.
Checks: `node tests/test.js`, `node tests/dive.js`, `node tests/music.js`, and `node tests/controls.js`. The old C snapshot files are historical references; this development physics intentionally differs.
Browser check: serve this folder and open `tests/playtest.html`.

Changes stay local until explicitly pushed. Publishing remains a separate update to `main`.
