import { useState, useEffect } from "react";
import { CLASSES } from "../../data/classes";
import { RACES } from "../../data/races";
import { BACKGROUNDS } from "../../data/equipment";
import {
  createDefaultCharacter,
  STANDARD_ARRAY,
  getModifier,
  formatModifier,
  ABILITY_NAMES,
  ABILITY_SHORT,
  getProficiencyBonus,
  SPELL_SLOTS_BY_LEVEL,
  type Character,
  type AbilityScores,
} from "../../data/character";

const CLASS_ICONS: Record<string, string> = {
  barbarian: "💢", bard: "🎵", cleric: "✝️", druid: "🌿",
  fighter: "⚔️", monk: "👊", paladin: "🛡️", ranger: "🏹",
  rogue: "🗡️", sorcerer: "🔮", warlock: "😈", wizard: "📚",
};

const RACE_ICONS: Record<string, string> = {
  dwarf: "⛏️", elf: "🧝", halfling: "🌾", human: "👤",
  dragonborn: "🐲", gnome: "🔧", "half-elf": "🌙", "half-orc": "⚔️", tiefling: "😈",
};

const ALIGNMENT_OPTIONS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil",
];

const STEPS = ["Race", "Class", "Background", "Abilities", "Details", "Review"];

type AbilityKey = keyof AbilityScores;

export default function CharacterBuilder() {
  const [step, setStep] = useState(0);
  const [char, setChar] = useState<Partial<Character>>(createDefaultCharacter() as Partial<Character>);
  const [standardArray, setStandardArray] = useState<number[]>([...STANDARD_ARRAY]);
  const [assignments, setAssignments] = useState<Record<AbilityKey, number>>({
    strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
  });
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [abilityMethod, setAbilityMethod] = useState<"standard" | "pointbuy" | "roll">("standard");
  const [pointBuyPoints, setPointBuyPoints] = useState(27);
  const [saving, setSaving] = useState(false);

  const selectedClass = CLASSES.find(c => c.id === char.class);
  const selectedRace = RACES.find(r => r.id === char.race);
  const selectedBackground = BACKGROUNDS.find(b => b.id === char.background);

  const getRaceBonus = (ability: AbilityKey): number => {
    if (!selectedRace) return 0;
    const bonuses = selectedRace.abilityScoreIncreases.filter(b =>
      b.ability.toLowerCase() === ability || b.ability.toLowerCase().includes(ability)
    );
    return bonuses.reduce((sum, b) => sum + b.bonus, 0);
  };

  const getTotalScore = (ability: AbilityKey): number => {
    return (assignments[ability] || 0) + getRaceBonus(ability);
  };

  const rollAbilityScores = () => {
    const scores = [];
    for (let i = 0; i < 6; i++) {
      const rolls = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6));
      rolls.sort((a, b) => a - b);
      scores.push(rolls.slice(1).reduce((a, b) => a + b, 0));
    }
    setRolledScores(scores.sort((a, b) => b - a));
  };

  const assignRolledScore = (ability: AbilityKey, score: number) => {
    const prev = assignments[ability];
    const newAssignments = { ...assignments, [ability]: score };
    setAssignments(newAssignments);
  };

  const POINT_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

  const getPointCost = (score: number): number => POINT_COST[score] ?? 0;

  const usedPoints = ABILITY_NAMES.reduce((total, ab) => {
    return total + getPointCost(assignments[ab] || 8);
  }, 0);

  const canIncrement = (ability: AbilityKey): boolean => {
    if (abilityMethod !== "pointbuy") return false;
    const current = assignments[ability] || 8;
    if (current >= 15) return false;
    const nextCost = getPointCost(current + 1) - getPointCost(current);
    return (usedPoints + nextCost) <= 27;
  };

  const canDecrement = (ability: AbilityKey): boolean => {
    if (abilityMethod !== "pointbuy") return false;
    return (assignments[ability] || 8) > 8;
  };

  const handlePointBuy = (ability: AbilityKey, dir: 1 | -1) => {
    const current = assignments[ability] || 8;
    const newVal = current + dir;
    if (newVal < 8 || newVal > 15) return;
    if (dir === 1 && !canIncrement(ability)) return;
    setAssignments(prev => ({ ...prev, [ability]: newVal }));
  };

  const computeMaxHP = (): number => {
    if (!selectedClass) return 8;
    const conMod = getModifier(getTotalScore("constitution"));
    return selectedClass.hitDie + conMod;
  };

  const computeAC = (): number => {
    const dexMod = getModifier(getTotalScore("dexterity"));
    // Check for unarmored defense
    if (char.class === "barbarian") {
      const conMod = getModifier(getTotalScore("constitution"));
      return 10 + dexMod + conMod;
    }
    if (char.class === "monk") {
      const wisMod = getModifier(getTotalScore("wisdom"));
      return 10 + dexMod + wisMod;
    }
    return 10 + dexMod;
  };

  const handleSave = () => {
    setSaving(true);

    const abilityScores: AbilityScores = {
      strength: getTotalScore("strength"),
      dexterity: getTotalScore("dexterity"),
      constitution: getTotalScore("constitution"),
      intelligence: getTotalScore("intelligence"),
      wisdom: getTotalScore("wisdom"),
      charisma: getTotalScore("charisma"),
    };

    const maxHP = computeMaxHP();
    const profBonus = getProficiencyBonus(1);
    const spellSlots = selectedClass?.spellcaster && SPELL_SLOTS_BY_LEVEL[1]
      ? Object.fromEntries(
          SPELL_SLOTS_BY_LEVEL[1].map((max, i) => [i + 1, { max, used: 0 }]).filter(([, v]) => (v as any).max > 0)
        )
      : undefined;

    const character: Character = {
      ...(char as Character),
      id: char.id || crypto.randomUUID(),
      abilityScores,
      maxHP,
      currentHP: maxHP,
      temporaryHP: 0,
      armorClass: computeAC(),
      initiative: getModifier(abilityScores.dexterity),
      proficiencyBonus: profBonus,
      savingThrowProficiencies: selectedClass?.savingThrows || [],
      hitDice: { total: 1, used: 0, type: selectedClass?.hitDie || 8 },
      deathSaves: { successes: 0, failures: 0 },
      attacks: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
      equipment: [],
      spellcastingAbility: selectedClass?.spellcastingAbility,
      spellSlots: spellSlots as any,
      knownSpells: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem("dnd-characters");
    const existing: Character[] = stored ? JSON.parse(stored) : [];
    existing.push(character);
    localStorage.setItem("dnd-characters", JSON.stringify(existing));

    setTimeout(() => {
      window.location.href = `/characters/${character.id}`;
    }, 500);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!char.race;
      case 1: return !!char.class;
      case 2: return !!char.background;
      case 3: return ABILITY_NAMES.every(ab => (assignments[ab] || 0) > 0);
      case 4: return !!char.name && char.name.trim() !== "" && char.name !== "New Adventurer";
      default: return true;
    }
  };

  const assignStandardArray = (ability: AbilityKey, valueStr: string) => {
    const value = parseInt(valueStr);
    setAssignments(prev => ({ ...prev, [ability]: value }));
  };

  const availableForAssignment = (ability: AbilityKey): number[] => {
    const usedByOthers = new Set(
      ABILITY_NAMES.filter(ab => ab !== ability).map(ab => assignments[ab])
    );
    return STANDARD_ARRAY.filter(v => !usedByOthers.has(v) || v === assignments[ability]);
  };

  const initPointBuy = () => {
    setAssignments({ strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 });
  };

  return (
    <div>
      {/* Steps */}
      <div className="builder-steps" style={{ marginBottom: "24px" }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`builder-step ${i === step ? "active" : i < step ? "done" : ""}`}
            onClick={() => i < step && setStep(i)}
            style={{ cursor: i < step ? "pointer" : "default" }}
          >
            {i < step ? "✓ " : ""}{s}
          </div>
        ))}
      </div>

      {/* Step 0: Race */}
      {step === 0 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)", marginBottom: "4px" }}>
              Choose Your Race
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Your race grants you a set of natural abilities and traits.
            </p>
          </div>
          <div className="selection-grid">
            {RACES.map(race => (
              <div
                key={race.id}
                className={`selection-card ${char.race === race.id ? "selected" : ""}`}
                onClick={() => setChar(prev => ({ ...prev, race: race.id, subrace: undefined }))}
              >
                <div className="selection-card-icon">{RACE_ICONS[race.id] || "👤"}</div>
                <div className="selection-card-name">{race.name}</div>
                <div className="selection-card-info">
                  {race.abilityScoreIncreases.slice(0, 2).map(b =>
                    b.bonus > 0 ? `+${b.bonus} ${b.ability.slice(0, 3)}` : ""
                  ).filter(Boolean).join(" · ")}
                </div>
                {race.subraces && (
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {race.subraces.length} subraces
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subrace selector */}
          {char.race && selectedRace?.subraces && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                Choose Subrace
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {selectedRace.subraces.map(sr => (
                  <div
                    key={sr.id}
                    className={`selection-card ${char.subrace === sr.id ? "selected" : ""}`}
                    onClick={() => setChar(prev => ({ ...prev, subrace: sr.id }))}
                    style={{ minWidth: "140px", flex: 1 }}
                  >
                    <div className="selection-card-name">{sr.name}</div>
                    <div className="selection-card-info" style={{ fontSize: "11px" }}>
                      {sr.abilityScoreIncreases.map(b => `+${b.bonus} ${b.ability.slice(0, 3)}`).join(" ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Race details panel */}
          {selectedRace && (
            <div className="card" style={{ marginTop: "20px" }}>
              <div className="card-header">
                <h3 className="card-title">{RACE_ICONS[selectedRace.id]} {selectedRace.name}</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span className="badge badge-gold">{selectedRace.size}</span>
                  <span className="badge badge-blue">{selectedRace.speed} ft</span>
                </div>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "12px" }}>
                  {selectedRace.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {selectedRace.abilityScoreIncreases.map((b, i) => (
                    <span key={i} className="badge badge-green">
                      +{b.bonus} {b.ability}
                    </span>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    Racial Traits
                  </div>
                  {selectedRace.traits.map((t, i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, color: "var(--accent-gold-light)" }}>{t.name}. </span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Class */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)", marginBottom: "4px" }}>
              Choose Your Class
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Your class is the primary definition of what your character can do.
            </p>
          </div>
          <div className="selection-grid">
            {CLASSES.map(cls => (
              <div
                key={cls.id}
                className={`selection-card ${char.class === cls.id ? "selected" : ""}`}
                onClick={() => setChar(prev => ({ ...prev, class: cls.id, subclass: undefined }))}
              >
                <div className="selection-card-icon">{CLASS_ICONS[cls.id] || "⚔️"}</div>
                <div className="selection-card-name">{cls.name}</div>
                <div className="selection-card-info">
                  Hit Die: d{cls.hitDie}
                  {cls.spellcaster && <span style={{ color: "var(--accent-gold-light)" }}> · Spellcaster</span>}
                </div>
              </div>
            ))}
          </div>

          {selectedClass && (
            <div className="card" style={{ marginTop: "20px" }}>
              <div className="card-header">
                <h3 className="card-title">{CLASS_ICONS[selectedClass.id]} {selectedClass.name}</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span className="badge badge-red">d{selectedClass.hitDie}</span>
                  {selectedClass.spellcaster && <span className="badge badge-blue">✨ Spellcaster</span>}
                </div>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "12px" }}>
                  {selectedClass.description}
                </p>
                <div className="grid-3" style={{ marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Primary Ability</div>
                    <div style={{ fontSize: "13px" }}>{selectedClass.primaryAbility}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Saving Throws</div>
                    <div style={{ fontSize: "13px" }}>{selectedClass.savingThrows.join(", ")}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Armor</div>
                    <div style={{ fontSize: "13px" }}>{selectedClass.armorProficiencies.join(", ") || "None"}</div>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>Skill Choices:</strong> {selectedClass.skillChoices} from {selectedClass.skillOptions.slice(0, 4).join(", ")}{selectedClass.skillOptions.length > 4 ? "..." : ""}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Background */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)", marginBottom: "4px" }}>
              Choose Your Background
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Your background reflects where you came from and who you were before becoming an adventurer.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
            {BACKGROUNDS.map(bg => (
              <div
                key={bg.id}
                className={`card card-hover ${char.background === bg.id ? "" : ""}`}
                onClick={() => setChar(prev => ({ ...prev, background: bg.id }))}
                style={{
                  cursor: "pointer",
                  borderColor: char.background === bg.id ? "var(--accent-red)" : "var(--border-color)",
                  background: char.background === bg.id ? "rgba(196,30,58,0.06)" : "var(--bg-card)"
                }}
              >
                <div className="card-header">
                  <h4 className="card-title" style={{ fontSize: "14px" }}>{bg.name}</h4>
                </div>
                <div className="card-body" style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Skills:</strong> {bg.skillProficiencies.join(", ")}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--accent-gold-light)" }}>{bg.feature}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedBackground && (
            <div className="card" style={{ marginTop: "16px" }}>
              <div className="card-header">
                <h3 className="card-title">{selectedBackground.name}</h3>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "12px" }}>
                  {selectedBackground.description}
                </p>
                <div style={{ marginBottom: "8px" }}>
                  <strong style={{ color: "var(--accent-gold-light)", fontSize: "13px" }}>{selectedBackground.feature}: </strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{selectedBackground.featureDescription}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Ability Scores */}
      {step === 3 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)", marginBottom: "4px" }}>
              Assign Ability Scores
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Distribute your ability scores across the six core attributes.
            </p>
          </div>

          {/* Method selection */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {(["standard", "pointbuy", "roll"] as const).map(method => (
              <button
                key={method}
                className={`btn ${abilityMethod === method ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setAbilityMethod(method);
                  setAssignments({ strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 });
                  if (method === "pointbuy") initPointBuy();
                  if (method === "roll") rollAbilityScores();
                }}
              >
                {method === "standard" ? "📋 Standard Array" : method === "pointbuy" ? "💰 Point Buy" : "🎲 Roll"}
              </button>
            ))}
          </div>

          {/* Standard Array */}
          {abilityMethod === "standard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Standard array: <strong style={{ color: "var(--accent-gold-light)" }}>15, 14, 13, 12, 10, 8</strong>. Assign each value to one ability score.
              </div>
              {ABILITY_NAMES.map(ability => (
                <div key={ability} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ width: "40px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)" }}>
                    {ABILITY_SHORT[ability]}
                  </div>
                  <select
                    className="form-select"
                    style={{ width: "100px", flex: "none" }}
                    value={assignments[ability] || ""}
                    onChange={e => assignStandardArray(ability, e.target.value)}
                  >
                    <option value="">— Pick —</option>
                    {availableForAssignment(ability).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {assignments[ability] > 0 && (
                    <>
                      {getRaceBonus(ability) > 0 && (
                        <span style={{ color: "var(--accent-gold-light)", fontSize: "13px" }}>
                          +{getRaceBonus(ability)} (racial)
                        </span>
                      )}
                      <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-title)" }}>
                        = {getTotalScore(ability)}
                      </span>
                      <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                        ({formatModifier(getModifier(getTotalScore(ability)))})
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Point Buy */}
          {abilityMethod === "pointbuy" && (
            <div>
              <div style={{ marginBottom: "12px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border-gold)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Points remaining:</span>
                <strong style={{ color: "var(--accent-gold-light)", fontSize: "16px" }}>{27 - usedPoints} / 27</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ABILITY_NAMES.map(ability => {
                  const val = assignments[ability] || 8;
                  return (
                    <div key={ability} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ width: "40px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)" }}>
                        {ABILITY_SHORT[ability]}
                      </div>
                      <button className="btn-icon" onClick={() => handlePointBuy(ability, -1)} disabled={!canDecrement(ability)}>−</button>
                      <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-title)", minWidth: "28px", textAlign: "center" }}>{val}</span>
                      <button className="btn-icon" onClick={() => handlePointBuy(ability, 1)} disabled={!canIncrement(ability)}>＋</button>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cost: {getPointCost(val)}</span>
                      {getRaceBonus(ability) > 0 && <span style={{ color: "var(--accent-gold-light)", fontSize: "13px" }}>+{getRaceBonus(ability)}</span>}
                      <span style={{ fontSize: "18px", fontWeight: 700, marginLeft: "auto", fontFamily: "var(--font-title)" }}>
                        {getTotalScore(ability)} <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>({formatModifier(getModifier(getTotalScore(ability)))})</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roll */}
          {abilityMethod === "roll" && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <button className="btn btn-gold" onClick={rollAbilityScores}>🎲 Re-roll Scores</button>
              </div>
              {rolledScores.length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  {rolledScores.map((s, i) => {
                    const alreadyAssigned = Object.values(assignments).includes(s) &&
                      Object.entries(assignments).some(([, v]) => v === s);
                    return (
                      <div key={i} style={{
                        width: "48px", height: "48px", background: "var(--bg-card)",
                        border: "2px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-title)", fontSize: "20px", fontWeight: 700
                      }}>
                        {s}
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ABILITY_NAMES.map(ability => (
                  <div key={ability} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ width: "40px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)" }}>
                      {ABILITY_SHORT[ability]}
                    </div>
                    <select
                      className="form-select"
                      style={{ width: "100px", flex: "none" }}
                      value={assignments[ability] || ""}
                      onChange={e => setAssignments(prev => ({ ...prev, [ability]: parseInt(e.target.value) || 0 }))}
                    >
                      <option value="">— Pick —</option>
                      {rolledScores.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    {assignments[ability] > 0 && (
                      <span style={{ fontSize: "18px", fontWeight: 700, marginLeft: "auto", fontFamily: "var(--font-title)" }}>
                        {getTotalScore(ability)} <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>({formatModifier(getModifier(getTotalScore(ability)))})</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Details */}
      {step === 4 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)", marginBottom: "4px" }}>
              Character Details
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Give your character a name and personal history.
            </p>
          </div>
          <div className="grid-2">
            <div>
              <div className="form-group">
                <label className="form-label">Character Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Arador Moonwhisper..."
                  value={char.name === "New Adventurer" ? "" : char.name || ""}
                  onChange={e => setChar(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Alignment</label>
                <select
                  className="form-select"
                  value={char.alignment || "True Neutral"}
                  onChange={e => setChar(prev => ({ ...prev, alignment: e.target.value }))}
                >
                  {ALIGNMENT_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="text" placeholder="Young adult" value={char.age || ""} onChange={e => setChar(prev => ({ ...prev, age: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <input className="form-input" type="text" placeholder="5'10&quot;" value={char.height || ""} onChange={e => setChar(prev => ({ ...prev, height: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Eyes</label>
                  <input className="form-input" type="text" placeholder="Blue" value={char.eyes || ""} onChange={e => setChar(prev => ({ ...prev, eyes: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hair</label>
                  <input className="form-input" type="text" placeholder="Dark brown" value={char.hair || ""} onChange={e => setChar(prev => ({ ...prev, hair: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Personality Traits</label>
                <textarea className="form-textarea" placeholder="I idolize a hero of the old tales..." rows={3} value={char.personalityTraits || ""} onChange={e => setChar(prev => ({ ...prev, personalityTraits: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Ideals</label>
                <textarea className="form-textarea" placeholder="Greater Good. It is each person's responsibility to make the most happiness for the whole tribe..." rows={2} value={char.ideals || ""} onChange={e => setChar(prev => ({ ...prev, ideals: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Bonds</label>
                <textarea className="form-textarea" placeholder="I will do anything to protect the village where I grew up..." rows={2} value={char.bonds || ""} onChange={e => setChar(prev => ({ ...prev, bonds: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Flaws</label>
                <textarea className="form-textarea" placeholder="There's no room for caution in a life lived to the fullest..." rows={2} value={char.flaws || ""} onChange={e => setChar(prev => ({ ...prev, flaws: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Backstory</label>
            <textarea className="form-textarea" placeholder="Tell the story of your character's life before becoming an adventurer..." rows={5} value={char.backstory || ""} onChange={e => setChar(prev => ({ ...prev, backstory: e.target.value }))} />
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)", marginBottom: "4px" }}>
              Review Character
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Review your character before finalizing creation.
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><h3 className="card-title">Identity</h3></div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Name</span>
                  <strong>{char.name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Race</span>
                  <strong>{selectedRace?.name || char.race}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Class</span>
                  <strong>{selectedClass?.name || char.class}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Background</span>
                  <strong>{selectedBackground?.name || char.background}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Alignment</span>
                  <strong>{char.alignment}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 className="card-title">Combat Stats</h3></div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Hit Points</span>
                  <strong style={{ color: "var(--accent-red)" }}>{computeMaxHP()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Armor Class</span>
                  <strong>{computeAC()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Initiative</span>
                  <strong>{formatModifier(getModifier(getTotalScore("dexterity")))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Speed</span>
                  <strong>{selectedRace?.speed || 30} ft.</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Proficiency Bonus</span>
                  <strong>+{getProficiencyBonus(1)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Hit Die</span>
                  <strong>d{selectedClass?.hitDie || 8}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "12px" }}>
            <div className="card-header"><h3 className="card-title">Ability Scores</h3></div>
            <div className="card-body">
              <div className="ability-grid">
                {ABILITY_NAMES.map(ability => {
                  const total = getTotalScore(ability);
                  const mod = getModifier(total);
                  return (
                    <div key={ability} className={`ability-block ${ability.slice(0, 3)}`}>
                      <div className="ability-name">{ABILITY_SHORT[ability]}</div>
                      <div className="ability-score">{total}</div>
                      <div className="ability-modifier">{formatModifier(mod)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setStep(prev => prev - 1)}
          disabled={step === 0}
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setStep(prev => prev + 1)}
            disabled={!canProceed()}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-gold btn-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Creating..." : "⚔️ Create Character"}
          </button>
        )}
      </div>
    </div>
  );
}
