export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SkillProficiency {
  proficient: boolean;
  expertise: boolean;
}

export interface SpellSlots {
  [level: number]: { max: number; used: number };
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  equipped?: boolean;
  notes?: string;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  subclass?: string;
  background: string;
  level: number;
  experiencePoints: number;
  abilityScores: AbilityScores;
  proficiencyBonus: number;
  savingThrowProficiencies: string[];
  skillProficiencies: { [skill: string]: SkillProficiency };
  inspiration: boolean;
  maxHP: number;
  currentHP: number;
  temporaryHP: number;
  armorClass: number;
  initiative: number;
  speed: number;
  hitDice: { total: number; used: number; type: number };
  deathSaves: { successes: number; failures: number };
  attacks: { name: string; attackBonus: string; damage: string; damageType: string }[];
  equipment: InventoryItem[];
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number };
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  features: string;
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellSlots?: SpellSlots;
  knownSpells?: string[];
  preparedSpells?: string[];
  alignment: string;
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  backstory?: string;
  portrait?: string;
  createdAt: string;
  updatedAt: string;
}

export const SKILLS = [
  { name: "Acrobatics", ability: "dexterity" },
  { name: "Animal Handling", ability: "wisdom" },
  { name: "Arcana", ability: "intelligence" },
  { name: "Athletics", ability: "strength" },
  { name: "Deception", ability: "charisma" },
  { name: "History", ability: "intelligence" },
  { name: "Insight", ability: "wisdom" },
  { name: "Intimidation", ability: "charisma" },
  { name: "Investigation", ability: "intelligence" },
  { name: "Medicine", ability: "wisdom" },
  { name: "Nature", ability: "intelligence" },
  { name: "Perception", ability: "wisdom" },
  { name: "Performance", ability: "charisma" },
  { name: "Persuasion", ability: "charisma" },
  { name: "Religion", ability: "intelligence" },
  { name: "Sleight of Hand", ability: "dexterity" },
  { name: "Stealth", ability: "dexterity" },
  { name: "Survival", ability: "wisdom" },
];

export const ABILITY_NAMES: (keyof AbilityScores)[] = [
  "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"
];

export const ABILITY_SHORT: Record<keyof AbilityScores, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000,
  48000, 64000, 85000, 100000, 120000, 140000,
  165000, 195000, 225000, 265000, 305000, 355000
];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export const SPELL_SLOTS_BY_LEVEL: Record<number, number[]> = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export function createDefaultCharacter(): Partial<Character> {
  return {
    id: crypto.randomUUID(),
    name: "New Adventurer",
    race: "",
    class: "",
    background: "",
    level: 1,
    experiencePoints: 0,
    abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    proficiencyBonus: 2,
    savingThrowProficiencies: [],
    skillProficiencies: {},
    inspiration: false,
    maxHP: 10,
    currentHP: 10,
    temporaryHP: 0,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitDice: { total: 1, used: 0, type: 8 },
    deathSaves: { successes: 0, failures: 0 },
    attacks: [],
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    features: "",
    alignment: "True Neutral",
    backstory: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
