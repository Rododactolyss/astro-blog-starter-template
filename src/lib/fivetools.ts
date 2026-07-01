// 5etools data integration layer.
// Loads raw 5etools JSON (from the 5etools-mirror-3 GitHub mirror) client-side,
// renders their custom {@tag ...} markup, and normalizes stat blocks / spells
// into flat shapes the React components consume.

const BASE = "https://raw.githubusercontent.com/5etools-mirror-3/5etools-2014-src/main/data";

// ---------------------------------------------------------------------------
// Tag rendering — converts 5etools "{@damage 1d6}" style markup into text.
// ---------------------------------------------------------------------------

function renderAtk(code: string): string {
  // codes like "mw", "rw", "mw,rw", "ms", "rs"
  const types = new Set<string>();
  let kind = "Weapon";
  code.split(",").forEach(tok => {
    tok = tok.trim();
    if (tok[0] === "m") types.add("Melee");
    if (tok[0] === "r") types.add("Ranged");
    if (tok[1] === "s") kind = "Spell";
    if (tok[1] === "w") kind = "Weapon";
  });
  const t = [...types].join(" or ");
  return `${t} ${kind} Attack:`;
}

const PASS_THROUGH = new Set([
  "b","bold","i","italic","note","damage","dice","d20","dc","spell","creature",
  "item","condition","skill","sense","action","class","race","feat","background",
  "disease","status","table","filter","book","adventure","deity","hazard","object",
  "reward","vehicle","optfeature","variantrule","language","charoption","quickref",
  "footnote","area","color","highlight","5etools","hitYourSpellAttack","itementry",
  "cult","boon","psionic","classFeature","subclassFeature","recipe","card","legroup",
]);

export function stripTags(input: string | undefined | null): string {
  if (!input) return "";
  let str = String(input);
  // Run several passes to resolve the occasional nested tag.
  for (let pass = 0; pass < 4 && str.includes("{@"); pass++) {
    str = str.replace(/\{@(\w+)(?:\s+([^{}]*))?\}/g, (_m, tag: string, content = "") => {
      const parts = content.split("|");
      switch (tag) {
        case "hit": {
          const n = parts[0].trim();
          return n.startsWith("-") || n.startsWith("+") ? n : `+${n}`;
        }
        case "dc": return `DC ${parts[0]}`;
        case "chance": return `${parts[0]} percent`;
        case "recharge": return parts[0] ? `(Recharge ${parts[0]}–6)` : "(Recharge 6)";
        case "atk": return renderAtk(parts[0]);
        case "h": return "Hit: ";
        case "scaledamage":
        case "scaledice": return parts[parts.length - 1];
        default:
          if (PASS_THROUGH.has(tag)) {
            // Reference tags: prefer the explicit display text (last segment).
            return (parts.length > 1 ? parts[parts.length - 1] : parts[0]) || parts[0];
          }
          return parts[parts.length - 1] || parts[0] || "";
      }
    });
  }
  return str;
}

// 5etools "entries" can be strings or nested objects. Flatten to paragraph strings.
export function renderEntries(entries: any[] | undefined): string[] {
  if (!entries) return [];
  const out: string[] = [];
  const walk = (e: any, prefix = "") => {
    if (e == null) return;
    if (typeof e === "string") { out.push(prefix + stripTags(e)); return; }
    if (typeof e === "number") { out.push(prefix + String(e)); return; }
    if (Array.isArray(e)) { e.forEach(x => walk(x, prefix)); return; }
    switch (e.type) {
      case "entries":
      case "section":
      case "inset":
      case "insetReadaloud": {
        if (e.name) out.push(`**${stripTags(e.name)}**`);
        (e.entries || []).forEach((x: any) => walk(x, prefix));
        break;
      }
      case "list": {
        (e.items || []).forEach((it: any) => walk(it, prefix + "• "));
        break;
      }
      case "item": {
        const label = e.name ? `**${stripTags(e.name)}** ` : "";
        if (e.entries) { out.push(prefix + label + stripTags(e.entries[0] ?? "")); e.entries.slice(1).forEach((x: any) => walk(x, prefix)); }
        else if (e.entry) out.push(prefix + label + stripTags(e.entry));
        break;
      }
      case "table": {
        if (e.caption) out.push(`**${stripTags(e.caption)}**`);
        (e.rows || []).forEach((row: any[]) => {
          out.push(prefix + row.map(c => stripTags(typeof c === "object" ? (c.roll ? `${c.roll.min}–${c.roll.max}` : "") : c)).join(" | "));
        });
        break;
      }
      case "quote": {
        (e.entries || []).forEach((x: any) => walk(x, prefix + "“"));
        break;
      }
      default:
        if (e.entries) (e.entries).forEach((x: any) => walk(x, prefix));
        else if (e.entry) walk(e.entry, prefix);
    }
  };
  entries.forEach(e => walk(e));
  return out.filter(s => s.trim().length > 0);
}

// ---------------------------------------------------------------------------
// Shared code maps
// ---------------------------------------------------------------------------

const SIZE: Record<string, string> = { T: "Tiny", S: "Small", M: "Medium", L: "Large", H: "Huge", G: "Gargantuan" };
const ALIGN: Record<string, string> = { L: "Lawful", N: "Neutral", C: "Chaotic", G: "Good", E: "Evil", U: "Unaligned", A: "Any" };
export const SCHOOLS: Record<string, string> = {
  A: "Abjuration", C: "Conjuration", D: "Divination", E: "Enchantment",
  V: "Evocation", I: "Illusion", N: "Necromancy", T: "Transmutation", P: "Psionic",
};

export const CR_XP: Record<string, number> = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700,
  "4": 1100, "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
  "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000, "16": 15000,
  "17": 18000, "18": 20000, "19": 22000, "20": 25000, "21": 33000, "22": 41000,
  "23": 50000, "24": 62000, "25": 75000, "26": 90000, "27": 105000, "28": 120000,
  "29": 135000, "30": 155000,
};

export const CR_ORDER = Object.keys(CR_XP);

export function crToNumber(cr: string): number {
  if (cr.includes("/")) { const [a, b] = cr.split("/"); return Number(a) / Number(b); }
  return Number(cr);
}

// ---------------------------------------------------------------------------
// Monster normalization
// ---------------------------------------------------------------------------

export interface NormMonster {
  id: string;
  name: string;
  source: string;
  size: string;
  type: string;
  alignment: string;
  ac: string;
  acNumber: number;
  hp: string;
  hpNumber: number;
  speed: string;
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
  saves: string;
  skills: string;
  vulnerable: string;
  resist: string;
  immune: string;
  conditionImmune: string;
  senses: string;
  languages: string;
  cr: string;
  xp: number;
  traits: { name: string; entries: string[] }[];
  actions: { name: string; entries: string[] }[];
  bonusActions: { name: string; entries: string[] }[];
  reactions: { name: string; entries: string[] }[];
  legendary: { name: string; entries: string[] }[];
  legendaryHeader: string;
  spellcasting: string[];
}

function renderType(type: any): string {
  if (!type) return "";
  if (typeof type === "string") return type;
  let base = type.type;
  if (typeof base === "object") base = base.choose ? base.choose.join("/") : "";
  const tags = (type.tags || []).map((t: any) => typeof t === "string" ? t : t.tag).filter(Boolean);
  return tags.length ? `${base} (${tags.join(", ")})` : base;
}

function renderAlign(al: any[]): string {
  if (!al || !al.length) return "—";
  if (typeof al[0] === "object") {
    // e.g. {alignment:[...], chance} or {special}
    if (al[0].special) return al[0].special;
    if (al[0].alignment) return al[0].alignment.map((c: string) => ALIGN[c] || c).join(" ");
    return "Any alignment";
  }
  if (al.length === 2 && al[0] === "N" && al[1] === "N") return "Neutral";
  if (al.length === 1 && al[0] === "N") return "Neutral";
  return al.map((c: string) => ALIGN[c] || c).join(" ");
}

function renderAC(ac: any[]): { text: string; num: number } {
  if (!ac || !ac.length) return { text: "—", num: 10 };
  let num = 10;
  const parts = ac.map((a, i) => {
    if (typeof a === "number") { if (i === 0) num = a; return String(a); }
    if (i === 0) num = a.ac;
    const from = a.from ? ` (${a.from.map(stripTags).join(", ")})` : "";
    const cond = a.condition ? ` ${stripTags(a.condition)}` : "";
    return `${a.ac}${from}${cond}`;
  });
  return { text: parts.join(", "), num };
}

function renderSpeed(speed: any): string {
  if (!speed) return "—";
  if (typeof speed === "number") return `${speed} ft.`;
  const order = ["walk", "burrow", "climb", "fly", "swim"];
  const parts: string[] = [];
  for (const k of order) {
    const v = speed[k];
    if (v == null) continue;
    const n = typeof v === "object" ? v.number : v;
    const cond = typeof v === "object" && v.condition ? ` ${stripTags(v.condition)}` : "";
    const hover = k === "fly" && speed.canHover ? " (hover)" : "";
    parts.push(k === "walk" ? `${n} ft.${cond}${hover}` : `${k} ${n} ft.${cond}${hover}`);
  }
  return parts.join(", ") || "—";
}

function renderAbilObj(obj: any): string {
  if (!obj) return "";
  return Object.entries(obj)
    .filter(([k]) => k !== "other")
    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v}`)
    .join(", ");
}

function renderDamageList(arr: any[] | undefined): string {
  if (!arr || !arr.length) return "";
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === "string") out.push(item);
    else if (item.resist) out.push(`${item.preNote ? item.preNote + " " : ""}${item.resist.map((x: any) => typeof x === "string" ? x : renderDamageList([x])).join(", ")}${item.note ? " " + item.note : ""}`);
    else if (item.immune) out.push(`${item.preNote ? item.preNote + " " : ""}${item.immune.map((x: any) => typeof x === "string" ? x : renderDamageList([x])).join(", ")}${item.note ? " " + item.note : ""}`);
    else if (item.vulnerable) out.push(item.vulnerable.map((x: any) => typeof x === "string" ? x : renderDamageList([x])).join(", "));
    else if (item.special) out.push(item.special);
    else if (item.conditionImmune) out.push(item.conditionImmune.join(", "));
  }
  return out.join("; ");
}

function renderNamedBlock(arr: any[] | undefined): { name: string; entries: string[] }[] {
  if (!arr) return [];
  return arr.map(a => ({ name: stripTags(a.name || ""), entries: renderEntries(a.entries) }));
}

function renderSpellcasting(sc: any[] | undefined): string[] {
  if (!sc) return [];
  const out: string[] = [];
  for (const block of sc) {
    if (block.name) out.push(`**${stripTags(block.name)}**`);
    out.push(...renderEntries(block.headerEntries));
    if (block.will) out.push(`At will: ${block.will.map((s: any) => stripTags(typeof s === "string" ? s : s.entry || "")).join(", ")}`);
    if (block.daily) {
      for (const [freq, spells] of Object.entries(block.daily)) {
        const label = freq.replace("e", "/day each").replace(/^(\d)$/, "$1/day");
        out.push(`${label}: ${(spells as any[]).map((s: any) => stripTags(typeof s === "string" ? s : s.entry || "")).join(", ")}`);
      }
    }
    if (block.spells) {
      for (const [lvl, data] of Object.entries<any>(block.spells)) {
        const lvlLabel = lvl === "0" ? "Cantrips (at will)" :
          `Level ${lvl}${data.slots != null ? ` (${data.slots} slot${data.slots !== 1 ? "s" : ""})` : ""}`;
        out.push(`${lvlLabel}: ${(data.spells || []).map((s: string) => stripTags(s)).join(", ")}`);
      }
    }
    out.push(...renderEntries(block.footerEntries));
  }
  return out.filter(Boolean);
}

export function normalizeMonster(m: any): NormMonster {
  const acR = renderAC(m.ac);
  const crRaw = typeof m.cr === "object" ? (m.cr?.cr ?? "") : (m.cr ?? "");
  const cr = String(crRaw);
  const senses = [...(m.senses || []).map(stripTags), `passive Perception ${m.passive ?? 10}`].join(", ");
  const legActions = m.legendaryActions ?? 3;
  return {
    id: `${m.name}|${m.source}`.replace(/\s+/g, "-").toLowerCase(),
    name: m.name,
    source: m.source,
    size: (m.size || []).map((s: string) => SIZE[s] || s).join("/") || "Medium",
    type: renderType(m.type),
    alignment: renderAlign(m.alignment),
    ac: acR.text,
    acNumber: acR.num,
    hp: m.hp?.special ? stripTags(m.hp.special) : `${m.hp?.average ?? "?"}${m.hp?.formula ? ` (${m.hp.formula})` : ""}`,
    hpNumber: m.hp?.average ?? 0,
    speed: renderSpeed(m.speed),
    str: m.str ?? 10, dex: m.dex ?? 10, con: m.con ?? 10, int: m.int ?? 10, wis: m.wis ?? 10, cha: m.cha ?? 10,
    saves: renderAbilObj(m.save),
    skills: renderAbilObj(m.skill),
    vulnerable: renderDamageList(m.vulnerable),
    resist: renderDamageList(m.resist),
    immune: renderDamageList(m.immune),
    conditionImmune: renderDamageList(m.conditionImmune),
    senses,
    languages: (m.languages || []).map(stripTags).join(", ") || "—",
    cr,
    xp: CR_XP[cr] ?? 0,
    traits: renderNamedBlock(m.trait),
    actions: renderNamedBlock(m.action),
    bonusActions: renderNamedBlock(m.bonus),
    reactions: renderNamedBlock(m.reaction),
    legendary: renderNamedBlock(m.legendary),
    legendaryHeader: m.legendary?.length
      ? (m.legendaryHeader ? renderEntries(m.legendaryHeader).join(" ")
        : `The ${m.name.toLowerCase()} can take ${legActions} legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${m.name.toLowerCase()} regains spent legendary actions at the start of its turn.`)
      : "",
    spellcasting: renderSpellcasting(m.spellcasting),
  };
}

// ---------------------------------------------------------------------------
// Spell normalization
// ---------------------------------------------------------------------------

export interface NormSpell {
  id: string;
  name: string;
  source: string;
  level: number;
  school: string;
  time: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  entries: string[];
  higherLevel: string[];
  classes: string[];
  damageTypes: string[];
}

function renderTime(time: any[]): string {
  if (!time || !time.length) return "—";
  return time.map(t => {
    const unit = t.number > 1 ? `${t.unit}s` : t.unit;
    return `${t.number} ${unit}${t.condition ? `, ${stripTags(t.condition)}` : ""}`;
  }).join(" or ");
}

function renderRange(range: any): string {
  if (!range) return "—";
  if (range.type === "special") return "Special";
  if (range.type === "point") {
    const d = range.distance;
    if (!d) return "—";
    if (d.type === "touch") return "Touch";
    if (d.type === "self") return "Self";
    if (d.type === "sight") return "Sight";
    if (d.type === "unlimited") return "Unlimited";
    if (d.type === "feet") return `${d.amount} feet`;
    if (d.type === "miles") return `${d.amount} mile${d.amount !== 1 ? "s" : ""}`;
    return `${d.amount ?? ""} ${d.type}`.trim();
  }
  // radius / sphere / cone / line etc, usually self-originating
  const d = range.distance;
  const shape = range.type;
  if (d) return `Self (${d.amount}-${d.type === "feet" ? "foot" : d.type} ${shape})`;
  return `Self (${shape})`;
}

function renderComponents(c: any): string {
  if (!c) return "—";
  const parts: string[] = [];
  if (c.v) parts.push("V");
  if (c.s) parts.push("S");
  if (c.m) {
    if (typeof c.m === "string") parts.push(`M (${c.m})`);
    else if (c.m.text) parts.push(`M (${c.m.text})`);
    else parts.push("M");
  }
  if (c.r) parts.push("R");
  return parts.join(", ");
}

function renderDuration(dur: any[]): { text: string; concentration: boolean } {
  if (!dur || !dur.length) return { text: "—", concentration: false };
  let concentration = false;
  const text = dur.map(d => {
    if (d.type === "instant") return "Instantaneous";
    if (d.type === "permanent") return d.ends ? `Until dispelled${d.ends.includes("trigger") ? " or triggered" : ""}` : "Until dispelled";
    if (d.type === "special") return "Special";
    if (d.type === "timed") {
      concentration = concentration || !!d.concentration;
      const amt = d.duration?.amount;
      const unit = d.duration?.type;
      const label = `${amt} ${unit}${amt !== 1 ? "s" : ""}`;
      return d.concentration ? `Concentration, up to ${label}` : label;
    }
    return d.type;
  }).join(" or ");
  return { text, concentration };
}

export function normalizeSpell(s: any, classLookup?: Record<string, string[]>): NormSpell {
  const dur = renderDuration(s.duration);
  const key = s.name.toLowerCase();
  return {
    id: `${s.name}|${s.source}`.replace(/\s+/g, "-").toLowerCase(),
    name: s.name,
    source: s.source,
    level: s.level,
    school: SCHOOLS[s.school] || s.school,
    time: renderTime(s.time),
    range: renderRange(s.range),
    components: renderComponents(s.components),
    duration: dur.text,
    concentration: dur.concentration || !!s.meta?.concentration,
    ritual: !!s.meta?.ritual,
    entries: renderEntries(s.entries),
    higherLevel: s.entriesHigherLevel
      ? renderEntries(s.entriesHigherLevel).filter(e => e.trim().toLowerCase() !== "**at higher levels**")
      : [],
    classes: classLookup?.[key] || [],
    damageTypes: s.damageInflict || [],
  };
}

// ---------------------------------------------------------------------------
// Data loading (memoized module-level; cached for the browser session)
// ---------------------------------------------------------------------------

const MONSTER_SOURCES = ["MM", "MPMM"];
const SPELL_SOURCES = ["PHB", "XGE", "TCE"];

async function fetchJson(path: string): Promise<any> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

let monsterPromise: Promise<NormMonster[]> | null = null;
export function loadMonsters(): Promise<NormMonster[]> {
  if (!monsterPromise) {
    monsterPromise = (async () => {
      const files = await Promise.all(
        MONSTER_SOURCES.map(src =>
          fetchJson(`bestiary/bestiary-${src.toLowerCase()}.json`).catch(() => ({ monster: [] }))
        )
      );
      const raw = files.flatMap(f => f.monster || []);
      const seen = new Set<string>();
      const list: NormMonster[] = [];
      for (const m of raw) {
        if (m._copy || m.isNpc) continue; // skip _copy stubs / NPC variants
        const nm = normalizeMonster(m);
        if (seen.has(nm.name)) continue;
        seen.add(nm.name);
        list.push(nm);
      }
      list.sort((a, b) => crToNumber(a.cr) - crToNumber(b.cr) || a.name.localeCompare(b.name));
      return list;
    })();
  }
  return monsterPromise;
}

let spellPromise: Promise<NormSpell[]> | null = null;
export function loadSpells(): Promise<NormSpell[]> {
  if (!spellPromise) {
    spellPromise = (async () => {
      const [lookupRaw, ...files] = await Promise.all([
        fetchJson("generated/gendata-spell-source-lookup.json").catch(() => ({})),
        ...SPELL_SOURCES.map(src =>
          fetchJson(`spells/spells-${src.toLowerCase()}.json`).catch(() => ({ spell: [] }))
        ),
      ]);
      // Build lowercase spell name -> class names, merging across all sources.
      const classLookup: Record<string, string[]> = {};
      for (const bySpell of Object.values<any>(lookupRaw)) {
        // lookupRaw is keyed by source; each maps spellName -> { class: { srcCode: {Class: ...} } }
        if (!bySpell || typeof bySpell !== "object") continue;
        for (const [spellName, info] of Object.entries<any>(bySpell)) {
          const classes = new Set(classLookup[spellName.toLowerCase()] || []);
          const clsBySrc = info?.class;
          if (clsBySrc) {
            for (const clsObj of Object.values<any>(clsBySrc)) {
              for (const clsName of Object.keys(clsObj || {})) classes.add(clsName);
            }
          }
          classLookup[spellName.toLowerCase()] = [...classes];
        }
      }
      const raw = files.flatMap(f => f.spell || []);
      const seen = new Set<string>();
      const list: NormSpell[] = [];
      for (const s of raw) {
        const ns = normalizeSpell(s, classLookup);
        if (seen.has(ns.name)) continue;
        seen.add(ns.name);
        list.push(ns);
      }
      list.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
      return list;
    })();
  }
  return spellPromise;
}
