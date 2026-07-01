import { useState, useCallback } from "react";

interface RollResult {
  dice: string;
  rolls: number[];
  modifier: number;
  total: number;
  timestamp: string;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];
const DICE_ICONS: Record<number, string> = { 4: "🔺", 6: "⬛", 8: "🔷", 10: "🔶", 12: "⬡", 20: "⬟", 100: "⭕" };

export default function DiceRoller() {
  const [selectedDie, setSelectedDie] = useState(20);
  const [count, setCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [result, setResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [advantage, setAdvantage] = useState<"normal" | "advantage" | "disadvantage">("normal");
  const [customExpr, setCustomExpr] = useState("");

  const roll = useCallback(() => {
    setIsRolling(true);
    setTimeout(() => {
      let rolls: number[];
      let diceStr: string;

      if (advantage !== "normal" && selectedDie === 20 && count === 1) {
        const r1 = Math.ceil(Math.random() * 20);
        const r2 = Math.ceil(Math.random() * 20);
        rolls = [r1, r2];
        const kept = advantage === "advantage" ? Math.max(r1, r2) : Math.min(r1, r2);
        const total = kept + modifier;
        diceStr = `2d20 (${advantage === "advantage" ? "Adv" : "Dis"})`;
        const res: RollResult = {
          dice: diceStr,
          rolls,
          modifier,
          total,
          timestamp: new Date().toLocaleTimeString(),
        };
        setResult(res);
        setHistory(prev => [res, ...prev.slice(0, 19)]);
      } else {
        rolls = Array.from({ length: count }, () => Math.ceil(Math.random() * selectedDie));
        const sum = rolls.reduce((a, b) => a + b, 0);
        const total = sum + modifier;
        diceStr = `${count}d${selectedDie}`;
        const res: RollResult = {
          dice: diceStr,
          rolls,
          modifier,
          total,
          timestamp: new Date().toLocaleTimeString(),
        };
        setResult(res);
        setHistory(prev => [res, ...prev.slice(0, 19)]);
      }
      setIsRolling(false);
    }, 300);
  }, [selectedDie, count, modifier, advantage]);

  const rollCustom = () => {
    const expr = customExpr.trim().toLowerCase();
    const match = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) { alert("Invalid format. Use e.g.: 2d6+3"); return; }
    const cnt = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const mod = match[3] ? parseInt(match[3]) : 0;
    if (cnt < 1 || cnt > 100 || sides < 1) { alert("Invalid dice."); return; }

    setIsRolling(true);
    setTimeout(() => {
      const rolls = Array.from({ length: cnt }, () => Math.ceil(Math.random() * sides));
      const total = rolls.reduce((a, b) => a + b, 0) + mod;
      const res: RollResult = {
        dice: expr,
        rolls,
        modifier: mod,
        total,
        timestamp: new Date().toLocaleTimeString(),
      };
      setResult(res);
      setHistory(prev => [res, ...prev.slice(0, 19)]);
      setIsRolling(false);
    }, 300);
  };

  const isNat20 = result && selectedDie === 20 && result.rolls.some(r => r === 20);
  const isNat1 = result && selectedDie === 20 && result.rolls.some(r => r === 1) && result.rolls.every(r => r !== 20);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
      {/* Main Roller */}
      <div>
        {/* Die Selection */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-header"><h3 className="card-title">Select Die</h3></div>
          <div className="card-body">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {DICE_TYPES.map(d => (
                <button
                  key={d}
                  className={`dice-button ${selectedDie === d ? "rolling" : ""} ${isRolling && selectedDie === d ? "rolling" : ""}`}
                  onClick={() => setSelectedDie(d)}
                  style={{
                    borderColor: selectedDie === d ? "var(--accent-red)" : undefined,
                    background: selectedDie === d ? "rgba(196, 30, 58, 0.12)" : undefined,
                  }}
                >
                  <div className="dice-type">{DICE_ICONS[d]}</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-title)" }}>d{d}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roll Configuration */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-header"><h3 className="card-title">Configuration</h3></div>
          <div className="card-body">
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Number of Dice</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="btn-icon" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                  <span style={{ fontSize: "24px", fontFamily: "var(--font-title)", minWidth: "32px", textAlign: "center" }}>{count}</span>
                  <button className="btn-icon" onClick={() => setCount(Math.min(20, count + 1))}>＋</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label className="form-label">Modifier</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="btn-icon" onClick={() => setModifier(modifier - 1)}>−</button>
                  <span style={{ fontSize: "24px", fontFamily: "var(--font-title)", minWidth: "40px", textAlign: "center", color: modifier > 0 ? "var(--accent-gold-light)" : modifier < 0 ? "var(--accent-red)" : "var(--text-primary)" }}>
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                  <button className="btn-icon" onClick={() => setModifier(modifier + 1)}>＋</button>
                </div>
              </div>

              {selectedDie === 20 && count === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label className="form-label">Advantage</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {(["normal", "advantage", "disadvantage"] as const).map(adv => (
                      <button
                        key={adv}
                        className={`btn btn-sm ${advantage === adv ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setAdvantage(adv)}
                        style={advantage === adv && adv === "advantage" ? { background: "#27ae60" } : undefined}
                      >
                        {adv === "normal" ? "Normal" : adv === "advantage" ? "Adv" : "Dis"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginLeft: "auto" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", display: "block", marginBottom: "4px", textAlign: "center" }}>
                  {count}d{selectedDie}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}
                  {advantage !== "normal" && ` (${advantage === "advantage" ? "Adv" : "Dis"})`}
                </span>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={roll}
                  disabled={isRolling}
                  style={{ background: isRolling ? "var(--text-muted)" : undefined, minWidth: "120px" }}
                >
                  {isRolling ? "🎲 Rolling..." : "🎲 Roll!"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-header">
            <h3 className="card-title">Result</h3>
            {result && <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{result.dice}{result.modifier ? (result.modifier > 0 ? ` +${result.modifier}` : ` ${result.modifier}`) : ""}</span>}
          </div>
          <div className="card-body" style={{ textAlign: "center", padding: "32px 16px" }}>
            {result ? (
              <>
                <div
                  className={`dice-result-number ${isRolling ? "rolling" : ""}`}
                  style={{
                    color: isNat20 ? "var(--accent-gold-light)" :
                      isNat1 ? "var(--accent-red)" : "var(--text-primary)"
                  }}
                >
                  {result.total}
                </div>
                {isNat20 && <div style={{ color: "var(--accent-gold-light)", fontSize: "20px", fontWeight: 700, marginTop: "8px" }}>✨ NATURAL 20! ✨</div>}
                {isNat1 && <div style={{ color: "var(--accent-red)", fontSize: "20px", fontWeight: 700, marginTop: "8px" }}>💀 CRITICAL FAIL</div>}

                {result.rolls.length > 1 && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Individual rolls:</div>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      {result.rolls.map((r, i) => {
                        const isMax = r === selectedDie;
                        const isMin = r === 1;
                        return (
                          <div
                            key={i}
                            style={{
                              width: "40px", height: "40px",
                              background: isMax ? "rgba(184,150,12,0.2)" : isMin ? "rgba(196,30,58,0.2)" : "var(--bg-secondary)",
                              border: `2px solid ${isMax ? "var(--accent-gold)" : isMin ? "var(--accent-red)" : "var(--border-color)"}`,
                              borderRadius: "6px",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: 700,
                              color: isMax ? "var(--accent-gold-light)" : isMin ? "var(--accent-red)" : "var(--text-primary)"
                            }}
                          >
                            {r}
                          </div>
                        );
                      })}
                      {result.modifier !== 0 && (
                        <>
                          <div style={{ display: "flex", alignItems: "center", fontSize: "16px", color: "var(--text-secondary)" }}>
                            {result.modifier > 0 ? "+" : ""}{result.modifier}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: "18px" }}>
                Click "Roll!" to roll the dice
              </div>
            )}
          </div>
        </div>

        {/* Custom Roll */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Custom Roll</h3></div>
          <div className="card-body">
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. 3d6+5, 1d20-2, 2d8"
                value={customExpr}
                onChange={e => setCustomExpr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && rollCustom()}
              />
              <button className="btn btn-secondary" onClick={rollCustom}>Roll</button>
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div>
        {/* Quick Roll Buttons */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-header"><h3 className="card-title">⚡ Quick Roll</h3></div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { label: "Ability Check", expr: "1d20+0" },
                { label: "Initiative", expr: "1d20+0" },
                { label: "Attack Roll", expr: "1d20+5" },
                { label: "1d4 Damage", expr: "1d4+0" },
                { label: "1d6 Damage", expr: "1d6+3" },
                { label: "1d8 Damage", expr: "1d8+3" },
                { label: "Fireball", expr: "8d6+0" },
                { label: "Healing", expr: "1d8+3" },
              ].map(({ label, expr }) => (
                <button
                  key={label}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "11px" }}
                  onClick={() => {
                    const m = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/);
                    if (!m) return;
                    const cnt = parseInt(m[1]), sides = parseInt(m[2]), mod = m[3] ? parseInt(m[3]) : 0;
                    const rolls = Array.from({ length: cnt }, () => Math.ceil(Math.random() * sides));
                    const total = rolls.reduce((a, b) => a + b, 0) + mod;
                    const res: RollResult = { dice: `${cnt}d${sides}`, rolls, modifier: mod, total, timestamp: new Date().toLocaleTimeString() };
                    setResult(res);
                    setHistory(prev => [res, ...prev.slice(0, 19)]);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roll History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📜 History</h3>
            {history.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setHistory([])}>Clear</button>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {history.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No rolls yet
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {h.dice}{h.modifier !== 0 ? (h.modifier > 0 ? ` +${h.modifier}` : ` ${h.modifier}`) : ""}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        [{h.rolls.join(", ")}]
                      </div>
                    </div>
                    <div style={{
                      fontSize: "22px",
                      fontFamily: "var(--font-title)",
                      fontWeight: 700,
                      color: h.rolls.some(r => r === 20) && h.dice.includes("d20") ? "var(--accent-gold-light)" :
                        h.rolls.some(r => r === 1) && h.dice.includes("d20") ? "var(--accent-red)" : "var(--text-primary)"
                    }}>
                      {h.total}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{h.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
