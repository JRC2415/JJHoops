import TeamBadge from '../components/TeamBadge.jsx';
import { TEAM_META, TEAM_COLORS } from '../constants.js';

const TEAM_CONTEXT = {
  CHI: {
    status: "Not in Playoffs",
    statusColor: "#CE1141",
    summary: "The Bulls did not qualify for the 2025–26 NBA Playoffs. They finished 12th in the East at 33–49. Check back next season.",
    stats: [
      { label: "Conference", val: "Eastern" },
      { label: "Fin. Record", val: "33–49" },
      { label: "Conference Rank", val: "#12 East" },
      { label: "Status", val: "Off-season" },
    ],
  },
  LAL: {
    status: "Conference Semifinals · vs OKC",
    statusColor: "#FDB927",
    summary: "Lakers beat HOU 4–2 in Round 1. Now face the #1 seed OKC Thunder — big underdogs but anything can happen in the playoffs.",
    stats: [
      { label: "Seed",      val: "#4 West"       },
      { label: "Series",    val: "0–0 vs OKC"    },
      { label: "Next Game", val: "May 5 @ OKC"   },
      { label: "Win Prob",  val: "9.1%"          },
    ],
  },
  DEN: {
    status: "Eliminated · Round 1",
    statusColor: "#FEC524",
    summary: "Denver fell to the Minnesota Timberwolves 2–4 in Round 1. Jokić played well but the Wolves were relentless. Back next year.",
    stats: [
      { label: "Seed",      val: "#3 West"   },
      { label: "R1 Series", val: "L 2–4"     },
      { label: "Opponent",  val: "Minnesota" },
      { label: "Status",    val: "Eliminated"},
    ],
  },
};

export default function MyTeamsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(TEAM_META).map(([abbr, meta]) => {
        const ctx = TEAM_CONTEXT[abbr];
        return (
          <div key={abbr} className="glass" style={{
            borderRadius: 14, padding: 16, overflow: "hidden", position: "relative",
            border: `1.5px solid ${meta.color}50`,
            boxShadow: `0 0 24px ${meta.color}20`,
          }}>
            {/* Top accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${meta.color}, ${meta.accent || meta.color})` }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, marginTop: 4 }}>
              <TeamBadge abbr={abbr} size={52} />
              <div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 25, letterSpacing: 1,
                  color: meta.color, lineHeight: 1,
                }}>
                  {meta.name}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: ctx.statusColor, marginTop: 2 }}>
                  {ctx.status}
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {ctx.stats.map(s => (
                <div key={s.label} style={{
                  background: "rgba(200,137,58,0.12)", borderRadius: 8, padding: "8px 10px",
                  border: "1px solid rgba(200,137,58,0.2)"
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 21, color: meta.color, marginTop: 2, letterSpacing: 0.5 }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              fontSize: 15, color: "#3D2B10", lineHeight: 1.6,
              background: "rgba(200,137,58,0.08)", borderRadius: 8, padding: "10px 12px",
              border: "1px solid rgba(200,137,58,0.15)"
            }}>
              {ctx.summary}
            </div>
          </div>
        );
      })}
    </div>
  );
}
