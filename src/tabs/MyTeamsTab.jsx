import { useState, useEffect } from "react";
import TeamBadge from '../components/TeamBadge.jsx';
import { TEAM_META, TEAM_COLORS } from '../constants.js';

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function NewsItem({ article }) {
  return (
    <a href={article.link || "#"} target="_blank" rel="noopener noreferrer" style={{
      display: "block", padding: "10px 12px", borderRadius: 8,
      background: "rgba(200,137,58,0.08)", border: "1px solid rgba(200,137,58,0.15)",
      textDecoration: "none", marginBottom: 6,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
        fontWeight: 700, color: "#3D2B10", lineHeight: 1.3, marginBottom: 3,
      }}>
        {article.headline}
      </div>
      {article.description && (
        <div style={{
          fontFamily: "'Barlow', sans-serif", fontSize: 12,
          color: "#6b5c45", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {article.description}
        </div>
      )}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
        color: "#8B7355", marginTop: 4,
      }}>
        {timeAgo(article.published)} · ESPN
      </div>
    </a>
  );
}

function TeamCard({ abbr, news, loading }) {
  const meta  = TEAM_META[abbr];
  const color = TEAM_COLORS[abbr] || meta.color;
  return (
    <div className="glass" style={{
      borderRadius: 14, padding: 16, overflow: "hidden",
      position: "relative", border: `1.5px solid ${color}40`,
      boxShadow: `0 0 20px ${color}15`, marginBottom: 14,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${color}, ${meta.accent || color})`,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, marginTop: 4 }}>
        <TeamBadge abbr={abbr} size={52} />
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color, lineHeight: 1 }}>
            {meta.name}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355", marginTop: 2 }}>
            Latest News
          </div>
        </div>
      </div>
      {loading && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#8B7355", padding: "8px 0" }}>
          Loading news…
        </div>
      )}
      {!loading && news.length === 0 && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#8B7355", padding: "8px 0" }}>
          No recent news available
        </div>
      )}
      {!loading && news.map((a, i) => <NewsItem key={i} article={a} />)}
    </div>
  );
}

export default function MyTeamsTab() {
  const [news,    setNews]    = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const res  = await fetch("/api/news");
        if (!res.ok) throw new Error(`News API ${res.status}`);
        const data = await res.json();
        setNews(data.teams || {});
      } catch (e) {
        console.warn("News fetch failed:", e.message);
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {Object.keys(TEAM_META).map(abbr => (
        <TeamCard key={abbr} abbr={abbr} news={news[abbr] || []} loading={loading} />
      ))}
    </div>
  );
}
