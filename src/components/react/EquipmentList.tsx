import { useState } from "react";
import { EQUIPMENT, type Equipment } from "../../data/equipment";

const CATEGORIES = ["weapon", "armor", "gear", "tool", "magic"] as const;
const SUBCATEGORIES = [...new Set(EQUIPMENT.map(e => e.subcategory).filter(Boolean))].sort();
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];

const RARITY_COLORS: Record<string, string> = {
  Common: "var(--text-secondary)",
  Uncommon: "#27ae60",
  Rare: "#2980b9",
  "Very Rare": "#8e44ad",
  Legendary: "#f39c12",
  Artifact: "#e74c3c",
};

export default function EquipmentList() {
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterSubcat, setFilterSubcat] = useState<string | null>(null);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "cost" | "category">("category");

  const filtered = EQUIPMENT.filter(e => {
    if (query && !e.name.toLowerCase().includes(query.toLowerCase()) &&
      !e.description.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterCat && e.category !== filterCat) return false;
    if (filterSubcat && e.subcategory !== filterSubcat) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "category") return `${a.category}${a.subcategory}`.localeCompare(`${b.category}${b.subcategory}`) || a.name.localeCompare(b.name);
    return 0;
  });

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = { weapon: "⚔️", armor: "🛡️", gear: "🎒", tool: "🔧", magic: "✨" };
    return icons[cat] || "📦";
  };

  const groupedFiltered = filterCat || filterSubcat || query
    ? { "Results": filtered }
    : filtered.reduce((acc, item) => {
        const key = item.subcategory || item.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, Equipment[]>);

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-body">
          <div className="search-bar" style={{ marginBottom: "12px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search equipment..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setQuery("")}>✕</button>}
          </div>

          <div className="filter-row">
            <button className={`filter-chip ${filterCat === null ? "active" : ""}`} onClick={() => { setFilterCat(null); setFilterSubcat(null); }}>All</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${filterCat === cat ? "active" : ""}`}
                onClick={() => { setFilterCat(filterCat === cat ? null : cat); setFilterSubcat(null); }}
              >
                {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{filtered.length} items</span>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      {Object.entries(groupedFiltered).map(([group, items]) => (
        <div key={group} style={{ marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-title)", fontSize: "17px", color: "var(--accent-gold-light)", marginBottom: "8px", marginTop: 0 }}>
            {group}
          </h3>
          <div className="card">
            <div style={{ overflowX: "auto" }}>
              <table className="dnd-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cost</th>
                    {items.some(i => i.damage) && <th>Damage</th>}
                    {items.some(i => i.ac !== undefined) && <th>AC</th>}
                    {items.some(i => i.weight) && <th>Weight</th>}
                    {items.some(i => i.properties && i.properties.length > 0) && <th>Properties</th>}
                    {items.some(i => i.rarity) && <th>Rarity</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(item.id === selected?.id ? null : item)}
                    >
                      <td>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        {item.requiresAttunement && <span style={{ fontSize: "10px", color: "var(--accent-gold-light)", marginLeft: "6px" }}>(attunement)</span>}
                        {item.magicBonus && <span style={{ fontSize: "11px", color: "#2980b9", marginLeft: "4px" }}>+{item.magicBonus}</span>}
                      </td>
                      <td style={{ color: "#ffd700", fontFamily: "var(--font-mono)" }}>{item.cost}</td>
                      {items.some(i => i.damage) && (
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent-red)" }}>
                          {item.damage ? `${item.damage} ${item.damageType}` : "—"}
                        </td>
                      )}
                      {items.some(i => i.ac !== undefined) && (
                        <td style={{ fontFamily: "var(--font-mono)" }}>
                          {item.ac !== undefined ? (item.acBonus ? `+${item.ac}` : `${item.ac}`) : "—"}
                          {item.stealthDisadvantage && <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "4px" }}>🤫</span>}
                        </td>
                      )}
                      {items.some(i => i.weight) && (
                        <td style={{ color: "var(--text-secondary)" }}>
                          {item.weight ? `${item.weight} lb.` : "—"}
                        </td>
                      )}
                      {items.some(i => i.properties && i.properties.length > 0) && (
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {item.properties?.join(", ") || "—"}
                        </td>
                      )}
                      {items.some(i => i.rarity) && (
                        <td style={{ color: RARITY_COLORS[item.rarity || "Common"] || "var(--text-secondary)", fontWeight: 600, fontSize: "12px" }}>
                          {item.rarity || "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {/* Item Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.name}</h2>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span className="badge badge-gold">{selected.category.charAt(0).toUpperCase() + selected.category.slice(1)}</span>
                {selected.subcategory && <span className="badge badge-blue">{selected.subcategory}</span>}
                {selected.rarity && (
                  <span style={{
                    background: `${RARITY_COLORS[selected.rarity]}20`,
                    color: RARITY_COLORS[selected.rarity],
                    border: `1px solid ${RARITY_COLORS[selected.rarity]}40`,
                    padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700
                  }}>
                    {selected.rarity}
                  </span>
                )}
                {selected.requiresAttunement && <span className="badge badge-red">Requires Attunement</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <div style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Cost</div>
                  <div style={{ color: "#ffd700", fontWeight: 700 }}>{selected.cost}</div>
                </div>
                {selected.weight !== undefined && (
                  <div style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Weight</div>
                    <div style={{ fontWeight: 600 }}>{selected.weight} lb.</div>
                  </div>
                )}
                {selected.damage && (
                  <div style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Damage</div>
                    <div style={{ color: "var(--accent-red)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{selected.damage} {selected.damageType}</div>
                  </div>
                )}
                {selected.ac !== undefined && (
                  <div style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Armor Class</div>
                    <div style={{ fontWeight: 700 }}>{selected.acBonus ? `+${selected.ac}` : `${selected.ac}`}</div>
                  </div>
                )}
                {selected.range && (
                  <div style={{ padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>Range</div>
                    <div style={{ fontWeight: 600 }}>{selected.range}</div>
                  </div>
                )}
              </div>

              {selected.properties && selected.properties.length > 0 && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Properties</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {selected.properties.map(p => <span key={p} className="badge badge-gold">{p}</span>)}
                  </div>
                  {selected.stealthDisadvantage && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                      ⚠️ Imposes disadvantage on Stealth checks
                    </div>
                  )}
                </div>
              )}

              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-primary)" }}>{selected.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
