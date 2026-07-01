import { useState, useEffect } from "react";
import {
  getModifier, formatModifier, ABILITY_NAMES, ABILITY_SHORT,
  SKILLS, getProficiencyBonus, type Character, type AbilityScores,
} from "../../data/character";
import { CLASSES } from "../../data/classes";
import { RACES } from "../../data/races";
import { SPELLS, getSpellById } from "../../data/spells";

const CLASS_ICONS: Record<string, string> = {
  barbarian: "💢", bard: "🎵", cleric: "✝️", druid: "🌿",
  fighter: "⚔️", monk: "👊", paladin: "🛡️", ranger: "🏹",
  rogue: "🗡️", sorcerer: "🔮", warlock: "😈", wizard: "📚",
};

interface Props {
  characterId: string;
}

type TabKey = "abilities" | "combat" | "spells" | "equipment" | "bio";

export default function CharacterSheet({ characterId }: Props) {
  const [char, setChar] = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("abilities");
  const [hpAdjust, setHpAdjust] = useState("");
  const [hpMode, setHpMode] = useState<"damage" | "heal">("damage");
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [addSpellQuery, setAddSpellQuery] = useState("");
  const [showAddSpell, setShowAddSpell] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState<{ field: string; value: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dnd-characters");
    if (stored) {
      const chars: Character[] = JSON.parse(stored);
      const found = chars.find(c => c.id === characterId);
      if (found) setChar(found);
    }
  }, [characterId]);

  const saveChar = (updated: Character) => {
    const stored = localStorage.getItem("dnd-characters");
    if (!stored) return;
    const chars: Character[] = JSON.parse(stored);
    const idx = chars.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      chars[idx] = { ...updated, updatedAt: new Date().toISOString() };
      localStorage.setItem("dnd-characters", JSON.stringify(chars));
      setChar(chars[idx]);
    }
  };

  if (!char) return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <div style={{ fontSize: "48px" }}>⚠️</div>
      <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)" }}>Character not found</h2>
      <a href="/" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>← Back</a>
    </div>
  );

  const classData = CLASSES.find(c => c.id === char.class);
  const raceData = RACES.find(r => r.id === char.race);

  const getSkillBonus = (skillName: string, ability: string): number => {
    const abilityMod = getModifier(char.abilityScores[ability as keyof AbilityScores]);
    const prof = char.skillProficiencies?.[skillName];
    if (prof?.expertise) return abilityMod + char.proficiencyBonus * 2;
    if (prof?.proficient) return abilityMod + char.proficiencyBonus;
    return abilityMod;
  };

  const getSavingThrow = (ability: string): number => {
    const abilityMod = getModifier(char.abilityScores[ability.toLowerCase() as keyof AbilityScores]);
    const isProficient = char.savingThrowProficiencies?.includes(ability);
    return abilityMod + (isProficient ? char.proficiencyBonus : 0);
  };

  const applyHpChange = () => {
    const amount = parseInt(hpAdjust);
    if (isNaN(amount) || amount <= 0) return;
    const newHP = hpMode === "heal"
      ? Math.min(char.currentHP + amount, char.maxHP)
      : Math.max(char.currentHP - amount, 0);
    saveChar({ ...char, currentHP: newHP });
    setHpAdjust("");
  };

  const toggleSkillProficiency = (skillName: string) => {
    const current = char.skillProficiencies?.[skillName];
    let next;
    if (!current || (!current.proficient && !current.expertise)) next = { proficient: true, expertise: false };
    else if (current.proficient && !current.expertise) next = { proficient: true, expertise: true };
    else next = { proficient: false, expertise: false };
    saveChar({ ...char, skillProficiencies: { ...char.skillProficiencies, [skillName]: next } });
  };

  const toggleSaveProficiency = (ability: string) => {
    const existing = char.savingThrowProficiencies || [];
    const updated = existing.includes(ability)
      ? existing.filter(a => a !== ability)
      : [...existing, ability];
    saveChar({ ...char, savingThrowProficiencies: updated });
  };

  const useSpellSlot = (level: number) => {
    if (!char.spellSlots) return;
    const slot = char.spellSlots[level];
    if (!slot || slot.used >= slot.max) return;
    saveChar({ ...char, spellSlots: { ...char.spellSlots, [level]: { ...slot, used: slot.used + 1 } } });
  };

  const restoreSpellSlot = (level: number) => {
    if (!char.spellSlots) return;
    const slot = char.spellSlots[level];
    if (!slot || slot.used <= 0) return;
    saveChar({ ...char, spellSlots: { ...char.spellSlots, [level]: { ...slot, used: slot.used - 1 } } });
  };

  const addSpell = (spellId: string) => {
    const known = char.knownSpells || [];
    if (known.includes(spellId)) return;
    saveChar({ ...char, knownSpells: [...known, spellId] });
    setShowAddSpell(false);
    setAddSpellQuery("");
  };

  const removeSpell = (spellId: string) => {
    saveChar({ ...char, knownSpells: (char.knownSpells || []).filter(s => s !== spellId) });
  };

  const hpPercent = char.maxHP > 0 ? (char.currentHP / char.maxHP) * 100 : 0;
  const hpColor = hpPercent > 60 ? "var(--accent-red)" : hpPercent > 25 ? "#e67e22" : "#c0392b";

  const levelUp = () => {
    if (char.level >= 20) return;
    const newLevel = char.level + 1;
    const newHP = char.maxHP + (classData?.hitDie ? Math.ceil(classData.hitDie / 2) + getModifier(char.abilityScores.constitution) : 5);
    saveChar({ ...char, level: newLevel, maxHP: newHP, currentHP: newHP, proficiencyBonus: getProficiencyBonus(newLevel) });
  };

  const filteredSpells = SPELLS.filter(s =>
    (!classData || s.classes.includes(classData.name)) &&
    (s.name.toLowerCase().includes(addSpellQuery.toLowerCase()) ||
      s.school.toLowerCase().includes(addSpellQuery.toLowerCase()))
  ).slice(0, 20);

  const knownSpellObjects = (char.knownSpells || []).map(id => getSpellById(id)).filter(Boolean);

  const passivePerception = 10 + getSkillBonus("Perception", "wisdom");

  return (
    <div>
      {/* Character Header */}
      <div className="character-header-bar" style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "40px" }}>{CLASS_ICONS[char.class] || "🧙"}</div>
        <div style={{ flex: 1 }}>
          {editMode ? (
            <input
              className="form-input"
              value={char.name}
              onChange={e => saveChar({ ...char, name: e.target.value })}
              style={{ fontSize: "20px", fontFamily: "var(--font-title)", marginBottom: "4px" }}
            />
          ) : (
            <h1 className="character-header-name">{char.name}</h1>
          )}
          <div className="character-header-meta">
            Level {char.level} {raceData?.name || char.race} {classData?.name || char.class}
            {char.background && ` · ${char.background.charAt(0).toUpperCase() + char.background.slice(1)}`}
            {char.alignment && ` · ${char.alignment}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge badge-red">Level {char.level}</span>
          <span className="badge badge-gold">XP: {char.experiencePoints.toLocaleString()}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(!editMode)}>
            {editMode ? "✓ Done" : "✏️ Edit"}
          </button>
          {char.level < 20 && (
            <button className="btn btn-gold btn-sm" onClick={levelUp} title="Level Up">⬆️ Level Up</button>
          )}
          <a href="/" className="btn btn-ghost btn-sm">← Back</a>
        </div>
      </div>

      {/* Combat Stats Bar */}
      <div className="combat-stats-grid" style={{ marginBottom: "16px", gridTemplateColumns: "repeat(6, 1fr)" }}>
        {[
          { label: "Armor Class", value: char.armorClass, icon: "🛡️" },
          { label: "Initiative", value: formatModifier(char.initiative || getModifier(char.abilityScores.dexterity)), icon: "⚡" },
          { label: "Speed", value: `${char.speed || 30}`, icon: "💨", unit: "ft" },
          { label: "Proficiency", value: formatModifier(char.proficiencyBonus), icon: "⭐" },
          { label: "Passive Perc.", value: passivePerception, icon: "👁️" },
          { label: "Hit Dice", value: `${char.hitDice?.total - (char.hitDice?.used || 0)}d${char.hitDice?.type || 8}`, icon: "🎲" },
        ].map(stat => (
          <div key={stat.label} className="combat-stat">
            <div style={{ fontSize: "16px" }}>{stat.icon}</div>
            <div className="combat-stat-value">{stat.value}{stat.unit && <span style={{ fontSize: "12px" }}> {stat.unit}</span>}</div>
            <div className="combat-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* HP Section */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">
          <h3 className="card-title">❤️ Hit Points</h3>
          {char.temporaryHP > 0 && <span className="badge badge-blue">+{char.temporaryHP} Temp HP</span>}
        </div>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="hp-display">
                <span className="hp-current" style={{ color: hpColor }}>{char.currentHP}</span>
                <span className="hp-separator">/</span>
                <span className="hp-max">{char.maxHP}</span>
              </div>
              <div className="hp-bar">
                <div className="hp-bar-fill" style={{ width: `${hpPercent}%`, background: hpColor }} />
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                className={`btn ${hpMode === "damage" ? "btn-danger" : "btn-secondary"}`}
                onClick={() => setHpMode("damage")}
              >💀 Damage</button>
              <button
                className={`btn ${hpMode === "heal" ? "btn-primary" : "btn-secondary"}`}
                style={hpMode === "heal" ? { background: "#27ae60" } : {}}
                onClick={() => setHpMode("heal")}
              >💚 Heal</button>
              <input
                className="form-input"
                type="number"
                placeholder="Amount"
                value={hpAdjust}
                onChange={e => setHpAdjust(e.target.value)}
                style={{ width: "80px", textAlign: "center" }}
                onKeyDown={e => e.key === "Enter" && applyHpChange()}
              />
              <button className="btn btn-gold" onClick={applyHpChange}>Apply</button>
            </div>

            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px", textAlign: "center" }}>Death Saves</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#27ae60", width: "50px" }}>Success</span>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`death-save-dot success ${i < (char.deathSaves?.successes || 0) ? "filled" : ""}`}
                      onClick={() => saveChar({ ...char, deathSaves: { ...char.deathSaves, successes: i < (char.deathSaves?.successes || 0) ? i : i + 1 } })}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--accent-red)", width: "50px" }}>Failure</span>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`death-save-dot failure ${i < (char.deathSaves?.failures || 0) ? "filled" : ""}`}
                      onClick={() => saveChar({ ...char, deathSaves: { ...char.deathSaves, failures: i < (char.deathSaves?.failures || 0) ? i : i + 1 } })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sheet Layout */}
      <div className="sheet-layout">
        {/* Left Column */}
        <div className="sheet-left">
          {/* Ability Scores */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ability Scores</h3>
              {char.inspiration && <span className="badge badge-gold">✨ Inspired</span>}
              <button
                className={`btn btn-sm ${char.inspiration ? "btn-gold" : "btn-secondary"}`}
                onClick={() => saveChar({ ...char, inspiration: !char.inspiration })}
                title="Toggle Inspiration"
                style={{ marginLeft: "auto" }}
              >
                {char.inspiration ? "✨" : "☆"} Inspiration
              </button>
            </div>
            <div className="card-body">
              <div className="ability-grid">
                {ABILITY_NAMES.map(ability => {
                  const score = char.abilityScores[ability];
                  const mod = getModifier(score);
                  return (
                    <div key={ability} className={`ability-block ${ability.slice(0, 3)}`}>
                      <div className="ability-name">{ABILITY_SHORT[ability]}</div>
                      {editMode ? (
                        <input
                          type="number"
                          min={1} max={30}
                          value={score}
                          onChange={e => saveChar({ ...char, abilityScores: { ...char.abilityScores, [ability]: parseInt(e.target.value) || score } })}
                          style={{ width: "50px", textAlign: "center", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "20px", fontWeight: 700 }}
                        />
                      ) : (
                        <div className="ability-score">{score}</div>
                      )}
                      <div className="ability-modifier">{formatModifier(mod)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Saving Throws */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Saving Throws</h3>
            </div>
            <div className="card-body" style={{ padding: "8px 16px" }}>
              {(["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]).map(ability => {
                const isProficient = char.savingThrowProficiencies?.includes(ability);
                const bonus = getSavingThrow(ability);
                return (
                  <div key={ability} className="skill-row">
                    <div
                      className={`skill-proficiency-dot ${isProficient ? "proficient" : ""}`}
                      onClick={() => toggleSaveProficiency(ability)}
                    />
                    <span className="skill-bonus">{formatModifier(bonus)}</span>
                    <span className="skill-name">{ability}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Skills</h3>
            </div>
            <div className="card-body" style={{ padding: "8px 16px" }}>
              {SKILLS.map(skill => {
                const prof = char.skillProficiencies?.[skill.name];
                const bonus = getSkillBonus(skill.name, skill.ability);
                return (
                  <div key={skill.name} className="skill-row">
                    <div
                      className={`skill-proficiency-dot ${prof?.expertise ? "expertise" : prof?.proficient ? "proficient" : ""}`}
                      onClick={() => toggleSkillProficiency(skill.name)}
                      title={prof?.expertise ? "Expertise" : prof?.proficient ? "Proficient" : "Not proficient"}
                    />
                    <span className="skill-bonus">{formatModifier(bonus)}</span>
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-ability">{ABILITY_SHORT[skill.ability as keyof AbilityScores]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="sheet-right">
          <div>
            <div className="tab-list">
              {(["abilities", "combat", "spells", "equipment", "bio"] as TabKey[]).map(tab => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "abilities" && "⚔️ "}
                  {tab === "combat" && "🗡️ "}
                  {tab === "spells" && "✨ "}
                  {tab === "equipment" && "🎒 "}
                  {tab === "bio" && "📖 "}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Abilities Tab */}
            {activeTab === "abilities" && (
              <div>
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">⚔️ Attacks</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const name = prompt("Attack name:");
                      if (!name) return;
                      const bonus = prompt("Attack bonus (e.g. +5):", "+0") || "+0";
                      const damage = prompt("Damage (e.g. 1d8+3):", "1d6+0") || "1d6+0";
                      const type = prompt("Damage type:", "slashing") || "slashing";
                      saveChar({ ...char, attacks: [...(char.attacks || []), { name, attackBonus: bonus, damage, damageType: type }] });
                    }}>
                      ＋ Add Attack
                    </button>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {(char.attacks || []).length === 0 ? (
                      <div style={{ padding: "16px", color: "var(--text-muted)", textAlign: "center", fontSize: "13px" }}>
                        No attacks added. Click "＋ Add Attack" to add.
                      </div>
                    ) : (
                      <table className="dnd-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Attack</th>
                            <th>Damage</th>
                            <th>Type</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(char.attacks || []).map((atk, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{atk.name}</td>
                              <td style={{ color: "var(--accent-gold-light)", fontFamily: "var(--font-mono)" }}>{atk.attackBonus}</td>
                              <td style={{ fontFamily: "var(--font-mono)" }}>{atk.damage}</td>
                              <td style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{atk.damageType}</td>
                              <td>
                                <button
                                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px" }}
                                  onClick={() => saveChar({ ...char, attacks: (char.attacks || []).filter((_, j) => j !== i) })}
                                >✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="card" style={{ marginTop: "12px" }}>
                  <div className="card-header">
                    <h3 className="card-title">📜 Features & Traits</h3>
                  </div>
                  <div className="card-body">
                    {editMode ? (
                      <textarea
                        className="form-textarea"
                        value={char.features || ""}
                        onChange={e => saveChar({ ...char, features: e.target.value })}
                        rows={8}
                        placeholder="List your class features, racial traits, background features..."
                      />
                    ) : (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: "1.7" }}>
                        {classData && (
                          <div>
                            {classData.features.filter(f => f.level <= char.level).map((f, i) => (
                              <div key={i} style={{ marginBottom: "10px" }}>
                                <span style={{ fontWeight: 700, color: "var(--accent-gold-light)" }}>{f.name}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>(Level {f.level})</span>
                                <p style={{ margin: "2px 0 0", fontSize: "13px" }}>{f.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {char.features && <div style={{ marginTop: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>{char.features}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Combat Tab */}
            {activeTab === "combat" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="card">
                  <div className="card-header"><h3 className="card-title">Combat Numbers</h3></div>
                  <div className="card-body">
                    <div className="grid-3">
                      {[
                        { label: "Armor Class", field: "armorClass" as keyof Character },
                        { label: "Speed (ft)", field: "speed" as keyof Character },
                        { label: "Max HP", field: "maxHP" as keyof Character },
                      ].map(item => (
                        <div key={item.field} className="combat-stat">
                          <div className="combat-stat-value">
                            {editMode ? (
                              <input
                                type="number"
                                value={char[item.field] as number}
                                onChange={e => saveChar({ ...char, [item.field]: parseInt(e.target.value) || 0 })}
                                style={{ width: "60px", textAlign: "center", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "20px" }}
                              />
                            ) : (
                              char[item.field] as number
                            )}
                          </div>
                          <div className="combat-stat-label">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Class features for combat */}
                <div className="card">
                  <div className="card-header"><h3 className="card-title">🏹 Hit Dice</h3></div>
                  <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "24px", fontFamily: "var(--font-title)", color: "var(--text-primary)" }}>
                        {(char.hitDice?.total || char.level) - (char.hitDice?.used || 0)}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>/</span>
                      <span style={{ fontSize: "18px", color: "var(--text-secondary)" }}>{char.hitDice?.total || char.level}</span>
                      <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-title)" }}>d{char.hitDice?.type || classData?.hitDie || 8}</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const used = char.hitDice?.used || 0;
                          if (used <= 0) return;
                          const roll = Math.ceil(Math.random() * (char.hitDice?.type || 8)) + getModifier(char.abilityScores.constitution);
                          const heal = Math.max(1, roll);
                          const newHP = Math.min(char.currentHP + heal, char.maxHP);
                          saveChar({ ...char, currentHP: newHP, hitDice: { ...char.hitDice, used: used - 1 } });
                        }}
                        disabled={(char.hitDice?.used || 0) >= (char.hitDice?.total || char.level)}
                      >
                        Spend Hit Die
                      </button>
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => saveChar({ ...char, hitDice: { ...char.hitDice, used: 0 }, currentHP: char.maxHP, deathSaves: { successes: 0, failures: 0 } })}
                      >
                        Long Rest
                      </button>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                      You recover all hit dice on a long rest (up to half of total). Click "Spend Hit Die" to roll and regain HP.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Spells Tab */}
            {activeTab === "spells" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {classData?.spellcaster ? (
                  <>
                    {/* Spellcasting Info */}
                    <div className="card">
                      <div className="card-header"><h3 className="card-title">✨ Spellcasting</h3></div>
                      <div className="card-body">
                        <div className="grid-3">
                          <div className="combat-stat">
                            <div className="combat-stat-value">{classData.spellcastingAbility?.slice(0, 3).toUpperCase()}</div>
                            <div className="combat-stat-label">Ability</div>
                          </div>
                          <div className="combat-stat">
                            <div className="combat-stat-value">
                              {8 + char.proficiencyBonus + getModifier(char.abilityScores[
                                (classData.spellcastingAbility?.toLowerCase() || "intelligence") as keyof AbilityScores
                              ])}
                            </div>
                            <div className="combat-stat-label">Save DC</div>
                          </div>
                          <div className="combat-stat">
                            <div className="combat-stat-value">
                              {formatModifier(char.proficiencyBonus + getModifier(char.abilityScores[
                                (classData.spellcastingAbility?.toLowerCase() || "intelligence") as keyof AbilityScores
                              ]))}
                            </div>
                            <div className="combat-stat-label">Attack Bonus</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spell Slots */}
                    {char.spellSlots && Object.keys(char.spellSlots).length > 0 && (
                      <div className="card">
                        <div className="card-header"><h3 className="card-title">Spell Slots</h3></div>
                        <div className="card-body">
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {Object.entries(char.spellSlots).map(([level, slot]) => {
                              const lvl = parseInt(level);
                              if (slot.max === 0) return null;
                              return (
                                <div key={level} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", minWidth: "52px" }}>
                                    Level {level}
                                  </span>
                                  <div style={{ display: "flex", gap: "4px" }}>
                                    {Array.from({ length: slot.max }).map((_, i) => (
                                      <div
                                        key={i}
                                        onClick={() => i < slot.max - slot.used ? useSpellSlot(lvl) : restoreSpellSlot(lvl)}
                                        style={{
                                          width: "22px", height: "22px",
                                          borderRadius: "50%",
                                          border: "2px solid var(--accent-gold)",
                                          background: i < slot.max - slot.used ? "var(--accent-gold)" : "transparent",
                                          cursor: "pointer",
                                          transition: "all 0.15s"
                                        }}
                                        title={i < slot.max - slot.used ? "Click to use" : "Click to restore"}
                                      />
                                    ))}
                                  </div>
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    {slot.max - slot.used}/{slot.max} remaining
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Known Spells */}
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">📿 Known Spells</h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowAddSpell(true)}>
                          ＋ Add Spell
                        </button>
                      </div>
                      <div className="card-body" style={{ padding: 0 }}>
                        {showAddSpell && (
                          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                            <div className="search-bar" style={{ marginBottom: "8px" }}>
                              <span>🔍</span>
                              <input
                                type="text"
                                placeholder="Search spells..."
                                value={addSpellQuery}
                                onChange={e => setAddSpellQuery(e.target.value)}
                                autoFocus
                              />
                              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setShowAddSpell(false)}>✕</button>
                            </div>
                            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                              {filteredSpells.map(spell => (
                                <div
                                  key={spell.id}
                                  onClick={() => addSpell(spell.id)}
                                  style={{
                                    padding: "8px 12px", cursor: "pointer", borderRadius: "4px",
                                    display: "flex", alignItems: "center", gap: "8px",
                                    transition: "background 0.1s",
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    {spell.level === 0 ? "C" : spell.level}
                                  </span>
                                  <span style={{ fontWeight: 600 }}>{spell.name}</span>
                                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "auto" }}>
                                    {spell.school}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {knownSpellObjects.length === 0 ? (
                          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                            No spells added. Click "＋ Add Spell" to add spells.
                          </div>
                        ) : (
                          <div>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                              const levelSpells = knownSpellObjects.filter(s => s?.level === level);
                              if (levelSpells.length === 0) return null;
                              return (
                                <div key={level}>
                                  <div style={{ padding: "8px 16px 4px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)" }}>
                                    {level === 0 ? "Cantrips" : `Level ${level} Spells`}
                                  </div>
                                  {levelSpells.map(spell => {
                                    if (!spell) return null;
                                    return (
                                      <div
                                        key={spell.id}
                                        style={{
                                          padding: "10px 16px",
                                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          cursor: "pointer",
                                          transition: "background 0.1s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        onClick={() => setSelectedSpell(selectedSpell === spell.id ? null : spell.id)}
                                      >
                                        <span className={`spell-school-badge school-${spell.school}`}>{spell.school}</span>
                                        <span style={{ fontWeight: 600, flex: 1 }}>{spell.name}</span>
                                        {spell.concentration && <span className="concentration-badge">C</span>}
                                        {spell.ritual && <span className="ritual-badge">R</span>}
                                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{spell.castingTime}</span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); removeSpell(spell.id); }}
                                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px" }}
                                        >✕</button>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>📚</div>
                    <p>{classData?.name} is not a spellcaster class.</p>
                  </div>
                )}
              </div>
            )}

            {/* Equipment Tab */}
            {activeTab === "equipment" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Currency */}
                <div className="card">
                  <div className="card-header"><h3 className="card-title">💰 Currency</h3></div>
                  <div className="card-body">
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {(["cp", "sp", "ep", "gp", "pp"] as const).map(coin => {
                        const labels = { cp: "Copper", sp: "Silver", ep: "Electrum", gp: "Gold", pp: "Platinum" };
                        const colors = { cp: "#cd7f32", sp: "#c0c0c0", ep: "#80c080", gp: "#ffd700", pp: "#e5e4e2" };
                        return (
                          <div key={coin} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: colors[coin], marginBottom: "4px" }}>
                              {labels[coin]}
                            </div>
                            <input
                              type="number"
                              min={0}
                              value={char.currency?.[coin] || 0}
                              onChange={e => saveChar({ ...char, currency: { ...char.currency, [coin]: parseInt(e.target.value) || 0 } })}
                              style={{
                                width: "70px", textAlign: "center", background: "var(--bg-input)",
                                border: `1px solid ${colors[coin]}40`, borderRadius: "4px",
                                color: colors[coin], fontSize: "16px", fontWeight: 700, padding: "6px 4px"
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Equipment list */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">🎒 Equipment</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const name = prompt("Item name:");
                      if (!name) return;
                      const qty = parseInt(prompt("Quantity:", "1") || "1") || 1;
                      saveChar({ ...char, equipment: [...(char.equipment || []), { id: crypto.randomUUID(), name, quantity: qty }] });
                    }}>
                      ＋ Add Item
                    </button>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {(char.equipment || []).length === 0 ? (
                      <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        No equipment. Click "＋ Add Item" to add.
                      </div>
                    ) : (
                      <table className="dnd-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Notes</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(char.equipment || []).map((item, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{item.name}</td>
                              <td>
                                <input
                                  type="number"
                                  min={0}
                                  value={item.quantity}
                                  onChange={e => {
                                    const eq = [...(char.equipment || [])];
                                    eq[i] = { ...item, quantity: parseInt(e.target.value) || 0 };
                                    saveChar({ ...char, equipment: eq });
                                  }}
                                  style={{ width: "50px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "2px 6px", textAlign: "center" }}
                                />
                              </td>
                              <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{item.notes || "—"}</td>
                              <td>
                                <button
                                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px" }}
                                  onClick={() => saveChar({ ...char, equipment: (char.equipment || []).filter((_, j) => j !== i) })}
                                >✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bio Tab */}
            {activeTab === "bio" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="card">
                  <div className="card-header"><h3 className="card-title">👤 Characteristics</h3></div>
                  <div className="card-body">
                    <div className="grid-2" style={{ marginBottom: "12px" }}>
                      {[
                        { label: "Age", field: "age" }, { label: "Height", field: "height" },
                        { label: "Weight", field: "weight" }, { label: "Eyes", field: "eyes" },
                        { label: "Skin", field: "skin" }, { label: "Hair", field: "hair" },
                      ].map(item => (
                        <div key={item.field} className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">{item.label}</label>
                          <input
                            className="form-input"
                            type="text"
                            value={(char as any)[item.field] || ""}
                            onChange={e => saveChar({ ...char, [item.field]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {[
                  { label: "Personality Traits", field: "personalityTraits" },
                  { label: "Ideals", field: "ideals" },
                  { label: "Bonds", field: "bonds" },
                  { label: "Flaws", field: "flaws" },
                  { label: "Backstory", field: "backstory" },
                ].map(item => (
                  <div key={item.field} className="card">
                    <div className="card-header"><h3 className="card-title">{item.label}</h3></div>
                    <div className="card-body">
                      <textarea
                        className="form-textarea"
                        value={(char as any)[item.field] || ""}
                        onChange={e => saveChar({ ...char, [item.field]: e.target.value })}
                        rows={item.field === "backstory" ? 8 : 3}
                        placeholder={`Your character's ${item.label.toLowerCase()}...`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spell detail modal */}
      {selectedSpell && (() => {
        const spell = getSpellById(selectedSpell);
        if (!spell) return null;
        return (
          <div className="modal-overlay" onClick={() => setSelectedSpell(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{spell.name}</h2>
                <button className="btn-icon" onClick={() => setSelectedSpell(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span className="badge badge-gold">Level {spell.level === 0 ? "Cantrip" : spell.level}</span>
                  <span className={`spell-school-badge school-${spell.school}`}>{spell.school}</span>
                  {spell.concentration && <span className="concentration-badge">Concentration</span>}
                  {spell.ritual && <span className="ritual-badge">Ritual</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px", fontSize: "13px" }}>
                  <div><strong style={{ color: "var(--text-secondary)" }}>Casting Time:</strong> {spell.castingTime}</div>
                  <div><strong style={{ color: "var(--text-secondary)" }}>Range:</strong> {spell.range}</div>
                  <div><strong style={{ color: "var(--text-secondary)" }}>Components:</strong> {spell.components}</div>
                  <div><strong style={{ color: "var(--text-secondary)" }}>Duration:</strong> {spell.duration}</div>
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--text-primary)", marginBottom: "12px" }}>{spell.description}</p>
                {spell.higherLevels && (
                  <div style={{ background: "rgba(184, 150, 12, 0.08)", border: "1px solid var(--border-gold)", borderRadius: "6px", padding: "10px 14px" }}>
                    <strong style={{ color: "var(--accent-gold-light)", fontSize: "12px" }}>AT HIGHER LEVELS.</strong>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>{spell.higherLevels}</p>
                  </div>
                )}
                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                  Classes: {spell.classes.join(", ")}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
