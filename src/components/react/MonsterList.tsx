import { useState } from "react";
import { MONSTERS, CR_ORDER, type Monster } from "../../data/monsters";
import { getModifier, formatModifier } from "../../data/character";

const MONSTER_TYPES = [...new Set(MONSTERS.map(m => m.type.split(" ")[0]))].sort();
const CR_LIST = [...new Set(MONSTERS.map(m => m.cr))].sort((a, b) => CR_ORDER.indexOf(a) - CR_ORDER.indexOf(b));

export default function MonsterList() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterCR, setFilterCR] = useState<string | null>(null);
  const [selected, setSelected] = useState<Monster | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "cr">("cr");

  const filtered = MONSTERS.filter(m => {
    if (query && !m.name.toLowerCase().includes(query.toLowerCase()) &&
      !m.type.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterType && !m.type.startsWith(filterType)) return false;
    if (filterCR && m.cr !== filterCR) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "cr") return CR_ORDER.indexOf(a.cr) - CR_ORDER.indexOf(b.cr);
    return a.name.localeCompare(b.name);
  });

  const getCRColor = (cr: string) => {
    const idx = CR_ORDER.indexOf(cr);
    if (idx <= 2) return "#27ae60";
    if (idx <= 6) return "#f39c12";
    if (idx <= 12) return "#e74c3c";
    return "#8e44ad";
  };

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body">
          <div className="search-bar" style={{ marginBottom: "12px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search monsters by name or type..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Type</div>
              <div className="filter-row">
                <button className={`filter-chip ${filterType === null ? "active" : ""}`} onClick={() => setFilterType(null)}>All</button>
                {MONSTER_TYPES.map(t => (
                  <button key={t} className={`filter-chip ${filterType === t ? "active" : ""}`} onClick={() => setFilterType(filterType === t ? null : t)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Challenge Rating</div>
              <div className="filter-row">
                <button className={`filter-chip ${filterCR === null ? "active" : ""}`} onClick={() => setFilterCR(null)}>All</button>
                {CR_LIST.map(cr => (
                  <button key={cr} className={`filter-chip ${filterCR === cr ? "active" : ""}`} onClick={() => setFilterCR(filterCR === cr ? null : cr)}>CR {cr}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {filtered.length} monster{filtered.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className={`btn btn-sm ${sortBy === "cr" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("cr")}>Sort by CR</button>
              <button className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSortBy("name")}>Sort by Name</button>
            </div>
          </div>
        </div>
      </div>

      {/* Monster List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
        {filtered.map(monster => (
          <div
            key={monster.id}
            className="card card-hover"
            onClick={() => setSelected(monster.id === selected?.id ? null : monster)}
          >
            <div className="card-header">
              <div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{monster.name}</h3>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>{monster.type}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span style={{
                  background: `${getCRColor(monster.cr)}20`,
                  color: getCRColor(monster.cr),
                  border: `1px solid ${getCRColor(monster.cr)}40`,
                  padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700
                }}>
                  CR {monster.cr}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{monster.xp.toLocaleString()} XP</span>
              </div>
            </div>
            <div className="card-body" style={{ padding: "10px 16px" }}>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>HP </span>
                  <strong style={{ color: "var(--accent-red)" }}>{monster.hp}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>AC </span>
                  <strong>{monster.ac}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>{monster.size}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No monsters match your filters.
          </div>
        )}
      </div>

      {/* Monster Stat Block Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: "#8b0000", borderRadius: "12px 12px 0 0" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "22px", color: "white", margin: 0 }}>{selected.name}</h2>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                  {selected.size} {selected.type}, {selected.alignment}
                </div>
              </div>
              <button className="btn-icon" style={{ background: "rgba(255,255,255,0.1)", borderColor: "transparent" }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ background: "#f5f0e8", color: "#1a1a1a" }}>
              {/* Basic Stats */}
              <div style={{ padding: "12px 16px", borderBottom: "3px solid #8b0000" }}>
                <div className="property-line"><span className="property-name">Armor Class</span> {selected.ac}{selected.acType ? ` (${selected.acType})` : ""}</div>
                <div className="property-line"><span className="property-name">Hit Points</span> {selected.hp} ({selected.hpDice})</div>
                <div className="property-line"><span className="property-name">Speed</span> {selected.speed}</div>
              </div>

              {/* Ability Scores */}
              <div style={{ padding: "12px 16px", borderBottom: "3px solid #8b0000" }}>
                <div className="monster-ability-row">
                  {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map((ab, i) => {
                    const scores = [selected.str, selected.dex, selected.con, selected.int, selected.wis, selected.cha];
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

              {/* Additional Stats */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #c0a060" }}>
                {selected.savingThrows && selected.savingThrows.length > 0 && (
                  <div className="property-line">
                    <span className="property-name">Saving Throws</span>{" "}
                    {selected.savingThrows.map(s => `${s.ability} ${formatModifier(s.bonus)}`).join(", ")}
                  </div>
                )}
                {selected.skills && selected.skills.length > 0 && (
                  <div className="property-line">
                    <span className="property-name">Skills</span>{" "}
                    {selected.skills.map(s => `${s.name} ${formatModifier(s.bonus)}`).join(", ")}
                  </div>
                )}
                {selected.damageResistances && (
                  <div className="property-line"><span className="property-name">Damage Resistances</span> {selected.damageResistances.join(", ")}</div>
                )}
                {selected.damageImmunities && (
                  <div className="property-line"><span className="property-name">Damage Immunities</span> {selected.damageImmunities.join(", ")}</div>
                )}
                {selected.conditionImmunities && (
                  <div className="property-line"><span className="property-name">Condition Immunities</span> {selected.conditionImmunities.join(", ")}</div>
                )}
                {selected.senses && <div className="property-line"><span className="property-name">Senses</span> {selected.senses}</div>}
                {selected.languages && <div className="property-line"><span className="property-name">Languages</span> {selected.languages}</div>}
                <div className="property-line">
                  <span className="property-name">Challenge</span>{" "}
                  {selected.cr} ({selected.xp.toLocaleString()} XP)
                </div>
              </div>

              {/* Traits */}
              {selected.traits && selected.traits.length > 0 && (
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #c0a060" }}>
                  {selected.traits.map((t, i) => (
                    <div key={i} style={{ marginBottom: "6px", fontSize: "13px" }}>
                      <span className="action-name">{t.name}. </span>
                      {t.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "8px" }}>Actions</div>
                {selected.actions.map((a, i) => (
                  <div key={i} style={{ marginBottom: "8px", fontSize: "13px" }}>
                    <span className="action-name">{a.name}. </span>
                    {a.description}
                  </div>
                ))}
              </div>

              {/* Legendary Actions */}
              {selected.legendaryActions && selected.legendaryActions.length > 0 && (
                <div style={{ padding: "12px 16px", borderTop: "1px solid #c0a060" }}>
                  <div style={{ fontFamily: "'Palatino Linotype', serif", fontSize: "18px", fontWeight: 700, color: "#8b0000", borderBottom: "2px solid #8b0000", marginBottom: "8px" }}>Legendary Actions</div>
                  <p style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "8px" }}>
                    The {selected.name} can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn.
                  </p>
                  {selected.legendaryActions.map((a, i) => (
                    <div key={i} style={{ marginBottom: "6px", fontSize: "13px" }}>
                      <span className="action-name">{a.name}. </span>
                      {a.description}
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
