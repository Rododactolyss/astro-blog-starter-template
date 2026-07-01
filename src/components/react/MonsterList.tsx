import { useState, useEffect, useRef } from "react";
import { formatModifier } from "../../data/character";

interface O5eMonster {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype: string;
  alignment: string;
  armor_class: number;
  armor_desc: string;
  hit_points: number;
  hit_dice: string;
  speed: Record<string, number>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number | null;
  dexterity_save: number | null;
  constitution_save: number | null;
  intelligence_save: number | null;
  wisdom_save: number | null;
  charisma_save: number | null;
  perception: number | null;
  skills: Record<string, number>;
  damage_vulnerabilities: string;
  damage_resistances: string;
  damage_immunities: string;
  condition_immunities: string;
  senses: string;
  languages: string;
  challenge_rating: string;
  cr: number;
  actions: { name: string; desc: string }[];
  reactions: { name: string; desc: string }[];
  legendary_desc: string;
  legendary_actions: { name: string; desc: string }[];
  special_abilities: { name: string; desc: string }[];
}

const MONSTER_TYPES = [
  "Aberration","Beast","Celestial","Construct","Dragon","Elemental",
  "Fey","Fiend","Giant","Humanoid","Monstrosity","Ooze","Plant","Undead",
];

const CR_OPTIONS = [
  "0","1/8","1/4","1/2","1","2","3","4","5","6","7","8","9","10",
  "11","12","13","14","15","16","17","18","19","20","21","22","23","24","30",
];

function getCRColor(cr: string) {
  const n = cr.includes("/") ? parseFloat(cr.split("/")[0]) / parseFloat(cr.split("/")[1]) : parseFloat(cr);
  if (n <= 0.5) return "#27ae60";
  if (n <= 4) return "#f39c12";
  if (n <= 12) return "#e74c3c";
  return "#8e44ad";
}

function getModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

function formatSpeed(speed: Record<string, number>) {
  return Object.entries(speed)
    .map(([k, v]) => k === "walk" ? `${v} ft.` : `${k} ${v} ft.`)
    .join(", ");
}

const SKILL_LABELS: Record<string, string> = {
  acrobatics: "Acrobatics", animalhandling: "Animal Handling", arcana: "Arcana",
  athletics: "Athletics", deception: "Deception", history: "History",
  insight: "Insight", intimidation: "Intimidation", investigation: "Investigation",
  medicine: "Medicine", nature: "Nature", perception: "Perception",
  performance: "Performance", persuasion: "Persuasion", religion: "Religion",
  sleightofhand: "Sleight of Hand", stealth: "Stealth", survival: "Survival",
};

function skillLabel(key: string) {
  return SKILL_LABELS[key.replace(/[^a-z]/g, "")] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export default function MonsterList() {
  const [monsters, setMonsters] = useState<O5eMonster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCR, setFilterCR] = useState("");
  const [sortBy, setSortBy] = useState<"cr" | "name">("cr");
  const [selected, setSelected] = useState<O5eMonster | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = query ? 400 : 50;
    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          page: String(page),
          ordering: sortBy === "cr" ? "cr" : "name",
        });
        if (query) params.set("search", query);
        if (filterType) params.set("type", filterType.toLowerCase());
        if (filterCR) params.set("challenge_rating", filterCR);
        const res = await fetch(`https://api.open5e.com/v1/monsters/?${params}`, {
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json() as { results: O5eMonster[]; count: number };
        setMonsters(data.results);
        setCount(data.count);
      } catch (e: any) {
        if (e.name !== "AbortError") setError("Failed to load monsters. Check your internet connection.");
      } finally {
        setLoading(false);
      }
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, filterType, filterCR, sortBy, page]);

  const setFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

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
            <input
              type="text"
              placeholder="Search monsters by name..."
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
            {query && (
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => { setQuery(""); setPage(1); }}>✕</button>
            )}
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Type</div>
              <div className="filter-row">
                <button className={`filter-chip ${!filterType ? "active" : ""}`} onClick={() => setFilter(setFilterType)("")}>All</button>
                {MONSTER_TYPES.map(t => (
                  <button key={t} className={`filter-chip ${filterType === t ? "active" : ""}`} onClick={() => setFilter(setFilterType)(filterType === t ? "" : t)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Challenge Rating</div>
              <div className="filter-row">
                <button className={`filter-chip ${!filterCR ? "active" : ""}`} onClick={() => setFilter(setFilterCR)("")}>All</button>
                {CR_OPTIONS.map(cr => (
                  <button key={cr} className={`filter-chip ${filterCR === cr ? "active" : ""}`} onClick={() => setFilter(setFilterCR)(filterCR === cr ? "" : cr)}>CR {cr}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {loading ? "Loading..." : `${count.toLocaleString()} monsters · page ${page} of ${totalPages || 1}`}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className={`btn btn-sm ${sortBy === "cr" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("cr")}>Sort by CR</button>
              <button className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("name")}>Sort by Name</button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--accent-red)" }}>
          ⚠️ {error}
        </div>
      )}

      {!error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)
              : monsters.map(monster => (
                  <div
                    key={monster.slug}
                    className="card card-hover"
                    onClick={() => setSelected(monster.slug === selected?.slug ? null : monster)}
                  >
                    <div className="card-header">
                      <div>
                        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{monster.name}</h3>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                          {monster.subtype ? `${monster.type} (${monster.subtype})` : monster.type}
                        </div>
                      </div>
                      <span style={{
                        background: `${getCRColor(monster.challenge_rating)}20`,
                        color: getCRColor(monster.challenge_rating),
                        border: `1px solid ${getCRColor(monster.challenge_rating)}40`,
                        padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
                      }}>
                        CR {monster.challenge_rating}
                      </span>
                    </div>
                    <div className="card-body" style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                        <div><span style={{ color: "var(--text-muted)" }}>HP </span><strong style={{ color: "var(--accent-red)" }}>{monster.hit_points}</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>AC </span><strong>{monster.armor_class}</strong></div>
                        <div><span style={{ color: "var(--text-muted)" }}>{monster.size}</span></div>
                      </div>
                    </div>
                  </div>
                ))
            }
            {!loading && monsters.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                No monsters match your search.
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`} onClick={() => setPage(p)}>{p}</button>
                ) : null;
              })}
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          )}
        </>
      )}

      {/* Monster Stat Block Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: "620px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: "#8b0000", borderRadius: "12px 12px 0 0", padding: "16px 20px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "22px", color: "white", margin: 0 }}>{selected.name}</h2>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                  {selected.size} {selected.subtype ? `${selected.type} (${selected.subtype})` : selected.type}, {selected.alignment}
                </div>
              </div>
              <button className="btn-icon" style={{ background: "rgba(255,255,255,0.15)", borderColor: "transparent", color: "white" }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ background: "#f5f0e8", color: "#1a1a1a", maxHeight: "72vh", overflowY: "auto", borderRadius: "0 0 12px 12px" }}>
              {/* Basic Stats */}
              <div style={{ padding: "14px 18px", borderBottom: "3px solid #8b0000" }}>
                <div className="property-line"><span className="property-name">Armor Class</span> {selected.armor_class}{selected.armor_desc ? ` (${selected.armor_desc})` : ""}</div>
                <div className="property-line"><span className="property-name">Hit Points</span> {selected.hit_points} ({selected.hit_dice})</div>
                <div className="property-line"><span className="property-name">Speed</span> {formatSpeed(selected.speed)}</div>
              </div>

              {/* Ability Scores */}
              <div style={{ padding: "12px 18px", borderBottom: "3px solid #8b0000" }}>
                <div className="monster-ability-row">
                  {(["STR","DEX","CON","INT","WIS","CHA"] as const).map((ab, i) => {
                    const scores = [selected.strength,selected.dexterity,selected.constitution,selected.intelligence,selected.wisdom,selected.charisma];
                    const score = scores[i];
                    return (
                      <div key={ab} className="monster-ability-item">
                        <div className="monster-ability-name" style={{ color: "#8b0000" }}>{ab}</div>
                        <div className="monster-ability-score">{score}</div>
                        <div className="monster-ability-mod">({formatModifier(getModifier(score))})</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Stats */}
              <div style={{ padding: "12px 18px", borderBottom: "1px solid #c0a060" }}>
                {(() => {
                  const saves = [
                    { n: "Str", v: selected.strength_save }, { n: "Dex", v: selected.dexterity_save },
                    { n: "Con", v: selected.constitution_save }, { n: "Int", v: selected.intelligence_save },
                    { n: "Wis", v: selected.wisdom_save }, { n: "Cha", v: selected.charisma_save },
                  ].filter(s => s.v !== null && s.v !== undefined);
                  return saves.length > 0 ? (
                    <div className="property-line">
                      <span className="property-name">Saving Throws</span>{" "}
                      {saves.map(s => `${s.n} ${formatModifier(s.v!)}`).join(", ")}
                    </div>
                  ) : null;
                })()}
                {Object.keys(selected.skills).length > 0 && (
                  <div className="property-line">
                    <span className="property-name">Skills</span>{" "}
                    {Object.entries(selected.skills).map(([k, v]) => `${skillLabel(k)} ${formatModifier(v)}`).join(", ")}
                  </div>
                )}
                {selected.damage_vulnerabilities && <div className="property-line"><span className="property-name">Damage Vulnerabilities</span> {selected.damage_vulnerabilities}</div>}
                {selected.damage_resistances && <div className="property-line"><span className="property-name">Damage Resistances</span> {selected.damage_resistances}</div>}
                {selected.damage_immunities && <div className="property-line"><span className="property-name">Damage Immunities</span> {selected.damage_immunities}</div>}
                {selected.condition_immunities && <div className="property-line"><span className="property-name">Condition Immunities</span> {selected.condition_immunities}</div>}
                {selected.senses && <div className="property-line"><span className="property-name">Senses</span> {selected.senses}</div>}
                {selected.languages && <div className="property-line"><span className="property-name">Languages</span> {selected.languages || "—"}</div>}
                <div className="property-line"><span className="property-name">Challenge</span> {selected.challenge_rating}</div>
              </div>

              {/* Special Abilities */}
              {selected.special_abilities?.length > 0 && (
                <div style={{ padding: "12px 18px", borderBottom: "1px solid #c0a060" }}>
                  {selected.special_abilities.map((t, i) => (
                    <div key={i} style={{ marginBottom: "7px", fontSize: "13px", lineHeight: "1.6" }}>
                      <span className="action-name">{t.name}. </span>{t.desc}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {selected.actions?.length > 0 && (
                <div style={{ padding: "12px 18px" }}>
                  <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "10px" }}>Actions</div>
                  {selected.actions.map((a, i) => (
                    <div key={i} style={{ marginBottom: "9px", fontSize: "13px", lineHeight: "1.6" }}>
                      <span className="action-name">{a.name}. </span>{a.desc}
                    </div>
                  ))}
                </div>
              )}

              {/* Reactions */}
              {selected.reactions?.length > 0 && (
                <div style={{ padding: "12px 18px", borderTop: "1px solid #c0a060" }}>
                  <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "10px" }}>Reactions</div>
                  {selected.reactions.map((a, i) => (
                    <div key={i} style={{ marginBottom: "7px", fontSize: "13px", lineHeight: "1.6" }}>
                      <span className="action-name">{a.name}. </span>{a.desc}
                    </div>
                  ))}
                </div>
              )}

              {/* Legendary Actions */}
              {selected.legendary_actions?.length > 0 && (
                <div style={{ padding: "12px 18px", borderTop: "1px solid #c0a060" }}>
                  <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "10px" }}>Legendary Actions</div>
                  {selected.legendary_desc && <p style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "10px", color: "#444" }}>{selected.legendary_desc}</p>}
                  {selected.legendary_actions.map((a, i) => (
                    <div key={i} style={{ marginBottom: "7px", fontSize: "13px", lineHeight: "1.6" }}>
                      <span className="action-name">{a.name}. </span>{a.desc}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
