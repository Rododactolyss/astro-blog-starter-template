import { useState, useEffect } from "react";
import type { Character } from "../../data/character";
import { CLASSES } from "../../data/classes";
import { RACES } from "../../data/races";

const CLASS_ICONS: Record<string, string> = {
  barbarian: "💢", bard: "🎵", cleric: "✝️", druid: "🌿",
  fighter: "⚔️", monk: "👊", paladin: "🛡️", ranger: "🏹",
  rogue: "🗡️", sorcerer: "🔮", warlock: "😈", wizard: "📚",
};

export default function CharacterList() {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("dnd-characters");
    if (stored) {
      try { setCharacters(JSON.parse(stored)); } catch {}
    }
  }, []);

  const deleteCharacter = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this character? This cannot be undone.")) return;
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    localStorage.setItem("dnd-characters", JSON.stringify(updated));
  };

  if (characters.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚔️</div>
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "24px", color: "var(--text-primary)", marginBottom: "8px" }}>
          No Characters Yet
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Create your first D&D character to start your adventure.
        </p>
        <a href="/characters/create" className="btn btn-primary btn-lg">
          ＋ Create Your First Character
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {characters.map((char) => {
        const classData = CLASSES.find(c => c.id === char.class);
        const raceData = RACES.find(r => r.id === char.race);
        const hpPercent = char.maxHP > 0 ? (char.currentHP / char.maxHP) * 100 : 0;

        return (
          <a
            key={char.id}
            href={`/characters/${char.id}`}
            className="character-card"
            style={{ position: "relative" }}
          >
            <div className="character-avatar">
              {CLASS_ICONS[char.class] || "🧙"}
            </div>

            <div className="character-info">
              <h3 className="character-name">{char.name}</h3>
              <div className="character-meta">
                Level {char.level} {raceData?.name || char.race} {classData?.name || char.class}
                {char.background && ` · ${char.background.charAt(0).toUpperCase() + char.background.slice(1)}`}
              </div>
              <div style={{ marginTop: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "120px", height: "4px", background: "var(--bg-secondary)",
                    borderRadius: "2px", overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${hpPercent}%`, height: "100%",
                      background: hpPercent > 50 ? "var(--accent-red)" : hpPercent > 25 ? "#e67e22" : "#c0392b",
                      transition: "width 0.3s"
                    }} />
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {char.currentHP}/{char.maxHP} HP
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
              <div className="character-level-badge">Level {char.level}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                AC {char.armorClass}
              </div>
              <button
                onClick={(e) => deleteCharacter(char.id, e)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "14px", padding: "2px 4px",
                  borderRadius: "4px", transition: "all 0.1s"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-red)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                title="Delete character"
              >
                🗑
              </button>
            </div>
          </a>
        );
      })}
    </div>
  );
}
