import { useState, useEffect, useMemo } from "react";
import { formatModifier } from "../../data/character";
import { loadMonsters, crToNumber, CR_ORDER, type NormMonster } from "../../lib/fivetools";

const MONSTER_TYPES = [
  "aberration","beast","celestial","construct","dragon","elemental",
  "fey","fiend","giant","humanoid","monstrosity","ooze","plant","undead",
];

function getModifier(score: number) { return Math.floor((score - 10) / 2); }

function getCRColor(cr: string) {
  const n = crToNumber(cr);
  if (n <= 0.5) return "#27ae60";
  if (n <= 4) return "#f39c12";
  if (n <= 12) return "#e74c3c";
  return "#8e44ad";
}

const PAGE_SIZE = 24;

// Render helper: bold markers (**text**) become <strong>.
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="action-name">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

function Block({ title, items }: { title: string; items: { name: string; entries: string[] }[] }) {
  if (!items.length) return null;
  return (
    <div style={{ padding: "12px 18px", borderTop: "1px solid #c0a060" }}>
      <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "10px" }}>{title}</div>
      {items.map((a, i) => (
        <div key={i} style={{ marginBottom: "9px", fontSize: "13px", lineHeight: "1.6" }}>
          {a.name && <span className="action-name">{a.name}. </span>}
          {a.entries.map((e, j) => <span key={j}><RichText text={e} />{j < a.entries.length - 1 ? " " : ""}</span>)}
        </div>
      ))}
    </div>
  );
}

export default function MonsterList() {
  const [all, setAll] = useState<NormMonster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCR, setFilterCR] = useState("");
  const [sortBy, setSortBy] = useState<"cr" | "name">("cr");
  const [selected, setSelected] = useState<NormMonster | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    loadMonsters()
      .then(list => { if (active) { setAll(list); setLoading(false); } })
      .catch(() => { if (active) { setError("Failed to load 5etools monster data. Check your internet connection."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const crList = useMemo(() => {
    const present = new Set(all.map(m => m.cr));
    return CR_ORDER.filter(cr => present.has(cr));
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = all.filter(m => {
      if (q && !m.name.toLowerCase().includes(q) && !m.type.toLowerCase().includes(q)) return false;
      if (filterType && !m.type.toLowerCase().startsWith(filterType)) return false;
      if (filterCR && m.cr !== filterCR) return false;
      return true;
    });
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => crToNumber(a.cr) - crToNumber(b.cr) || a.name.localeCompare(b.name));
    return list;
  }, [all, query, filterType, filterCR, sortBy]);

  useEffect(() => { setPage(1); }, [query, filterType, filterCR, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const Skeleton = () => (
    <div className="card" style={{ opacity: 0.4 }}>
      <div className="card-header">
        <div>
          <div style={{ height: "16px", background: "var(--bg-secondary)", borderRadius: "4px", width: "130px", marginBottom: "6px" }} />
          <div style={{ height: "12px", background: "var(--bg-secondary)", borderRadius: "4px", width: "90px" }} />
        </div>
        <div style={{ height: "22px", width: "54px", background: "var(--bg-secondary)", borderRadius: "12px" }} />
      </div>
      <div className="card-body" style={{ padding: "10px 16px" }}>
        <div style={{ height: "13px", background: "var(--bg-secondary)", borderRadius: "4px", width: "110px" }} />
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
            <input type="text" placeholder="Search monsters by name or type..." value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Type</div>
              <div className="filter-row">
                <button className={`filter-chip ${!filterType ? "active" : ""}`} onClick={() => setFilterType("")}>All</button>
                {MONSTER_TYPES.map(t => (
                  <button key={t} className={`filter-chip ${filterType === t ? "active" : ""}`} style={{ textTransform: "capitalize" }} onClick={() => setFilterType(filterType === t ? "" : t)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Challenge Rating</div>
              <div className="filter-row">
                <button className={`filter-chip ${!filterCR ? "active" : ""}`} onClick={() => setFilterCR("")}>All</button>
                {crList.map(cr => (
                  <button key={cr} className={`filter-chip ${filterCR === cr ? "active" : ""}`} onClick={() => setFilterCR(filterCR === cr ? "" : cr)}>CR {cr}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {loading ? "Loading 5etools bestiary…" : `${filtered.length.toLocaleString()} monsters${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}`}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className={`btn btn-sm ${sortBy === "cr" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("cr")}>Sort by CR</button>
              <button className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("name")}>Sort by Name</button>
            </div>
          </div>
        </div>
      </div>

      {error && <div style={{ textAlign: "center", padding: "40px", color: "var(--accent-red)" }}>⚠️ {error}</div>}

      {!error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)
              : pageItems.map(monster => (
                  <div key={monster.id} className="card card-hover" onClick={() => setSelected(monster)}>
                    <div className="card-header">
                      <div>
                        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{monster.name}</h3>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", textTransform: "capitalize" }}>{monster.type}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                        <span style={{
                          background: `${getCRColor(monster.cr)}20`, color: getCRColor(monster.cr),
                          border: `1px solid ${getCRColor(monster.cr)}40`, padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
                        }}>CR {monster.cr}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{monster.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <div className="card-body" style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                        <div><span style={{ color: "var(--text-muted)" }}>HP </span><strong style={{ color: "var(--accent-red)" }}>{monster.hpNumber}</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>AC </span><strong>{monster.acNumber}</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>{monster.size}</span></div>
                      </div>
                    </div>
                  </div>
                ))
            }
            {!loading && filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No monsters match your filters.</div>
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

      {/* Stat Block Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: "640px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: "#8b0000", borderRadius: "12px 12px 0 0", padding: "16px 20px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "22px", color: "white", margin: 0 }}>{selected.name}</h2>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontStyle: "italic", textTransform: "capitalize" }}>
                  {selected.size} {selected.type}, {selected.alignment}
                </div>
              </div>
              <button className="btn-icon" style={{ background: "rgba(255,255,255,0.15)", borderColor: "transparent", color: "white" }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ background: "#f5f0e8", color: "#1a1a1a", maxHeight: "74vh", overflowY: "auto", borderRadius: "0 0 12px 12px" }}>
              <div style={{ padding: "14px 18px", borderBottom: "3px solid #8b0000" }}>
                <div className="property-line"><span className="property-name">Armor Class</span> {selected.ac}</div>
                <div className="property-line"><span className="property-name">Hit Points</span> {selected.hp}</div>
                <div className="property-line"><span className="property-name">Speed</span> {selected.speed}</div>
              </div>

              <div style={{ padding: "12px 18px", borderBottom: "3px solid #8b0000" }}>
                <div className="monster-ability-row">
                  {(["STR","DEX","CON","INT","WIS","CHA"] as const).map((ab, i) => {
                    const scores = [selected.str, selected.dex, selected.con, selected.int, selected.wis, selected.cha];
                    return (
                      <div key={ab} className="monster-ability-item">
                        <div className="monster-ability-name" style={{ color: "#8b0000" }}>{ab}</div>
                        <div className="monster-ability-score">{scores[i]}</div>
                        <div className="monster-ability-mod">({formatModifier(getModifier(scores[i]))})</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: "12px 18px", borderBottom: "1px solid #c0a060" }}>
                {selected.saves && <div className="property-line"><span className="property-name">Saving Throws</span> {selected.saves}</div>}
                {selected.skills && <div className="property-line"><span className="property-name">Skills</span> {selected.skills}</div>}
                {selected.vulnerable && <div className="property-line"><span className="property-name">Damage Vulnerabilities</span> {selected.vulnerable}</div>}
                {selected.resist && <div className="property-line"><span className="property-name">Damage Resistances</span> {selected.resist}</div>}
                {selected.immune && <div className="property-line"><span className="property-name">Damage Immunities</span> {selected.immune}</div>}
                {selected.conditionImmune && <div className="property-line"><span className="property-name">Condition Immunities</span> {selected.conditionImmune}</div>}
                <div className="property-line"><span className="property-name">Senses</span> {selected.senses}</div>
                <div className="property-line"><span className="property-name">Languages</span> {selected.languages}</div>
                <div className="property-line"><span className="property-name">Challenge</span> {selected.cr} ({selected.xp.toLocaleString()} XP)</div>
              </div>

              {(selected.traits.length > 0 || selected.spellcasting.length > 0) && (
                <div style={{ padding: "12px 18px", borderBottom: "1px solid #c0a060" }}>
                  {selected.traits.map((t, i) => (
                    <div key={i} style={{ marginBottom: "7px", fontSize: "13px", lineHeight: "1.6" }}>
                      {t.name && <span className="action-name">{t.name}. </span>}
                      {t.entries.map((e, j) => <span key={j}><RichText text={e} />{" "}</span>)}
                    </div>
                  ))}
                  {selected.spellcasting.length > 0 && (
                    <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                      {selected.spellcasting.map((line, i) => <div key={i} style={{ marginBottom: "5px" }}><RichText text={line} /></div>)}
                    </div>
                  )}
                </div>
              )}

              <Block title="Actions" items={selected.actions} />
              <Block title="Bonus Actions" items={selected.bonusActions} />
              <Block title="Reactions" items={selected.reactions} />

              {selected.legendary.length > 0 && (
                <div style={{ padding: "12px 18px", borderTop: "1px solid #c0a060" }}>
                  <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "10px" }}>Legendary Actions</div>
                  {selected.legendaryHeader && <p style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "10px", color: "#444" }}>{selected.legendaryHeader}</p>}
                  {selected.legendary.map((a, i) => (
                    <div key={i} style={{ marginBottom: "7px", fontSize: "13px", lineHeight: "1.6" }}>
                      {a.name && <span className="action-name">{a.name}. </span>}
                      {a.entries.map((e, j) => <span key={j}><RichText text={e} />{" "}</span>)}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: "8px 18px 14px", fontSize: "10px", color: "#8a7a5a", textAlign: "right" }}>
                Source: {selected.source} · Data from 5etools
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
