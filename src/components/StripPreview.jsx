import React, { useEffect, useRef, useState } from 'react'
import { FRAME_CONFIG, buildFramedStrip } from '../utils/frameSlots'

export default function StripPreview({ frames, stripCount, onRetake, onClose }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const resultCanvasRef = useRef(null)

  useEffect(() => {
    const config = FRAME_CONFIG[stripCount]
    if (!config) {
      setErrorMsg(`No frame config for ${stripCount} photos`)
      return
    }

    const frameImg = new Image()

    frameImg.onload = () => {
      try {
        const result = buildFramedStrip(frames, stripCount, frameImg)
        resultCanvasRef.current = result

        const displayCanvas = canvasRef.current
        if (displayCanvas) {
          displayCanvas.width = result.width
          displayCanvas.height = result.height
          displayCanvas.getContext('2d').drawImage(result, 0, 0)
        }
        setReady(true)
      } catch (err) {
        console.error('[StripPreview] Error while compositing:', err)
        setErrorMsg('Compositing failed: ' + err.message)
      }
    }

    frameImg.onerror = () => {
      setErrorMsg(`Could not load frame image: ${config.src} (check it exists in /public)`)
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
      zIndex: 1000, padding: '2rem', gap: '1.5rem',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>
        your strip
      </div>

      <div style={{
        maxHeight: '70vh', minHeight: 200, minWidth: 200,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        opacity: ready ? 1 : 0.5, transition: 'opacity 0.3s',
      }}>
        {errorMsg ? (
          <div style={{
            border: '1px solid var(--border2)', borderRadius: 2, background: '#000',
            padding: '2rem', color: '#e05555', fontSize: 12, textAlign: 'center', maxWidth: 300, lineHeight: 1.6,
          }}>
            ⚠ {errorMsg}
            <br /><br />
            <span style={{ color: 'var(--muted)', fontSize: 10 }}>Check browser console for full details.</span>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Printer slot — the strip visually feeds out from underneath this */}
            <div style={{
              position: 'absolute', top: -14, left: -6, right: -6, height: 14,
              background: 'linear-gradient(180deg, #2a2620, #0c0a08)',
              borderRadius: '4px 4px 0 0',
              border: '1px solid var(--border2)',
              borderBottom: 'none',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.9)',
              zIndex: 2,
            }}>
              <div style={{
                position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                width: '40%', height: 2, background: 'rgba(0,0,0,0.8)', borderRadius: 1,
              }} />
            </div>

            <canvas
              ref={canvasRef}
              className="strip-print"
              style={{
                maxHeight: '70vh', maxWidth: '90vw', display: 'block',
                border: '1px solid var(--border2)', borderTop: 'none',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              }}
            />
          </div>
        )}
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