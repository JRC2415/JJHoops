import GameCard from '../components/GameCard.jsx';
import TeamBadge from '../components/TeamBadge.jsx';
import { TEAM_COLORS } from '../constants.js';

export default function TodayTab({ games, loading }) {
  // Sort: live first, then scheduled, then final
  const ORDER = { inprogress: 0, scheduled: 1, closed: 2 };
  const sorted = [...games].sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3));

  const active   = sorted.filter(g => g.status === "inprogress" || g.status === "scheduled");
  const finished = sorted.filter(g => g.status === "closed");

  // Argentina date
  const argToday = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#6b5c45", fontWeight: 600, letterSpacing: 1 }}>
        {argToday.toUpperCase()} · BUENOS AIRES TIME
      </div>

      {loading && active.length === 0 && (
        <div className="glass" style={{ textAlign: "center", color: "#8B7355", padding: "32px 0", fontSize: 15, borderRadius: 12 }}>
          Loading live scores…
        </div>
      )}

      {!loading && active.length === 0 && finished.length === 0 && (
        <div className="glass" style={{ textAlign: "center", color: "#8B7355", padding: "32px 0", fontSize: 15, borderRadius: 12 }}>
          No games today
        </div>
      )}

      {active.map(g => <GameCard key={g.id} game={g} />)}

      {finished.length > 0 && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
            Final Scores
          </div>
          {finished.map(g => {
            const awayWin = (g.awayScore ?? 0) > (g.homeScore ?? 0);
            return (
              <div key={g.id} className="glass" style={{
                borderRadius: 10, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"
              }}>
                <TeamBadge abbr={g.away} size={36} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 23, color: awayWin ? TEAM_COLORS[g.away] : "#8B7355" }}>{g.awayScore}</span>
                <span style={{ color: "#C8893A", fontWeight: 700 }}>–</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 23, color: !awayWin ? TEAM_COLORS[g.home] : "#8B7355" }}>{g.homeScore}</span>
                <TeamBadge abbr={g.home} size={36} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355", flex: 1, textAlign: "right" }}>{g.title}</span>
                {g.gameTime && (
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355", width: "100%", textAlign: "right" }}>
                    🕐 {g.gameTime} ARG
                  </span>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
