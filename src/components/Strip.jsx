import React from 'react'

export default function Strip({ frames }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        frames[i] ? (
          <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 1, overflow: 'hidden', background: '#0a0908', border: '1px solid var(--border)' }}>
            <canvas
              ref={el => { if (el && frames[i]) { el.width = frames[i].width; el.height = frames[i].height; el.getContext('2d').drawImage(frames[i], 0, 0) } }}
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', bottom: 3, right: 5, fontSize: 8, color: 'rgba(201,168,76,0.4)', fontFamily: 'DM Mono, monospace' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        ) : (
          <div key={i} style={{ aspectRatio: '4/3', border: '1px dashed var(--border)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border2)', fontSize: 14 }}>
            —
          </div>
        )
      ))}
    </div>
  )
}
