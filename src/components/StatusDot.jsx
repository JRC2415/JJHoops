export default function StatusDot({ status }) {
  const cfg = {
    inprogress: { color: "#16a34a", label: "LIVE",     pulse: true  },
    scheduled:  { color: "#E8621A", label: "UPCOMING", pulse: false },
    closed:     { color: "#6b5c45", label: "FINAL",    pulse: false },
  }[status] || { color: "#6b5c45", label: status, pulse: false };

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: cfg.color, display: "inline-block",
        boxShadow: cfg.pulse ? `0 0 0 3px ${cfg.color}40` : "none",
        animation: cfg.pulse ? "pulse 1.4s ease-in-out infinite" : "none",
      }} />
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 12, fontWeight: 700, color: cfg.color, letterSpacing: 1.5,
      }}>
        {cfg.label}
      </span>
    </span>
  );
}
