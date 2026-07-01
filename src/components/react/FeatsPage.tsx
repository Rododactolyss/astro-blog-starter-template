import { useState } from "react";
import { FEATS, type Feat } from "../../data/feats";

export default function FeatsPage() {
  const [query, setQuery] = useState("");
  const [prereqFilter, setPrereqFilter] = useState<"any" | "none" | "has">("any");
  const [selected, setSelected] = useState<Feat | null>(null);

  const filtered = FEATS.filter(f => {
    if (query && !f.name.toLowerCase().includes(query.toLowerCase()) &&
      !f.description.toLowerCase().includes(query.toLowerCase()) &&
      !f.benefits.some(b => b.toLowerCase().includes(query.toLowerCase()))) return false;
    if (prereqFilter === "none" && f.prerequisite !== "None") return false;
    if (prereqFilter === "has" && f.prerequisite === "None") return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body">
          <div className="search-bar" style={{ marginBottom: "12px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search feats by name or effect..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Prerequisite</div>
              <div className="filter-row">
                <button className={`filter-chip ${prereqFilter === "any" ? "active" : ""}`} onClick={() => setPrereqFilter("any")}>All</button>
                <button className={`filter-chip ${prereqFilter === "none" ? "active" : ""}`} onClick={() => setPrereqFilter("none")}>None Required</button>
                <button className={`filter-chip ${prereqFilter === "has" ? "active" : ""}`} onClick={() => setPrereqFilter("has")}>Has Prerequisite</button>
              </div>
            </div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginLeft: "auto" }}>
              {filtered.length} feat{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Feat Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
        {filtered.map(feat => (
          <div
            key={feat.id}
            className="card card-hover"
            style={{ cursor: "pointer" }}
            onClick={() => setSelected(feat.id === selected?.id ? null : feat)}
          >
            <div className="card-header">
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "17px", fontWeight: 700, margin: 0 }}>{feat.name}</h3>
                {feat.prerequisite !== "None" && (
                  <div style={{ fontSize: "11px", color: "var(--accent-gold-light)", marginTop: "2px" }}>
                    Requires: {feat.prerequisite}
                  </div>
                )}
              </div>
              {feat.prerequisite === "None" && (
                <span className="badge badge-green" style={{ fontSize: "10px" }}>No Prereq</span>
              )}
            </div>
            <div className="card-body">
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6",
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {feat.description}
              </p>
              {feat.benefits.length > 0 && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                  {feat.benefits.length} benefit{feat.benefits.length !== 1 ? "s" : ""} — click for full details
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No feats match your search.
          </div>
        )}
      </div>

      {/* Feat Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: "560px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontFamily: "var(--font-title)" }}>{selected.name}</h2>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Prerequisite</div>
                <div style={{ fontSize: "14px", color: selected.prerequisite === "None" ? "var(--text-secondary)" : "var(--accent-gold-light)", fontWeight: selected.prerequisite !== "None" ? 600 : 400 }}>
                  {selected.prerequisite}
                </div>
              </div>

              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-primary)", marginBottom: "16px" }}>
                {selected.description}
              </p>

              {selected.benefits.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "8px" }}>Benefits</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {selected.benefits.map((b, i) => (
                      <li key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px", lineHeight: "1.7", color: "var(--text-primary)" }}>
                        <span style={{ color: "var(--accent-gold-light)", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>◆</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
