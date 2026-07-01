import { useState, useEffect, useMemo } from "react";
import { loadSpells, SCHOOLS, type NormSpell } from "../../lib/fivetools";

const SPELL_SCHOOLS = Object.values(SCHOOLS).filter(s => s !== "Psionic");
const SPELL_CLASSES = ["Artificer","Bard","Cleric","Druid","Paladin","Ranger","Sorcerer","Warlock","Wizard"];
const PAGE_SIZE = 30;

function levelOrdinal(n: number) {
  if (n === 0) return "Cantrip";
  return ["","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"][n] + "-level";
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

export default function SpellList() {
  const [all, setAll] = useState<NormSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterSchool, setFilterSchool] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [sortBy, setSortBy] = useState<"level" | "name">("level");
  const [selected, setSelected] = useState<NormSpell | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    loadSpells()
      .then(list => { if (active) { setAll(list); setLoading(false); } })
      .catch(() => { if (active) { setError("Failed to load 5etools spell data. Check your internet connection."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = all.filter(s => {
      if (q && !s.name.toLowerCase().includes(q) && !s.entries.some(e => e.toLowerCase().includes(q))) return false;
      if (filterLevel !== null && s.level !== filterLevel) return false;
      if (filterSchool && s.school !== filterSchool) return false;
      if (filterClass && !s.classes.includes(filterClass)) return false;
      return true;
    });
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    return list;
  }, [all, query, filterLevel, filterSchool, filterClass, sortBy]);

  useEffect(() => { setPage(1); }, [query, filterLevel, filterSchool, filterClass, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const Skeleton = () => (
    <div className="spell-card" style={{ opacity: 0.4 }}>
      <div className="spell-card-header">
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-secondary)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: "14px", background: "var(--bg-secondary)", borderRadius: "4px", width: "130px", marginBottom: "5px" }} />
          <div style={{ height: "11px", background: "var(--bg-secondary)", borderRadius: "4px", width: "90px" }} />
        </div>
        <div style={{ height: "18px", width: "76px", background: "var(--bg-secondary)", borderRadius: "4px" }} />
      </div>
      <div style={{ padding: "8px 12px" }}>
        <div style={{ height: "12px", background: "var(--bg-secondary)", borderRadius: "4px", width: "100%", marginBottom: "4px" }} />
        <div style={{ height: "12px", background: "var(--bg-secondary)", borderRadius: "4px", width: "80%" }} />
      </div>
    </div>
  );

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body">
          <div className="search-bar" style={{ marginBottom: "12px" }}>
            <span>🔍</span>
            <input type="text" placeholder="Search spells by name or description..." value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Level</div>
              <div className="filter-row">
                <button className={`filter-chip ${filterLevel === null ? "active" : ""}`} onClick={() => setFilterLevel(null)}>All</button>
                <button className={`filter-chip ${filterLevel === 0 ? "active" : ""}`} onClick={() => setFilterLevel(filterLevel === 0 ? null : 0)}>Cantrip</button>
                {[1,2,3,4,5,6,7,8,9].map(l => (
                  <button key={l} className={`filter-chip ${filterLevel === l ? "active" : ""}`} onClick={() => setFilterLevel(filterLevel === l ? null : l)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>School</div>
              <div className="filter-row">
                <button className={`filter-chip ${!filterSchool ? "active" : ""}`} onClick={() => setFilterSchool("")}>All</button>
                {SPELL_SCHOOLS.map(s => (
                  <button key={s} className={`filter-chip ${filterSchool === s ? "active" : ""}`} onClick={() => setFilterSchool(filterSchool === s ? "" : s)}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Class</div>
              <div className="filter-row">
                <button className={`filter-chip ${!filterClass ? "active" : ""}`} onClick={() => setFilterClass("")}>All</button>
                {SPELL_CLASSES.map(c => (
                  <button key={c} className={`filter-chip ${filterClass === c ? "active" : ""}`} onClick={() => setFilterClass(filterClass === c ? "" : c)}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {loading ? "Loading 5etools spells…" : `${filtered.length.toLocaleString()} spells${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}`}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className={`btn btn-sm ${sortBy === "level" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("level")}>Sort by Level</button>
              <button className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("name")}>Sort by Name</button>
            </div>
          </div>
        </div>
      </div>

      {error && <div style={{ textAlign: "center", padding: "40px", color: "var(--accent-red)" }}>⚠️ {error}</div>}

      {!error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)
              : pageItems.map(spell => (
                  <div key={spell.id} className="spell-card" style={{ cursor: "pointer" }} onClick={() => setSelected(spell)}>
                    <div className="spell-card-header">
                      <div className={`spell-level-badge ${spell.level === 0 ? "cantrip" : `lvl${spell.level}`}`}>
                        {spell.level === 0 ? "C" : spell.level}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{spell.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{spell.time} · {spell.range}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
                        <span className={`spell-school-badge school-${spell.school.toLowerCase()}`}>{spell.school}</span>
                        <div style={{ display: "flex", gap: "3px" }}>
                          {spell.concentration && <span className="concentration-badge">C</span>}
                          {spell.ritual && <span className="ritual-badge">R</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "8px 12px" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {spell.entries[0]}
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Duration: {spell.duration}</span>
                      </div>
                    </div>
                  </div>
                ))
            }
            {!loading && filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No spells match your filters.</div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return p <= totalPages ? <button key={p} className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`} onClick={() => setPage(p)}>{p}</button> : null;
              })}
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          )}
        </>
      )}

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
                <span className="badge badge-gold">{levelOrdinal(selected.level)}</span>
                <span className={`spell-school-badge school-${selected.school.toLowerCase()}`}>{selected.school}</span>
                {selected.concentration && <span className="concentration-badge">Concentration</span>}
                {selected.ritual && <span className="ritual-badge">Ritual</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                {[
                  { label: "Casting Time", value: selected.time },
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

              <div style={{ marginBottom: "16px" }}>
                {selected.entries.map((e, i) => (
                  <p key={i} style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-primary)", margin: "0 0 10px" }}>
                    <RichText text={e} />
                  </p>
                ))}
              </div>

              {selected.higherLevel.length > 0 && (
                <div style={{ background: "rgba(184,150,12,0.08)", border: "1px solid var(--border-gold)", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--accent-gold-light)", marginBottom: "6px" }}>At Higher Levels</div>
                  {selected.higherLevel.map((e, i) => (
                    <p key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.7" }}><RichText text={e} /></p>
                  ))}
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  <strong>Classes:</strong> {selected.classes.length ? selected.classes.join(", ") : "—"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Source: {selected.source} · Data from 5etools</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
