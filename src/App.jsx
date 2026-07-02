import { useState } from "react";
import TodayTab     from "./tabs/TodayTab.jsx";
import MyTeamsTab   from "./tabs/MyTeamsTab.jsx";
import BracketTab   from "./tabs/BracketTab.jsx";
import StandingsTab from "./tabs/StandingsTab.jsx";
import { useLiveGames } from "./hooks/useLiveGames.js";
import { TEAM_META, NBA_DRAFT_LOTTERY, NBA_DRAFT, SUMMER_LEAGUE_START } from "./constants.js";

const SEED_GAMES = [];

const TABS = [
  { id: "today",     label: "Today",     icon: "🏀" },
  { id: "myteams",  label: "My Teams",  icon: "⭐" },
  { id: "bracket",  label: "Bracket",   icon: "🏆" },
  { id: "standings",label: "Standings", icon: "📊" },
];

// ── Countdown badge ──────────────────────────────────────────────────────────
function CountdownBadge({ label, targetDate, color }) {
  const days = Math.ceil((targetDate - Date.now()) / 86400000);
  if (days <= 0) return null;
  return (
    <div style={{
      background: `${color}22`, border: `2px solid ${color}66`,
      borderRadius: 10, padding: "4px 10px", textAlign: "center", minWidth: 52,
    }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color, lineHeight: 1, letterSpacing: 1 }}>{days}d</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// ── Desktop sidebar ──────────────────────────────────────────────────────────
function Sidebar({ tab, setTab }) {
  return (
    <aside style={{
      width: 210, flexShrink: 0,
      display: "flex", flexDirection: "column",
      gap: 6, paddingTop: 8, paddingRight: 16,
    }}>
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", padding: "13px 16px", borderRadius: 12,
            cursor: "pointer", border: "none",
            background: active ? "rgba(232,98,26,0.92)" : "rgba(255,248,236,0.70)",
            boxShadow: active ? "0 2px 12px rgba(232,98,26,0.35)" : "0 1px 4px rgba(100,50,0,0.08)",
            backdropFilter: "blur(8px)", transition: "all 0.18s ease",
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18,
              fontWeight: 700, letterSpacing: 0.5,
              color: active ? "#fff" : "#3D2B10", textTransform: "uppercase",
            }}>{t.label}</span>
          </button>
        );
      })}
    </aside>
  );
}

// ── Mobile bottom tab bar ────────────────────────────────────────────────────
function BottomTabs({ tab, setTab }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(26,15,0,0.95)", backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(200,137,58,0.3)",
      display: "flex", alignItems: "stretch", height: 62,
    }}>
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer",
            borderTop: active ? "2px solid #E8621A" : "2px solid transparent",
            transition: "all 0.15s ease",
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
              fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
              color: active ? "#E8621A" : "rgba(200,137,58,0.6)",
            }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("today");
  const { games, loading, updated, refresh } = useLiveGames(SEED_GAMES);

  // Detect mobile: screen width < 768px
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      {/* Inject responsive style rules */}
      <style>{`
        .desktop-sidebar { display: flex; }
        .bottom-tabs     { display: none; }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .bottom-tabs     { display: flex !important; }
          .page-body       { padding-bottom: 74px !important; }
          .content-area    { padding-left: 0 !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <header style={{
          background: "rgba(26,15,0,0.88)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(200,137,58,0.3)",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🏀</span>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 3, color: "#E8621A", lineHeight: 1 }}>
                JJ HOOPS
              </h1>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(200,137,58,0.7)", letterSpacing: 2 }}>
                NBA PLAYOFFS 2026
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* My teams — hidden on very small screens */}
            <div style={{ display: "flex", gap: 10 }}>
              {Object.entries(TEAM_META).map(([abbr, m]) => (
                <span key={abbr} style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 17,
                  color: m.color, letterSpacing: 1.5,
                  textShadow: "0 1px 6px rgba(0,0,0,0.6)",
                }}>{abbr}</span>
              ))}
            </div>

<CountdownBadge label="Summer League" targetDate={SUMMER_LEAGUE_START} color="#FFB800" />
<CountdownBadge label="Draft"   targetDate={NBA_DRAFT}          color="#FDB927" />

            <button onClick={refresh} disabled={loading} style={{
              background: "rgba(200,137,58,0.18)", border: "1.5px solid rgba(200,137,58,0.4)",
              color: "#E8621A", borderRadius: 8, padding: "6px 12px",
              cursor: loading ? "default" : "pointer",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
              opacity: loading ? 0.5 : 1,
            }}>
              {loading ? "…" : "↻"}
            </button>
          </div>
        </header>

        {/* ── Page body ── */}
        <div className="page-body" style={{
          display: "flex", flex: 1, width: "100%",
          maxWidth: 1200, margin: "0 auto",
          padding: "16px 16px 40px",
          gap: 8,
        }}>
          {/* Desktop sidebar */}
          <div className="desktop-sidebar">
            <Sidebar tab={activeTab} setTab={setActiveTab} />
          </div>

          {/* Main content */}
          <main className="content-area" style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
            <div style={{ marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1.5, color: "#3D2B10" }}>
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              {updated && (
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355" }}>
                  Live · {updated.toLocaleTimeString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", minute: "2-digit" })} ARG
                </div>
              )}
            </div>

            {activeTab === "today"     && <TodayTab games={games} loading={loading} />}
            {activeTab === "myteams"   && <MyTeamsTab />}
            {activeTab === "bracket"   && <BracketTab />}
            {activeTab === "standings" && <StandingsTab />}
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <div className="bottom-tabs" style={{ display: "none" }}>
          <BottomTabs tab={activeTab} setTab={setActiveTab} />
        </div>
      </div>
    </>
  );
}
