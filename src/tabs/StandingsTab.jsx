import { useState, useEffect } from "react";
import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, TEAM_COLORS } from '../constants.js';

// ── Seed data from live standings we just pulled ─────────────────────────────
const SEED_EAST = [
  { rank:  1, team: "DET", name: "Detroit Pistons",        w: 60, l: 22, pct: 0.732 },
  { rank:  2, team: "BOS", name: "Boston Celtics",         w: 56, l: 26, pct: 0.683 },
  { rank:  3, team: "NYK", name: "New York Knicks",        w: 53, l: 29, pct: 0.646 },
  { rank:  4, team: "CLE", name: "Cleveland Cavaliers",    w: 52, l: 30, pct: 0.634 },
  { rank:  5, team: "TOR", name: "Toronto Raptors",        w: 46, l: 36, pct: 0.561 },
  { rank:  6, team: "ATL", name: "Atlanta Hawks",          w: 46, l: 36, pct: 0.561 },
  { rank:  7, team: "ORL", name: "Orlando Magic",          w: 45, l: 37, pct: 0.549 },
  { rank:  8, team: "PHI", name: "Philadelphia 76ers",     w: 45, l: 37, pct: 0.549 },
  { rank:  9, team: "CHA", name: "Charlotte Hornets",      w: 44, l: 38, pct: 0.537 },
  { rank: 10, team: "MIA", name: "Miami Heat",             w: 43, l: 39, pct: 0.524 },
  { rank: 11, team: "MIL", name: "Milwaukee Bucks",        w: 32, l: 50, pct: 0.390 },
  { rank: 12, team: "CHI", name: "Chicago Bulls",          w: 31, l: 51, pct: 0.378 },
  { rank: 13, team: "BKN", name: "Brooklyn Nets",          w: 20, l: 62, pct: 0.244 },
  { rank: 14, team: "IND", name: "Indiana Pacers",         w: 19, l: 63, pct: 0.232 },
  { rank: 15, team: "WAS", name: "Washington Wizards",     w: 17, l: 65, pct: 0.207 },
];

const SEED_WEST = [
  { rank:  1, team: "OKC", name: "Oklahoma City Thunder",  w: 64, l: 18, pct: 0.780 },
  { rank:  2, team: "SAS", name: "San Antonio Spurs",      w: 62, l: 20, pct: 0.756 },
  { rank:  3, team: "DEN", name: "Denver Nuggets",         w: 54, l: 28, pct: 0.659 },
  { rank:  4, team: "LAL", name: "Los Angeles Lakers",     w: 53, l: 29, pct: 0.646 },
  { rank:  5, team: "HOU", name: "Houston Rockets",        w: 52, l: 30, pct: 0.634 },
  { rank:  6, team: "MIN", name: "Minnesota Timberwolves", w: 49, l: 33, pct: 0.598 },
  { rank:  7, team: "POR", name: "Portland Trail Blazers", w: 42, l: 40, pct: 0.512 },
  { rank:  8, team: "LAC", name: "LA Clippers",            w: 42, l: 40, pct: 0.512 },
  { rank:  9, team: "PHX", name: "Phoenix Suns",           w: 45, l: 37, pct: 0.549 },
  { rank: 10, team: "GSW", name: "Golden State Warriors",  w: 37, l: 45, pct: 0.451 },
  { rank: 11, team: "DAL", name: "Dallas Mavericks",       w: 26, l: 56, pct: 0.317 },
  { rank: 12, team: "NOP", name: "New Orleans Pelicans",   w: 26, l: 56, pct: 0.317 },
  { rank: 13, team: "MEM", name: "Memphis Grizzlies",      w: 25, l: 57, pct: 0.305 },
  { rank: 14, team: "SAC", name: "Sacramento Kings",       w: 22, l: 60, pct: 0.268 },
  { rank: 15, team: "UTA", name: "Utah Jazz",              w: 22, l: 60, pct: 0.268 },
];

function StandingsTable({ rows, seasonType }) {
  const isOffseason = seasonType === "offseason" || seasonType === "summer";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "4px 12px",
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
        color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase",
      }}>
        <span style={{ width: 22 }}>#</span>
        <span style={{ width: 48 }}></span>
        <span style={{ flex: 1 }}>Team</span>
        <span style={{ width: 32, textAlign: "center" }}>W</span>
        <span style={{ width: 32, textAlign: "center" }}>L</span>
        <span style={{ width: 48, textAlign: "center" }}>PCT</span>
      </div>

      {rows.map((row, i) => {
        const pct       = row.pct ? row.pct.toFixed(3).replace(/^0/, "") : ".000";
        const isMyTeam  = MY_TEAMS.includes(row.team);
        const teamColor = TEAM_COLORS[row.team] || "#8B5E1A";
        const isPlayoffLine = !isOffseason && i === 5;
        const isPlayInLine  = !isOffseason && i === 9;

        return (
          <div key={row.team}>
            {isPlayoffLine && (
              <div style={{ height: 1, background: "#16a34a40", margin: "4px 0", position: "relative" }}>
                <span style={{ position: "absolute", right: 0, top: -8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: "#16a34a", letterSpacing: 1 }}>PLAY-IN →</span>
              </div>
            )}
            {isPlayInLine && (
              <div style={{ height: 1, background: "#CE114140", margin: "4px 0", position: "relative" }}>
                <span style={{ position: "absolute", right: 0, top: -8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: "#CE1141", letterSpacing: 1 }}>LOTTERY →</span>
              </div>
            )}
            <div className={isMyTeam ? "glass" : ""} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8,
              background: isMyTeam ? undefined : i % 2 === 0 ? "rgba(200,137,58,0.06)" : "transparent",
              border: isMyTeam ? `1px solid ${teamColor}40` : "1px solid transparent",
            }}>
              <span style={{ width: 22, fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: isMyTeam ? teamColor : "#8B7355", textAlign: "center" }}>{row.rank}</span>
              <TeamBadge abbr={row.team} size={34} />
              <span style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: isMyTeam ? 700 : 600, fontSize: 15, color: isMyTeam ? teamColor : "#3D2B10" }}>
                {row.name}
                {isMyTeam && <span style={{ marginLeft: 6, fontSize: 11, color: teamColor }}>★</span>}
              </span>
              <span style={{ width: 32, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#3D2B10" }}>{row.w}</span>
              <span style={{ width: 32, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#8B7355" }}>{row.l}</span>
              <span style={{ width: 48, textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: "#6b5c45" }}>{pct}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StandingsTab() {
  const [conf,        setConf]        = useState("east");
  const [east,        setEast]        = useState(SEED_EAST);
  const [west,        setWest]        = useState(SEED_WEST);
  const [seasonLabel, setSeasonLabel] = useState("2025–26 Final Regular Season");
  const [seasonType,  setSeasonType]  = useState("regular");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetch("/api/standings")
      .then(r => r.json())
      .then(data => {
        if (data.east?.length) setEast(data.east);
        if (data.west?.length) setWest(data.west);

        // Label changes based on season type
        const type = data.seasonType || 2;
        if (type === 1) {
          setSeasonLabel("Preseason");
          setSeasonType("preseason");
        } else if (type === 2) {
          setSeasonLabel(`${data.season || "2025–26"} Regular Season`);
          setSeasonType("regular");
        } else if (type === 3) {
          setSeasonLabel(`${data.season || "2025–26"} Playoffs`);
          setSeasonType("playoffs");
        } else {
          setSeasonLabel("Summer League");
          setSeasonType("summer");
        }
        setLastUpdated(new Date());
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 1.5, textTransform: "uppercase" }}>
        {seasonLabel} Standings
      </div>

      {/* Conference toggle */}
      <div className="glass" style={{ display: "flex", borderRadius: 10, overflow: "hidden", padding: 3, gap: 3 }}>
        {["east", "west"].map(c => (
          <button key={c} onClick={() => setConf(c)} style={{
            flex: 1, background: conf === c ? "#E8621A" : "transparent",
            border: "none", borderRadius: 8, padding: "9px 0", cursor: "pointer",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 1,
            color: conf === c ? "#fff" : "#8B7355", transition: "all 0.2s",
          }}>
            {c === "east" ? "Eastern" : "Western"}
          </button>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 12, padding: "12px 4px" }}>
        <StandingsTable rows={conf === "east" ? east : west} seasonType={seasonType} />
      </div>

      {lastUpdated && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", textAlign: "center" }}>
          Updated {lastUpdated.toLocaleTimeString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", minute: "2-digit" })} ARG
        </div>
      )}
    </div>
  );
}
