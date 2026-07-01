export interface Condition {
  id: string;
  name: string;
  icon: string;
  color: string;
  summary: string;
  effects: string[];
  endCondition?: string;
}

export const CONDITIONS: Condition[] = [
  {
    id: "blinded",
    name: "Blinded",
    icon: "👁️",
    color: "#6c757d",
    summary: "A blinded creature can't see and automatically fails any ability check that requires sight.",
    effects: [
      "A blinded creature can't see and automatically fails any ability check that requires sight.",
      "Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
    ],
  },
  {
    id: "charmed",
    name: "Charmed",
    icon: "💕",
    color: "#e91e8c",
    summary: "A charmed creature can't attack the charmer or target them with harmful abilities or magical effects.",
    effects: [
      "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.",
      "The charmer has advantage on any ability check to interact socially with the creature.",
    ],
  },
  {
    id: "deafened",
    name: "Deafened",
    icon: "🔇",
    color: "#795548",
    summary: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
    effects: [
      "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
    ],
  },
  {
    id: "exhaustion",
    name: "Exhaustion",
    icon: "😴",
    color: "#9c27b0",
    summary: "Exhaustion has 6 cumulative levels. Reaching level 6 kills the creature. Each long rest removes one level.",
    effects: [
      "Level 1: Disadvantage on ability checks.",
      "Level 2: Speed halved.",
      "Level 3: Disadvantage on attack rolls and saving throws.",
      "Level 4: Hit point maximum halved.",
      "Level 5: Speed reduced to 0.",
      "Level 6: Death.",
    ],
    endCondition: "Finishing a long rest reduces exhaustion level by 1.",
  },
  {
    id: "frightened",
    name: "Frightened",
    icon: "😨",
    color: "#ff5722",
    summary: "A frightened creature has disadvantage on ability checks and attack rolls while the source of fear is within line of sight.",
    effects: [
      "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.",
      "The creature can't willingly move closer to the source of its fear.",
    ],
  },
  {
    id: "grappled",
    name: "Grappled",
    icon: "🤝",
    color: "#607d8b",
    summary: "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
    effects: [
      "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
      "The condition ends if the grappler is incapacitated.",
      "The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect.",
    ],
  },
  {
    id: "incapacitated",
    name: "Incapacitated",
    icon: "⚡",
    color: "#f39c12",
    summary: "An incapacitated creature can't take actions or reactions.",
    effects: [
      "An incapacitated creature can't take actions or reactions.",
    ],
  },
  {
    id: "invisible",
    name: "Invisible",
    icon: "👻",
    color: "#00bcd4",
    summary: "An invisible creature is impossible to see without the aid of magic or a special sense.",
    effects: [
      "An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured.",
      "The creature's location can be detected by any noise it makes or any tracks it leaves.",
      "Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
    ],
  },
  {
    id: "paralyzed",
    name: "Paralyzed",
    icon: "🧊",
    color: "#3498db",
    summary: "A paralyzed creature is incapacitated and can't move or speak.",
    effects: [
      "A paralyzed creature is incapacitated (see the condition) and can't move or speak.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "Attack rolls against the creature have advantage.",
      "Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
    ],
  },
  {
    id: "petrified",
    name: "Petrified",
    icon: "🗿",
    color: "#8d6e63",
    summary: "A petrified creature is transformed into a solid inanimate substance (usually stone) and is incapacitated.",
    effects: [
      "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.",
      "The creature is incapacitated, can't move or speak, and is unaware of its surroundings.",
      "Attack rolls against the creature have advantage.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "The creature has resistance to all damage.",
      "The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
    ],
  },
  {
    id: "poisoned",
    name: "Poisoned",
    icon: "🤢",
    color: "#4caf50",
    summary: "A poisoned creature has disadvantage on attack rolls and ability checks.",
    effects: [
      "A poisoned creature has disadvantage on attack rolls and ability checks.",
    ],
  },
  {
    id: "prone",
    name: "Prone",
    icon: "⬇️",
    color: "#ff9800",
    summary: "A prone creature's only movement option is to crawl, unless it stands up.",
    effects: [
      "A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.",
      "The creature has disadvantage on attack rolls.",
      "An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.",
    ],
    endCondition: "Standing up requires spending movement equal to half your speed.",
  },
  {
    id: "restrained",
    name: "Restrained",
    icon: "⛓️",
    color: "#795548",
    summary: "A restrained creature's speed becomes 0 and it has disadvantage on attack rolls and Dexterity saves.",
    effects: [
      "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
      "Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
      "The creature has disadvantage on Dexterity saving throws.",
    ],
  },
  {
    id: "stunned",
    name: "Stunned",
    icon: "💫",
    color: "#ffc107",
    summary: "A stunned creature is incapacitated, can't move, and can speak only falteringly.",
    effects: [
      "A stunned creature is incapacitated (see the condition), can't move, and can speak only falteringly.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "Attack rolls against the creature have advantage.",
    ],
  },
  {
    id: "unconscious",
    name: "Unconscious",
    icon: "💤",
    color: "#455a64",
    summary: "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings.",
    effects: [
      "An unconscious creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings.",
      "The creature drops whatever it's holding and falls prone.",
      "The creature automatically fails Strength and Dexterity saving throws.",
      "Attack rolls against the creature have advantage.",
      "Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
    ],
  },
];
