import React from 'react'
import Camera from './components/Camera'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem 3rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Special Elite, cursive', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--gold2)', letterSpacing: 6, lineHeight: 1, textShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
          ✦ <span style={{ color: 'var(--cream)' }}>PHOTO</span>BOOTH ✦
        </h1>
        <p style={{ fontSize: 10, letterSpacing: 4, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 6 }}>
          strike a pose · face filters · take home memories
        </p>
        <div style={{ width: 120, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '12px auto 0' }} />
      </header>

      <Camera />
    </div>
  )
}
