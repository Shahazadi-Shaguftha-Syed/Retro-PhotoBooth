import React, { useEffect, useRef, useState } from 'react'
import { FRAME_CONFIG, buildFramedStrip } from '../utils/frameSlots'

export default function StripPreview({ frames, stripCount, onRetake, onClose }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const resultCanvasRef = useRef(null)

  useEffect(() => {
    const config = FRAME_CONFIG[stripCount]
    if (!config) return

    const frameImg = new Image()
    frameImg.onload = () => {
      const result = buildFramedStrip(frames, stripCount, frameImg)
      resultCanvasRef.current = result

      const displayCanvas = canvasRef.current
      if (displayCanvas) {
        displayCanvas.width = result.width
        displayCanvas.height = result.height
        displayCanvas.getContext('2d').drawImage(result, 0, 0)
      }
      setReady(true)
    }
    frameImg.src = config.src
  }, [frames, stripCount])

  const handleDownload = () => {
    if (!resultCanvasRef.current) return
    const a = document.createElement('a')
    a.download = 'photobooth-strip.png'
    a.href = resultCanvasRef.current.toDataURL('image/png')
    a.click()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '2rem', gap: '1.25rem',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>
        your strip
      </div>

      <div style={{
        maxHeight: '70vh', border: '1px solid var(--border2)', borderRadius: 2,
        background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: ready ? 1 : 0.3, transition: 'opacity 0.3s',
      }}>
        <canvas ref={canvasRef} style={{ maxHeight: '70vh', maxWidth: '90vw', display: 'block' }} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleDownload}
          disabled={!ready}
          style={{
            padding: '12px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            border: '1px solid var(--gold)', borderRadius: 2, background: 'transparent',
            color: 'var(--gold)', cursor: ready ? 'pointer' : 'not-allowed',
            opacity: ready ? 1 : 0.4,
          }}
        >
          ↓ download
        </button>
        <button
          onClick={onRetake}
          style={{
            padding: '12px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            border: '1px solid var(--border2)', borderRadius: 2, background: 'transparent',
            color: 'var(--cream)', cursor: 'pointer',
          }}
        >
          ↺ retake
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '12px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            border: '1px solid var(--border)', borderRadius: 2, background: 'transparent',
            color: 'var(--muted)', cursor: 'pointer',
          }}
        >
          ✕ close
        </button>
      </div>
    </div>
  )
}