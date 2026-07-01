import { useState } from "react";
import { CONDITIONS, type Condition } from "../../data/conditions";

const CONDITION_ICONS: Record<string, string> = {
  blinded: "👁️", charmed: "💕", deafened: "🔇", exhaustion: "😴",
  frightened: "😨", grappled: "🤝", incapacitated: "⚡", invisible: "👻",
  paralyzed: "🧊", petrified: "🗿", poisoned: "🤢", prone: "⬇️",
  restrained: "⛓️", stunned: "💫", unconscious: "💤",
};

export default function ConditionsPage() {
  const [selected, setSelected] = useState<Condition | null>(null);
  const [query, setQuery] = useState("");

  const filtered = CONDITIONS.filter(c =>
    !query ||
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.summary.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body">
          <div className="search-bar">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search conditions..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
        {filtered.map(cond => (
          <div
            key={cond.id}
            className="card card-hover"
            style={{ cursor: "pointer", borderLeft: `4px solid ${cond.color}` }}
            onClick={() => setSelected(cond.id === selected?.id ? null : cond)}
          >
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>{CONDITION_ICONS[cond.id]}</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "17px", fontWeight: 700, margin: 0, color: cond.color }}>{cond.name}</h3>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {cond.effects.length} effect{cond.effects.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6",
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {cond.summary}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: "520px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: `3px solid ${selected.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "32px" }}>{CONDITION_ICONS[selected.id]}</span>
                <h2 className="modal-title" style={{ fontFamily: "var(--font-title)", color: selected.color }}>{selected.name}</h2>
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "16px" }}>
                {selected.summary}
              </p>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "8px" }}>Effects</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {selected.effects.map((e, i) => (
                    <li key={i} style={{
                      display: "flex", gap: "10px", padding: "9px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px", lineHeight: "1.7", color: "var(--text-primary)",
                    }}>
                      <span style={{ color: selected.color, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>◆</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              {selected.endCondition && (
                <div style={{ background: "rgba(184,150,12,0.08)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "12px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--accent-gold-light)", marginBottom: "4px" }}>Ending the Condition</div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6" }}>{selected.endCondition}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
