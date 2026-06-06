import React from 'react'

const OVERLAYS = [
  { key: 'sunglasses', label: '🕶 sunglasses' },
  { key: 'hat',        label: '🎩 top hat' },
  { key: 'mustache',   label: '👨 mustache' },
  { key: 'lips',       label: '💄 lip color' },
]

export default function OverlayPicker({ active, onChange }) {
  const toggle = (key) => onChange({ ...active, [key]: !active[key] })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {OVERLAYS.map(o => (
        <button
          key={o.key}
          onClick={() => toggle(o.key)}
          style={{
            padding: '7px 10px',
            fontSize: 10,
            letterSpacing: 1,
            border: `1px solid ${active[o.key] ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 2,
            background: active[o.key] ? 'rgba(201,168,76,0.1)' : 'transparent',
            color: active[o.key] ? 'var(--gold)' : 'var(--muted)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          {o.label}
          <span style={{ float: 'right', opacity: 0.5 }}>{active[o.key] ? '✓' : '+'}</span>
        </button>
      ))}
    </div>
  )
}
