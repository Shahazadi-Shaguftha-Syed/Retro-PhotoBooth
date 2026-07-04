import { useEffect, useRef, useState } from 'react'

// Preload glasses image
const glassesImg = new Image()
glassesImg.src = 'public/sunglasses2.png'
const hatImg = new Image()
hatImg.src = 'public/Hat.png'
const mustacheImg = new Image()
mustacheImg.src = 'public/mustache.png'

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      // already in DOM — wait for FaceMesh to appear
      const poll = setInterval(() => {
        if (window.FaceMesh) { clearInterval(poll); resolve() }
      }, 100)
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => {
      // poll until FaceMesh constructor is ready
      const poll = setInterval(() => {
        if (window.FaceMesh) { clearInterval(poll); resolve() }
      }, 100)
    }
    document.head.appendChild(s)
  })
}

export function useFaceMesh(videoRef, canvasRef, overlays, activeFilter) {
  const animRef = useRef(null)
  const landmarksRef = useRef(null)
  const overlaysRef = useRef(overlays)
  const filterRef = useRef(activeFilter)
  const [faceDetected, setFaceDetected] = useState(false)

  useEffect(() => { overlaysRef.current = overlays }, [overlays])
  useEffect(() => { filterRef.current = activeFilter }, [activeFilter])

  useEffect(() => {
    let stopped = false

    async function init() {
      // Wait for video to be ready
      await new Promise(resolve => {
        const check = () => {
          if (videoRef.current?.readyState >= 2) return resolve()
          setTimeout(check, 100)
        }
        check()
      })

      if (stopped) return

      // Load MediaPipe — polls until window.FaceMesh is a real constructor
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js')

      if (stopped) return

      console.log('FaceMesh ready:', typeof window.FaceMesh)

      const faceMesh = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults((results) => {
        const lms = results.multiFaceLandmarks?.[0] || null
        landmarksRef.current = lms
        setFaceDetected(!!lms)
      })

      await faceMesh.initialize()

      if (stopped) return

      // Render loop — draws video every frame, overlays when landmarks exist
      function loop() {
        if (stopped) return
        const video = videoRef.current
        const canvas = canvasRef.current
        if (video?.readyState >= 2 && canvas) {
          const W = video.videoWidth || 640
          const H = video.videoHeight || 480
          canvas.width = W
          canvas.height = H
          const ctx = canvas.getContext('2d')

          // Draw video with filter
          ctx.filter = filterRef.current?.css || 'none'
          ctx.drawImage(video, 0, 0, W, H)
          ctx.filter = 'none'

          // Draw overlays on top
          const lms = landmarksRef.current
          if (lms) drawOverlays(ctx, lms, W, H, overlaysRef.current)

          // Send to MediaPipe (non-blocking)
          faceMesh.send({ image: video }).catch(() => {})
        }
        animRef.current = requestAnimationFrame(loop)
      }
      loop()
    }

    init().catch(e => console.error('FaceMesh init error:', e))

    return () => {
      stopped = true
      cancelAnimationFrame(animRef.current)
    }
  }, [videoRef, canvasRef])

  return { faceDetected }
}

// ─── Overlay dispatcher ────────────────────────────────────────────
function drawOverlays(ctx, landmarks, W, H, overlays) {
  const lm = (i) => ({ x: landmarks[i].x * W, y: landmarks[i].y * H })

  if (overlays.sunglasses) drawSunglasses(ctx, lm, W, H)
  if (overlays.hat)        drawHat(ctx, lm, W, H)
  if (overlays.mustache)   drawMustache(ctx, lm, W, H)
  if (overlays.lips)       drawLips(ctx, lm, W, H)
}

// ─── Sunglasses (PNG image) ────────────────────────────────────────
function drawSunglasses(ctx, lm, W, H) {
  if (!glassesImg.complete || glassesImg.width === 0) {
    // fallback: canvas drawn glasses while image loads
    drawSunglassesCanvas(ctx, lm, W, H)
    return
  }
  const leftOuter  = lm(33)
  const rightOuter = lm(263)
  const imgW = Math.abs(rightOuter.x - leftOuter.x) * 1.65
  const imgH = imgW * (glassesImg.naturalHeight / glassesImg.naturalWidth)
  const cx = (leftOuter.x + rightOuter.x) / 2
  const cy = (leftOuter.y + rightOuter.y) / 2 - imgH * 0.1
  const angle = Math.atan2(rightOuter.y - leftOuter.y, rightOuter.x - leftOuter.x)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.drawImage(glassesImg, -imgW / 2, -imgH / 2, imgW, imgH)
  ctx.restore()
}

function drawSunglassesCanvas(ctx, lm, W, H) {
  const leftOuter  = lm(33)
  const rightOuter = lm(263)
  const noseBridge = lm(6)
  const eyeW = Math.abs(rightOuter.x - leftOuter.x) * 0.55
  const eyeH = eyeW * 0.42
  const angle = Math.atan2(rightOuter.y - leftOuter.y, rightOuter.x - leftOuter.x)
  ctx.save()
  ctx.translate(noseBridge.x, noseBridge.y)
  ctx.rotate(angle)
  const lx = -(eyeW + eyeW * 0.12), ly = -eyeH * 0.5
  const rx = eyeW * 0.12
  ;[lx, rx].forEach(x => {
    roundRect(ctx, x, ly, eyeW, eyeH, eyeH * 0.2)
    ctx.fillStyle = 'rgba(20,10,40,0.82)'
    ctx.fill()
    ctx.strokeStyle = '#111'
    ctx.lineWidth = W * 0.004
    ctx.stroke()
  })
  ctx.beginPath()
  ctx.moveTo(lx + eyeW, 0); ctx.lineTo(rx, 0)
  ctx.strokeStyle = '#111'; ctx.lineWidth = W * 0.003; ctx.stroke()
  ctx.restore()
}

// ─── Hat ───────────────────────────────────────────────────────────
function drawHat(ctx, lm, W, H) {
  if (!hatImg.complete || hatImg.width === 0) return // nothing to draw yet

  const leftTemple  = lm(234)
  const rightTemple = lm(454)
  const forehead    = lm(10)

  const imgW = Math.abs(rightTemple.x - leftTemple.x) * 1.8
  const imgH = imgW * (hatImg.naturalHeight / hatImg.naturalWidth)
  const cx = (leftTemple.x + rightTemple.x) / 2
  const cy = forehead.y - imgH * 0.55 // tweak this multiplier if hat sits too high/low

  const angle = Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.drawImage(hatImg, -imgW / 2, -imgH / 2, imgW, imgH)
  ctx.restore()
}


// ─── Mustache ──────────────────────────────────────────────────────
function drawMustache(ctx, lm, W, H) {
  if (!mustacheImg.complete || mustacheImg.width === 0) return

  const mouthLeft  = lm(61)
  const mouthRight = lm(291)
  const noseBottom = lm(2)
  const upperLip   = lm(0)

  const imgW = Math.abs(mouthRight.x - mouthLeft.x) * 1.7
  const imgH = imgW * (mustacheImg.naturalHeight / mustacheImg.naturalWidth)
  const cx = (mouthLeft.x + mouthRight.x) / 2
  const cy = (noseBottom.y + upperLip.y) / 2

  const angle = Math.atan2(mouthRight.y - mouthLeft.y, mouthRight.x - mouthLeft.x)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.drawImage(mustacheImg, -imgW / 2, -imgH / 2, imgW, imgH)
  ctx.restore()
}

function drawLips(ctx, lm, W, H) {
  const upperOuter = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
  const lowerOuter = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
  const innerMouth = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78]

  ctx.save()
  ctx.beginPath()
  upperOuter.forEach((i, idx) => {
    const p = lm(i)
    idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  })
  lowerOuter.forEach(i => {
    const p = lm(i)
    ctx.lineTo(p.x, p.y)
  })
  ctx.closePath()
  ctx.moveTo(lm(innerMouth[0]).x, lm(innerMouth[0]).y)
  innerMouth.slice(1).forEach(i => {
    const p = lm(i)
    ctx.lineTo(p.x, p.y)
  })
  ctx.closePath()
  ctx.fillStyle = '#090100'
  ctx.globalAlpha = 0.55
  ctx.fill('evenodd')
  ctx.globalAlpha = 1
  ctx.restore()
}