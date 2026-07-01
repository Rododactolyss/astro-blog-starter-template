import { useState } from "react";
import { SPELLS, SPELL_SCHOOLS, type Spell } from "../../data/spells";
import { CLASSES } from "../../data/classes";

export default function SpellList() {
  const [query, setQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterSchool, setFilterSchool] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [selected, setSelected] = useState<Spell | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "level">("level");

  const filtered = SPELLS.filter(s => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) &&
      !s.school.toLowerCase().includes(query.toLowerCase()) &&
      !s.description.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterLevel !== null && s.level !== filterLevel) return false;
    if (filterSchool && s.school !== filterSchool) return false;
    if (filterClass && !s.classes.includes(filterClass)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "level") return a.level - b.level || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body">
          <div className="search-bar" style={{ marginBottom: "12px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search spells by name, school, or description..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* Level filter */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Level</div>
              <div className="filter-row">
                <button className={`filter-chip ${filterLevel === null ? "active" : ""}`} onClick={() => setFilterLevel(null)}>All</button>
                <button className={`filter-chip ${filterLevel === 0 ? "active" : ""}`} onClick={() => setFilterLevel(filterLevel === 0 ? null : 0)}>Cantrip</button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                  <button key={l} className={`filter-chip ${filterLevel === l ? "active" : ""}`} onClick={() => setFilterLevel(filterLevel === l ? null : l)}>{l}</button>
                ))}
              </div>
            </div>

            {/* School filter */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>School</div>
              <div className="filter-row">
                <button className={`filter-chip ${filterSchool === null ? "active" : ""}`} onClick={() => setFilterSchool(null)}>All</button>
                {SPELL_SCHOOLS.map(s => (
                  <button key={s} className={`filter-chip ${filterSchool === s ? "active" : ""}`} onClick={() => setFilterSchool(filterSchool === s ? null : s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* Class filter */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Class</div>
              <div className="filter-row">
                <button className={`filter-chip ${filterClass === null ? "active" : ""}`} onClick={() => setFilterClass(null)}>All</button>
                {CLASSES.filter(c => c.spellcaster).map(c => (
                  <button key={c.id} className={`filter-chip ${filterClass === c.name ? "active" : ""}`} onClick={() => setFilterClass(filterClass === c.name ? null : c.name)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {filtered.length} spell{filtered.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className={`btn btn-sm ${sortBy === "level" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("level")}>Sort by Level</button>
              <button className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("name")}>Sort by Name</button>
            </div>
          </div>
        </div>
      </div>

      {/* Spell Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
        {filtered.map(spell => (
          <div
            key={spell.id}
            className="spell-card"
            onClick={() => setSelected(spell.id === selected?.id ? null : spell)}
          >
            <div className="spell-card-header">
              <div className={`spell-level-badge ${spell.level === 0 ? "cantrip" : `lvl${spell.level}`}`}>
                {spell.level === 0 ? "C" : spell.level}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{spell.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{spell.castingTime} · {spell.range}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
                <span className={`spell-school-badge school-${spell.school}`}>{spell.school}</span>
                <div style={{ display: "flex", gap: "3px" }}>
                  {spell.concentration && <span className="concentration-badge">C</span>}
                  {spell.ritual && <span className="ritual-badge">R</span>}
                </div>
              </div>
            </div>
            <div style={{ padding: "8px 12px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {spell.description}
              </div>
              <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {spell.damage && (
                  <span className="badge badge-red">{spell.damage.dice} {spell.damage.type}</span>
                )}
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Duration: {spell.duration}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No spells match your filters.
          </div>
        )}
      </div>

      {/* Spell Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.name}</h2>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span className="badge badge-gold">
                  {selected.level === 0 ? "Cantrip" : `${selected.level === 1 ? "1st" : selected.level === 2 ? "2nd" : selected.level === 3 ? "3rd" : `${selected.level}th`}-Level Spell`}
                </span>
                <span className={`spell-school-badge school-${selected.school}`}>{selected.school}</span>
                {selected.concentration && <span className="concentration-badge">Concentration</span>}
                {selected.ritual && <span className="ritual-badge">Ritual</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                {[
                  { label: "Casting Time", value: selected.castingTime },
                  { label: "Range", value: selected.range },
                  { label: "Components", value: selected.components },
                  { label: "Duration", value: selected.duration },
                ].map(item => (
                  <div key={item.label} style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {selected.damage && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <span className="badge badge-red">💥 {selected.damage.dice} {selected.damage.type} damage</span>
                </div>
              )}

              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-primary)", marginBottom: "16px" }}>
                {selected.description}
              </p>

              {selected.higherLevels && (
                <div style={{ background: "rgba(184, 150, 12, 0.08)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--accent-gold-light)", marginBottom: "6px" }}>
                    At Higher Levels
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.7" }}>{selected.higherLevels}</p>
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  <strong>Classes:</strong> {selected.classes.join(", ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
