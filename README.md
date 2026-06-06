# ✦ Retro Photobooth

A retro-styled, browser-based photobooth web app with real-time AI face filters — built with React, Vite, and MediaPipe Face Mesh.

## Demo

> Live link here

---

## Features

- 📸 **Camera capture** with flash effect
- 🎨 **9 photo filters** — mono, warm, cool, vivid, fade, noir, lomo, golden
- 🕶 **Face overlays** — sunglasses, top hat, mask, mustache, lip color
- 🧠 **Real-time face detection** via MediaPipe Face Mesh (468 landmarks)
- ⏱ **3s countdown timer** toggle
- 🎞 **Auto strip** — shoots 4 photos back to back
- ⬇ **Download strip** as a styled PNG or single photo
- 📱 Responsive — works on mobile and desktop

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Face Detection | MediaPipe Face Mesh (WebAssembly + WebGL) |
| Rendering | Canvas API + RequestAnimationFrame |
| Styling | CSS custom properties, inline styles |
| Export | HTML5 Canvas `toDataURL` |

> All processing is **100% client-side** — no backend, no server, no data sent anywhere.

---

## Run Locally

```bash
git clone https://github.com/your-username/retro-photobooth
cd retro-photobooth
npm install
npm run dev
```

Open `http://localhost:5173` and allow camera permissions when prompted.

> ⚠️ Camera requires HTTPS in production. Use Vercel or Netlify for free HTTPS hosting.

---

## Deploy

```bash
npm run build
# deploy the dist/ folder to Vercel, Netlify, or GitHub Pages
```

Or one-click with Vercel:
```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
src/
├── components/
│   ├── Camera.jsx        # Main component — capture, state, download
│   ├── FilterBar.jsx     # Photo filter pills
│   ├── OverlayPicker.jsx # Face filter toggles
│   └── Strip.jsx         # 4-frame strip preview
├── hooks/
│   ├── useCamera.js      # getUserMedia + stream management
│   └── useFaceMesh.js    # MediaPipe init, render loop, overlay drawing
└── App.jsx
public/
├── sunglasses.png        # Overlay asset
└── hat.png               # Overlay asset
```

---

## How It Works

MediaPipe Face Mesh tracks **468 facial landmarks** per frame entirely in the browser via WebAssembly. A `requestAnimationFrame` loop draws the video feed onto a Canvas element, then composites face overlays on top using the landmark coordinates. Captures are taken by copying the canvas to a new offscreen canvas and converting to PNG via `toDataURL`.

---

## Credits

- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) by Google
- Fonts: Special Elite + DM Mono via Google Fonts
- Overlay PNGs: pngwing.com

---
