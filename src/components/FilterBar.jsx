import React from 'react'

const FILTERS = [
  { name: 'normal',  css: 'none' },
  { name: 'mono',    css: 'grayscale(1) contrast(1.1)' },
  { name: 'warm',    css: 'sepia(0.55) saturate(1.3) brightness(1.05)' },
  { name: 'cool',    css: 'hue-rotate(180deg) saturate(0.75) brightness(1.1)' },
  { name: 'vivid',   css: 'saturate(2) contrast(1.1)' },
  { name: 'fade',    css: 'contrast(0.78) brightness(1.18) saturate(0.65)' },
  { name: 'noir',    css: 'grayscale(1) contrast(1.5) brightness(0.8)' },
  { name: 'lomo',    css: 'contrast(1.35) saturate(1.5) hue-rotate(-12deg)' },
  { name: 'golden',  css: 'sepia(0.8) hue-rotate(-10deg) saturate(1.6) brightness(1.1)' },
]

export { FILTERS }

export default function FilterBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
      {FILTERS.map(f => (
        <button
          key={f.name}
          onClick={() => onChange(f)}
          style={{
            padding: '5px 10px',
            fontSize: 9,
            letterSpacing: 2,
            textTransform: 'uppercase',
            border: `1px solid ${active?.name === f.name ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 2,
            background: active?.name === f.name ? 'rgba(201,168,76,0.08)' : 'transparent',
            color: active?.name === f.name ? 'var(--gold)' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {f.name}
        </button>
      ))}
    </div>
  )
}
