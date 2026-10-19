# 余绿 · VERDANT

A browser-based stereoscopic wilderness journey with a river boat, a fast forest circuit, and Seattle-inspired / Detroit-inspired abandoned-city circuits.

**Play:** https://verdant-stereo-journey.plumhaven9.chatgpt.site

## Features

- Full-window side-by-side stereo, plus a single-view scenery mode.
- Adjustable image size, stereo eye separation, camera field of view, speed, and quality.
- Real-time WebGL 2 rendering with Three.js, reflective water, terrain, textured vegetation, and scanned natural assets.
- Pause / resume, fullscreen, collapsible controls, and a 60-second rest reminder.
- No build step, backend, account, analytics, or runtime CDN dependency.

## Run locally

Extract `assets.zip` in the repository root (it contains the `assets/` folder), then run:

```sh
unzip assets.zip
python3 -m http.server 8080
```

Open http://localhost:8080 with WebGL 2 enabled. All runtime resources are self-hosted.

## GitHub Pages

The Pages workflow extracts the versioned assets archive and publishes the HTML, CSS and JavaScript using GitHub Actions. Choose **GitHub Actions** in Settings → Pages. Source files are editable directly in this repository; the asset archive preserves model and texture directories for browser upload.

## New journeys and display calibration

- Northline: a closed circuit with drops, banking, sharp turns and roofed passages.
- Seattle-inspired: overgrown towers, mist and a fictional observation tower.
- Detroit-inspired: snowy streets, industrial roofs, smokestacks and abandoned towers.
- These are artistic interpretations, not real city map reconstructions.
- Thrill mode selects single-view rendering. Parallel-view mode uses a stable horizon and lower speed.
- Physical ruler and IPD input can fit the display. The default image-center separation is 80% of IPD, with zero initial stereo depth. This is an unvalidated display heuristic, not a therapeutic prescription.
- Eye distance is recorded as context only. No diagnosis, prescription, or claimed medical efficacy is generated.
- Calibration is local to the browser; saving it is opt-in and it can be cleared. No analytics or eye-data uploads.

## Controls

- Space: play / pause
- Escape: stop motion
- H: hide / show interface
- Drag the scene: look around (limited range)
- “调节视界”: image size, stereo strength, speed, field of view, mono/stereo, rendering quality

## Viewing limitations

An ordinary laptop display does not separate images for the two eyes. Full-size side-by-side images can be difficult or impossible to fuse comfortably. Reduce image size, or use the single-view mode. This is an experimental visual experience, not an autostereoscopic display or a medical device. It does not diagnose or treat strabismus. Stop if discomfort occurs. See https://www.aapos.org/glossary/exotropia.

## Assets and licenses

Third-party assets retain their original licenses:

- Poly Haven assets: CC0 — https://polyhaven.com/license
- Island Tree 01 (simplified mesh): https://polyhaven.com/a/island_tree_01
- Rock Moss Set 01: https://polyhaven.com/a/rock_moss_set_01
- Rock Face 01: https://polyhaven.com/a/rock_face_01
- Dead Tree Trunk: https://polyhaven.com/a/dead_tree_trunk
- Fern 02: https://polyhaven.com/a/fern_02
- Pine Tree 01 bark and twig textures: https://polyhaven.com/a/pine_tree_01
- Three.js and its water normal example texture: MIT; see assets/vendor/THREE-LICENSE.txt. https://threejs.org/
- Meshoptimizer (used offline to simplify the tree mesh): MIT. https://github.com/zeux/meshoptimizer

Terrain, vehicles, track, buildings, composition, and application code are original to this project. No models, maps, textures, or other assets from The Last of Us games are included.
