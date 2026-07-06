import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useCamera } from '../hooks/useCamera'
import { useFaceMesh } from '../hooks/useFaceMesh'
import FilterBar, { FILTERS } from './FilterBar'
import OverlayPicker from './OverlayPicker'
import Strip from './Strip'
import StripPreview from './StripPreview'

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default function Camera() {
  const { videoRef, ready, error } = useCamera()
  const canvasRef = useRef(null)
  const [activeFilter, setActiveFilter] = useState(FILTERS[0])
  const [overlays, setOverlays] = useState({ sunglasses: false, hat: false, mustache: false , lips: false})
  const [frames, setFrames] = useState([])
  const [lastCanvas, setLastCanvas] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [timerOn, setTimerOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(false)
  const [stripCount, setStripCount] = useState(4)
  const [showPreview, setShowPreview] = useState(false)

  const { faceDetected } = useFaceMesh(videoRef, canvasRef, overlays, activeFilter)

  const shutterAudio = new Audio(import.meta.env.BASE_URL + 'shutter.mp3')
  
  const playShutterSound = () => {
    shutterAudio.currentTime = 0
    shutterAudio.play().catch(e => console.warn('Shutter sound failed:', e))
  }



  const doFlash = () => {
    playShutterSound() 
    setFlash(true)
    setTimeout(() => setFlash(false), 120)
  }

  const capture = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const out = document.createElement('canvas')
    out.width = canvas.width
    out.height = canvas.height
    out.getContext('2d').drawImage(canvas, 0, 0)
    return out
  }, [])

  const shoot = useCallback(async () => {
    if (busy) return
    setBusy(true)
    if (timerOn) {
      for (let i = 3; i >= 1; i--) {
        setCountdown(i)
        await sleep(900)
        setCountdown(null)
        await sleep(100)
      }
    }
    doFlash()
    const c = capture()
    if (c) {
      setLastCanvas(c)
      setFrames(prev => {
        const next = [...prev, c]
        const trimmed = next.length > stripCount ? next.slice(next.length - stripCount) : next
        if (trimmed.length === stripCount) {
          setTimeout(() => setShowPreview(true), 1200)  
        }
        return trimmed
      })
    }
    setBusy(false)
  }, [busy, timerOn, capture, stripCount])

  const autoStrip = useCallback(async () => {
    if (busy) return
    setBusy(true)
    for (let i = 0; i < stripCount; i++) {
      if (i > 0) await sleep(700)
      if (timerOn) {
        for (let c = 3; c >= 1; c--) {
          setCountdown(c)
          await sleep(900)
          setCountdown(null)
          await sleep(100)
        }
      }
      doFlash()
      const c = capture()
      if (c) {
        setLastCanvas(c)
        setFrames(prev => {
          const next = [...prev, c]
          return next.length > stripCount ? next.slice(next.length - stripCount) : next
        })
      }
    }
    setTimeout(() => setShowPreview(true), 1200)  
    setBusy(false)
  }, [busy, timerOn, capture, stripCount])

  const downloadStrip = () => {
    if (!frames.length) return
    const fw = 400
    const fh = Math.round(fw * (frames[0].height / frames[0].width))
    const pad = 16, gap = 6
    const totalH = pad * 2 + fh * frames.length + gap * (frames.length - 1) + 36
    const out = document.createElement('canvas')
    out.width = fw + pad * 2
    out.height = totalH
    const ctx = out.getContext('2d')
    ctx.fillStyle = '#0e0c0a'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.strokeStyle = 'rgba(201,168,76,0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(4, 4, out.width - 8, totalH - 8)
    frames.forEach((f, i) => {
      const y = pad + i * (fh + gap)
      ctx.drawImage(f, pad, y, fw, fh)
      const grd = ctx.createRadialGradient(pad + fw / 2, y + fh / 2, fh * 0.3, pad + fw / 2, y + fh / 2, fh * 0.75)
      grd.addColorStop(0, 'transparent')
      grd.addColorStop(1, 'rgba(0,0,0,0.35)')
      ctx.fillStyle = grd
      ctx.fillRect(pad, y, fw, fh)
      ctx.fillStyle = 'rgba(201,168,76,0.4)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1).padStart(2, '0'), pad + fw - 6, y + fh - 6)
    })
    ctx.fillStyle = 'rgba(201,168,76,0.35)'
    ctx.font = '11px serif'
    ctx.textAlign = 'center'
    ctx.fillText('✦  PHOTOBOOTH  ✦', out.width / 2, totalH - 10)
    const a = document.createElement('a')
    a.download = 'photobooth-strip.png'
    a.href = out.toDataURL('image/png')
    a.click()
  }

  const downloadSingle = () => {
    if (!lastCanvas) return
    const a = document.createElement('a')
    a.download = 'photo.png'
    a.href = lastCanvas.toDataURL('image/png')
    a.click()
  }

  const handleRetake = () => {
    setFrames([])
    setLastCanvas(null)
    setShowPreview(false)
  }

  const panelStyle = {
    border: '1px solid var(--border)',
    borderRadius: 2,
    padding: '1rem',
    background: 'var(--surface)',
  }

  const labelStyle = {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }

  const ctrlBtn = (active) => ({
    width: '100%',
    padding: '8px 10px',
    fontSize: 10,
    letterSpacing: 1,
    border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
    borderRadius: 2,
    background: 'transparent',
    color: active ? 'var(--gold)' : 'var(--muted)',
    cursor: busy ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    marginBottom: 6,
    opacity: busy ? 0.4 : 1,
    transition: 'all 0.15s',
  })

  const downloadBtnStyle = (primary, disabled) => ({
    padding: '10px 24px',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    border: `1px solid ${primary ? 'var(--gold)' : 'var(--border2)'}`,
    borderRadius: 2,
    background: 'transparent',
    color: primary ? 'var(--gold)' : 'var(--cream)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    transition: 'all 0.2s',
  })

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: camera + filters + download */}
        <div>
          <div style={{ position: 'relative', background: '#000', border: '1px solid var(--border2)', borderRadius: 2, overflow: 'hidden', aspectRatio: '4/3' }}>
            {/* hidden video for MediaPipe input */}
            <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />

            {/* Canvas is what user sees */}
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', transform: 'scaleX(-1)' }} />

            {/* Scanlines */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)', pointerEvents: 'none' }} />

            {/* Vignette */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />

            {/* Corners */}
            {['tl','tr','bl','br'].map(c => (
              <div key={c} style={{
                position: 'absolute',
                width: 20, height: 20,
                borderColor: 'var(--gold)',
                borderStyle: 'solid',
                opacity: 0.7,
                ...(c === 'tl' ? { top: 10, left: 10, borderWidth: '1px 0 0 1px' } :
                    c === 'tr' ? { top: 10, right: 10, borderWidth: '1px 1px 0 0' } :
                    c === 'bl' ? { bottom: 10, left: 10, borderWidth: '0 0 1px 1px' } :
                                 { bottom: 10, right: 10, borderWidth: '0 1px 1px 0' })
              }} />
            ))}

            {/* Filter tag */}
            <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', opacity: 0.8 }}>
              {activeFilter.name}
            </div>

            {/* Face detected badge */}
            {ready && (
              <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 8, letterSpacing: 1, color: faceDetected ? 'var(--gold)' : 'var(--muted)', textTransform: 'uppercase', opacity: 0.8 }}>
                {faceDetected ? '◉ face' : '○ no face'}
              </div>
            )}

            {/* Flash */}
            {flash && <div style={{ position: 'absolute', inset: 0, background: 'white', pointerEvents: 'none' }} />}

            {/* Countdown */}
            {countdown && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Special Elite, cursive', fontSize: 100, color: 'var(--gold2)', textShadow: '0 0 30px rgba(201,168,76,0.8)', pointerEvents: 'none' }}>
                {countdown}
              </div>
            )}

            {/* No cam */}
            {error && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--muted)', fontSize: 12, letterSpacing: 2, background: '#0a0908' }}>
                <span style={{ fontSize: 32 }}>📷</span>
                camera not available
              </div>
            )}
          </div>

          <FilterBar active={activeFilter} onChange={setActiveFilter} />

          {/* Download row — lives right under the camera, always visible, no scrolling needed */}
          <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={downloadStrip}
              disabled={frames.length === 0}
              style={downloadBtnStyle(true, frames.length === 0)}
            >
              ↓ download strip
            </button>
            <button
              onClick={downloadSingle}
              disabled={!lastCanvas}
              style={downloadBtnStyle(false, !lastCanvas)}
            >
              ↓ last photo
            </button>
          </div>
        </div>

        {/* Right: controls + overlays + strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Capture */}
          <div style={panelStyle}>
            <div style={labelStyle}>capture</div>

            {/* Stepper for photo count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, border: '1px solid var(--border)', borderRadius: 2, padding: '6px 10px' }}>
              <button
                onClick={() => setStripCount(c => Math.max(1, c - 1))}
                disabled={busy || stripCount === 1}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--gold)',
                  fontSize: 16, cursor: (busy || stripCount === 1) ? 'not-allowed' : 'pointer',
                  opacity: (busy || stripCount === 1) ? 0.3 : 1, padding: '0 8px',
                }}
              >
                −
              </button>
              <span style={{ fontSize: 11, letterSpacing: 1, color: 'var(--cream)' }}>
                {stripCount} photo{stripCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setStripCount(c => Math.min(4, c + 1))}
                disabled={busy || stripCount === 4}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--gold)',
                  fontSize: 16, cursor: (busy || stripCount === 4) ? 'not-allowed' : 'pointer',
                  opacity: (busy || stripCount === 4) ? 0.3 : 1, padding: '0 8px',
                }}
              >
                +
              </button>
            </div>

            <button
              onClick={shoot}
              disabled={busy || !ready}
              style={{
                width: '100%', padding: 14,
                fontFamily: 'Special Elite, cursive', fontSize: 16, letterSpacing: 3,
                border: '1px solid var(--gold)', borderRadius: 2,
                background: 'transparent', color: 'var(--gold2)', cursor: busy ? 'not-allowed' : 'pointer',
                opacity: (!ready || busy) ? 0.3 : 1, transition: 'all 0.2s', marginBottom: 10,
              }}
            >
              [ SHOOT ]
            </button>
            <button onClick={() => setTimerOn(t => !t)} style={ctrlBtn(timerOn)}>
              ⏱ 3s timer — {timerOn ? 'on' : 'off'}
            </button>
            <button onClick={autoStrip} disabled={busy || !ready} style={ctrlBtn(false)}>
              {stripCount === 1 ? '📸 capture photo' : `📸 auto strip × ${stripCount}`}
            </button>
            <button onClick={() => { setFrames([]); setLastCanvas(null) }} disabled={frames.length === 0} style={{ ...ctrlBtn(false), marginBottom: 0 }}>
              ✕ clear strip
            </button>
          </div>

          {/* Face overlays */}
          <div style={panelStyle}>
            <div style={labelStyle}>face filters</div>
            <OverlayPicker active={overlays} onChange={setOverlays} />
          </div>

          {/* Strip */}
          <div style={panelStyle}>
            <div style={labelStyle}>strip</div>
            <Strip frames={frames} stripCount={stripCount} />
          </div>
        </div>
      </div>

      {showPreview && (
        <StripPreview
          frames={frames}
          stripCount={stripCount}
          onRetake={handleRetake}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}