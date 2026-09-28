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

Plastic Wave Boy alternates with Watching Me Close using a four-second equal-power volume crossfade. Both songs use aligned bed/percussion buses so airborne percussion fades still work. Pause freezes the audio clock, including transitions. The uploaded gameplay and physics are unchanged.

Build with `node build.js`; verify with `node tests/music.js`. The generated `index.html` embeds both songs and runs on its own. This local development branch is not automatically published.

## Phone motion controls

On a phone, tap Start surfing, allow motion access when prompted, and hold comfortably during calibration. Tilt sideways to carve and forward/back to dive/float. Tilt on/off and Recenter are in the toolbar. Rotation and returning to the page recalibrate the neutral position. The touch stick overrides tilt while dragging and remains available if sensors or permission are unavailable. Use HTTPS for motion access. Sensor readings stay on the device.

Validated with simulated permissions, orientation samples, rotation and stale-input checks; physical iPhone/Android testing remains pending.

## Water and flight effects

Integrated from the testing experiment: directional wake channels and ridges with foam, chorus light sweeps and landing glow, high-launch space shading with expanded stars, and small golden falling sparks. Particles pause, reset and rebase with gameplay. Plastic Wave Boy uses confirmed chorus ranges 45–64.97, 107.83–142.27, and 162–180.03 seconds; Watching Me Close has no confirmed cue ranges. The playlist clock selects the correct track through four-second crossfades. No chorus review button or browser-local cue override is included.

Wake relief now participates in board contact, so old R7 trajectory snapshot equivalence no longer applies. Updated checks verify finite bounded movement, landing continuity, grip reducing launches, water derivatives, cue boundaries, input handling and soundtrack transitions.
