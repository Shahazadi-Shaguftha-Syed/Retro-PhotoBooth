const OVERLAYS = [
  { id: null,         label: "none",        emoji: "🚫" },
  { id: "sunglasses", label: "sunglasses",  emoji: "🕶️" },
  { id: "hat",        label: "top hat",     emoji: "🎩" },
  { id: "mask",       label: "mask",        emoji: "😷" },
  { id: "clown",      label: "clown nose",  emoji: "🤡" },
];

export default function Controls({
  busy, timerOn, hasFrames,
  onShoot, onAutoStrip, onToggleTimer, onClear,
  activeOverlay, onOverlayChange,
}) {
  return (
    <div className="controls-panel panel">
      <div className="panel-label">capture</div>
      <button className="shoot-btn" onClick={onShoot} disabled={busy}>
        {busy ? "..." : "[ SHOOT ]"}
      </button>

      <div style={{ height: 10 }} />

      <button
        className={`ctrl-btn ${timerOn ? "on" : ""}`}
        onClick={onToggleTimer}
      >
        ⏱ 3s countdown — {timerOn ? "on" : "off"}
      </button>
      <button className="ctrl-btn" onClick={onAutoStrip} disabled={busy}>
        📸 auto strip × 4
      </button>
      <button className="ctrl-btn" onClick={onClear} disabled={!hasFrames}>
        ✕ clear strip
      </button>

      <div className="panel-label" style={{ marginTop: 16 }}>face filters</div>
      <div className="overlay-grid">
        {OVERLAYS.map(o => (
          <button
            key={String(o.id)}
            className={`overlay-btn ${activeOverlay === o.id ? "on" : ""}`}
            onClick={() => onOverlayChange(o.id)}
            title={o.label}
          >
            <span className="overlay-emoji">{o.emoji}</span>
            <span className="overlay-label">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
