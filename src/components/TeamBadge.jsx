import { TEAM_COLORS } from '../constants.js';

export default function TeamBadge({ abbr, size = 36 }) {
  const color = TEAM_COLORS[abbr] || "#8B5E1A";
  return (
    <span style={{
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: size * 0.5,
      fontWeight: 400,
      color: color,
      letterSpacing: 1,
      lineHeight: 1,
      display: "inline-block",
      flexShrink: 0,
      textShadow: `0 1px 3px rgba(0,0,0,0.15)`,
    }}>
      {abbr}
    </span>
  );
}
