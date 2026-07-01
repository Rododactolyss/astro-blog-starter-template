import { useState, useRef } from "react";
import { CONDITIONS } from "../../data/conditions";

interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  isPlayer: boolean;
  conditions: string[];
  notes: string;
  color: string;
}

const COLORS = ["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c","#e67e22","#e91e63"];

let colorIdx = 0;
function nextColor() { return COLORS[colorIdx++ % COLORS.length]; }

function rollD20() { return Math.floor(Math.random() * 20) + 1; }

const CONDITION_ICONS: Record<string, string> = {
  blinded: "👁️", charmed: "💕", deafened: "🔇", exhaustion: "😴",
  frightened: "😨", grappled: "🤝", incapacitated: "⚡", invisible: "👻",
  paralyzed: "🧊", petrified: "🗿", poisoned: "🤢", prone: "⬇️",
  restrained: "⛓️", stunned: "💫", unconscious: "💤",
};

export default function InitiativeTracker() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [round, setRound] = useState(1);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", initiative: "", hp: "", ac: "", isPlayer: true, count: 1,
  });
  const nextId = useRef(1);

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
  const activeId = sorted[activeIdx]?.id;

  function addCombatants() {
    const count = Math.max(1, Math.min(20, Number(form.count) || 1));
    const newOnes: Combatant[] = Array.from({ length: count }, (_, i) => ({
      id: String(nextId.current++),
      name: count > 1 ? `${form.name || "Creature"} ${i + 1}` : (form.name || "Creature"),
      initiative: Number(form.initiative) || rollD20(),
      hp: Number(form.hp) || 10,
      maxHp: Number(form.hp) || 10,
      ac: Number(form.ac) || 10,
      isPlayer: form.isPlayer,
      conditions: [],
      notes: "",
      color: nextColor(),
    }));
    setCombatants(prev => [...prev, ...newOnes]);
    setForm({ name: "", initiative: "", hp: "", ac: "", isPlayer: true, count: 1 });
    setShowAdd(false);
  }

  function removeCombatant(id: string) {
    setCombatants(prev => {
      const next = prev.filter(c => c.id !== id);
      return next;
    });
    setActiveIdx(0);
  }

  function updateCombatant(id: string, updates: Partial<Combatant>) {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }

  function adjustHp(id: string, delta: number) {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newHp = Math.max(0, Math.min(c.maxHp, c.hp + delta));
      return { ...c, hp: newHp };
    }));
  }

  function nextTurn() {
    const len = sorted.length;
    if (len === 0) return;
    const next = (activeIdx + 1) % len;
    if (next === 0) setRound(r => r + 1);
    setActiveIdx(next);
  }

  function prevTurn() {
    const len = sorted.length;
    if (len === 0) return;
    const prev = (activeIdx - 1 + len) % len;
    if (activeIdx === 0) setRound(r => Math.max(1, r - 1));
    setActiveIdx(prev);
  }

  function toggleCondition(id: string, condition: string) {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const has = c.conditions.includes(condition);
      return { ...c, conditions: has ? c.conditions.filter(x => x !== condition) : [...c.conditions, condition] };
    }));
  }

  function resetCombat() {
    setCombatants([]);
    setRound(1);
    setActiveIdx(0);
    colorIdx = 0;
  }

  function rollAllInitiatives() {
    setCombatants(prev => prev.map(c => ({ ...c, initiative: rollD20() })));
    setActiveIdx(0);
  }

  const hpPercent = (c: Combatant) => c.maxHp > 0 ? (c.hp / c.maxHp) * 100 : 0;
  const hpColor = (pct: number) => pct > 60 ? "#27ae60" : pct > 30 ? "#f39c12" : "#e74c3c";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", alignItems: "start" }}>
      {/* Main combatant list */}
      <div>
        {/* Controls */}
        <div className="card" style={{ marginBottom: "12px" }}>
          <div className="card-body" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Round</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--accent-gold-light)", lineHeight: 1 }}>{round}</div>
              </div>
              {sorted.length > 0 && (
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Turn: <strong style={{ color: "var(--text-primary)" }}>{sorted[activeIdx]?.name || "—"}</strong>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" onClick={prevTurn} disabled={sorted.length === 0}>← Prev</button>
              <button className="btn btn-primary" onClick={nextTurn} disabled={sorted.length === 0}>Next Turn →</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>+ Add</button>
              <button className="btn btn-secondary btn-sm" onClick={rollAllInitiatives} disabled={sorted.length === 0} title="Roll new initiatives for all">🎲 Reroll</button>
              <button className="btn btn-secondary btn-sm" style={{ color: "var(--accent-red)" }} onClick={resetCombat}>Reset</button>
            </div>
          </div>
        </div>

        {/* Combatant rows */}
        {sorted.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚔️</div>
              <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>No combatants yet</div>
              <div style={{ fontSize: "13px", marginBottom: "20px" }}>Add players and monsters to start tracking initiative.</div>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Combatant</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sorted.map((c, i) => {
              const pct = hpPercent(c);
              const isActive = c.id === activeId;
              const isDead = c.hp === 0;
              return (
                <div key={c.id} className="card" style={{
                  border: isActive ? `2px solid ${c.color}` : "2px solid transparent",
                  opacity: isDead ? 0.55 : 1,
                  transition: "all 0.2s",
                }}>
                  <div className="card-body" style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* Initiative bubble */}
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        background: `${c.color}22`, border: `2px solid ${c.color}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <div style={{ fontSize: "10px", color: c.color, fontWeight: 700 }}>INIT</div>
                        <div style={{ fontSize: "16px", fontWeight: 900, color: c.color, lineHeight: 1 }}>{c.initiative}</div>
                      </div>

                      {/* Name & HP */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          {isActive && <span style={{ fontSize: "10px", background: c.color, color: "white", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>ACTIVE</span>}
                          {isDead && <span style={{ fontSize: "10px", background: "#e74c3c", color: "white", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>DOWN</span>}
                          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700 }}>
                            {c.isPlayer ? "👤 PC" : "👹 NPC"}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                        <div style={{ marginTop: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>
                            <span>HP: {c.hp}/{c.maxHp}</span>
                            <span>AC {c.ac}</span>
                          </div>
                          <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: hpColor(pct), borderRadius: "3px", transition: "width 0.3s" }} />
                          </div>
                        </div>
                        {c.conditions.length > 0 && (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                            {c.conditions.map(cond => (
                              <span key={cond} title={cond} style={{ fontSize: "14px", cursor: "pointer" }}
                                onClick={() => toggleCondition(c.id, cond)}>
                                {CONDITION_ICONS[cond] || "🔴"}
                              </span>
                            ))}
                          </div>
                        )}
                        {c.notes && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", fontStyle: "italic" }}>{c.notes}</div>
                        )}
                      </div>

                      {/* HP buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                        <button className="btn btn-sm" style={{ background: "rgba(39,174,96,0.15)", border: "1px solid rgba(39,174,96,0.3)", color: "#27ae60", fontSize: "16px", padding: "2px 10px", lineHeight: 1 }}
                          onClick={() => adjustHp(c.id, 1)}>+</button>
                        <button className="btn btn-sm" style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", fontSize: "16px", padding: "2px 10px", lineHeight: 1 }}
                          onClick={() => adjustHp(c.id, -1)}>−</button>
                      </div>

                      {/* Edit / Remove */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button className="btn-icon" style={{ fontSize: "12px" }}
                          onClick={() => setEditing(editing === c.id ? null : c.id)}>✏️</button>
                        <button className="btn-icon" style={{ fontSize: "12px", color: "var(--accent-red)" }}
                          onClick={() => removeCombatant(c.id)}>🗑</button>
                      </div>
                    </div>

                    {/* Expanded editor */}
                    {editing === c.id && (
                      <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "12px", paddingTop: "12px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                          <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Initiative
                            <input type="number" className="form-input" style={{ marginTop: "3px" }} value={c.initiative}
                              onChange={e => updateCombatant(c.id, { initiative: Number(e.target.value) })} />
                          </label>
                          <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Current HP
                            <input type="number" className="form-input" style={{ marginTop: "3px" }} value={c.hp}
                              onChange={e => updateCombatant(c.id, { hp: Number(e.target.value) })} />
                          </label>
                          <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Max HP
                            <input type="number" className="form-input" style={{ marginTop: "3px" }} value={c.maxHp}
                              onChange={e => updateCombatant(c.id, { maxHp: Number(e.target.value) })} />
                          </label>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Conditions</div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {CONDITIONS.map(cond => (
                              <button key={cond.id}
                                style={{
                                  padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, cursor: "pointer",
                                  background: c.conditions.includes(cond.id) ? `${cond.color}30` : "var(--bg-secondary)",
                                  border: `1px solid ${c.conditions.includes(cond.id) ? cond.color : "var(--border-color)"}`,
                                  color: c.conditions.includes(cond.id) ? cond.color : "var(--text-muted)",
                                }}
                                onClick={() => toggleCondition(c.id, cond.id)}>
                                {CONDITION_ICONS[cond.id]} {cond.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          Notes
                          <input type="text" className="form-input" style={{ marginTop: "3px" }} value={c.notes}
                            placeholder="Concentrating on Hold Person, etc." maxLength={120}
                            onChange={e => updateCombatant(c.id, { notes: e.target.value })} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar: add form + quick reference */}
      <div style={{ position: "sticky", top: "70px" }}>
        {showAdd && (
          <div className="card" style={{ marginBottom: "12px" }}>
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: "15px" }}>Add Combatant</h3>
              <button className="btn-icon" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <button className={`btn btn-sm ${form.isPlayer ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm(f => ({ ...f, isPlayer: true }))}>PC</button>
                <button className={`btn btn-sm ${!form.isPlayer ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm(f => ({ ...f, isPlayer: false }))}>Monster</button>
              </div>

              {[
                { label: "Name", key: "name", type: "text", placeholder: !form.isPlayer ? "Goblin" : "Aragorn" },
                { label: "Initiative (blank = random)", key: "initiative", type: "number", placeholder: "roll 🎲" },
                { label: "Max HP", key: "hp", type: "number", placeholder: "10" },
                { label: "AC", key: "ac", type: "number", placeholder: "10" },
              ].map(f => (
                <label key={f.key} style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  {f.label}
                  <input
                    type={f.type}
                    className="form-input"
                    style={{ marginTop: "3px", width: "100%" }}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </label>
              ))}

              {!form.isPlayer && (
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Count (add multiple)
                  <input type="number" className="form-input" style={{ marginTop: "3px", width: "100%" }}
                    min={1} max={20} value={form.count}
                    onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))} />
                </label>
              )}

              <button className="btn btn-primary" style={{ width: "100%" }} onClick={addCombatants}>
                Add {!form.isPlayer && form.count > 1 ? `${form.count} ` : ""}Combatant{!form.isPlayer && form.count > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Conditions quick ref */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: "14px" }}>Conditions Reference</h3>
          </div>
          <div className="card-body" style={{ padding: "8px 12px" }}>
            {CONDITIONS.map(c => (
              <div key={c.id} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span>{CONDITION_ICONS[c.id]}</span>
                  <span style={{ fontWeight: 700, fontSize: "12px", color: c.color }}>{c.name}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>{c.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
