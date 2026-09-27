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

## Development soundtrack playlist

Plastic Wave Boy alternates with Watching Me Close using a six-second equal-power volume crossfade. Both songs use aligned bed/percussion buses so airborne percussion fades still work. Pause freezes the audio clock, including transitions. The uploaded gameplay and physics are unchanged.

Build with `node build.js`; verify with `node tests/music.js`. The generated `index.html` embeds both songs and runs on its own. This local development branch is not automatically published.
