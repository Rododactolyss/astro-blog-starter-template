export interface RaceTrait {
  name: string;
  description: string;
}

export interface Race {
  id: string;
  name: string;
  abilityScoreIncreases: { ability: string; bonus: number }[];
  size: string;
  speed: number;
  languages: string[];
  traits: RaceTrait[];
  description: string;
  subraces?: { id: string; name: string; description: string; abilityScoreIncreases: { ability: string; bonus: number }[]; traits: RaceTrait[] }[];
}

export const RACES: Race[] = [
  {
    id: "dwarf",
    name: "Dwarf",
    abilityScoreIncreases: [{ ability: "Constitution", bonus: 2 }],
    size: "Medium",
    speed: 25,
    languages: ["Common", "Dwarvish"],
    description: "Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. Though they stand well under 5 feet tall, dwarves are so broad and compact that they can weigh as much as a human standing nearly two feet taller.",
    traits: [
      { name: "Darkvision", description: "Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light." },
      { name: "Dwarven Resilience", description: "You have advantage on saving throws against poison, and you have resistance against poison damage." },
      { name: "Dwarven Combat Training", description: "You have proficiency with the battleaxe, handaxe, light hammer, and warhammer." },
      { name: "Tool Proficiency", description: "You gain proficiency with the artisan's tools of your choice: smith's tools, brewer's supplies, or mason's tools." },
      { name: "Stonecunning", description: "Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check." },
    ],
    subraces: [
      {
        id: "hill-dwarf",
        name: "Hill Dwarf",
        description: "As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.",
        abilityScoreIncreases: [{ ability: "Wisdom", bonus: 1 }],
        traits: [
          { name: "Dwarven Toughness", description: "Your hit point maximum increases by 1, and it increases by 1 every time you gain a level." },
        ],
      },
      {
        id: "mountain-dwarf",
        name: "Mountain Dwarf",
        description: "As a mountain dwarf, you're strong and hardy, accustomed to a difficult life in rugged terrain.",
        abilityScoreIncreases: [{ ability: "Strength", bonus: 2 }],
        traits: [
          { name: "Dwarven Armor Training", description: "You have proficiency with light and medium armor." },
        ],
      },
    ],
  },
  {
    id: "elf",
    name: "Elf",
    abilityScoreIncreases: [{ ability: "Dexterity", bonus: 2 }],
    size: "Medium",
    speed: 30,
    languages: ["Common", "Elvish"],
    description: "Elves are a magical people of otherworldly grace, living in the world but not entirely part of it. They live in places of ethereal beauty, in the midst of ancient forests or in silvery spires glittering with faerie light, where soft music drifts through the air and gentle fragrances waft on the breeze.",
    traits: [
      { name: "Darkvision", description: "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light." },
      { name: "Keen Senses", description: "You have proficiency in the Perception skill." },
      { name: "Fey Ancestry", description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Trance", description: "Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. While meditating, you can dream after a fashion; such dreams are actually mental exercises that have become reflexive through years of practice." },
    ],
    subraces: [
      {
        id: "high-elf",
        name: "High Elf",
        description: "As a high elf, you have a keen mind and a mastery of at least the basics of magic.",
        abilityScoreIncreases: [{ ability: "Intelligence", bonus: 1 }],
        traits: [
          { name: "Elf Weapon Training", description: "You have proficiency with the longsword, shortsword, shortbow, and longbow." },
          { name: "Cantrip", description: "You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it." },
          { name: "Extra Language", description: "You can speak, read, and write one extra language of your choice." },
        ],
      },
      {
        id: "wood-elf",
        name: "Wood Elf",
        description: "As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.",
        abilityScoreIncreases: [{ ability: "Wisdom", bonus: 1 }],
        traits: [
          { name: "Elf Weapon Training", description: "You have proficiency with the longsword, shortsword, shortbow, and longbow." },
          { name: "Fleet of Foot", description: "Your base walking speed increases to 35 feet." },
          { name: "Mask of the Wild", description: "You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena." },
        ],
      },
    ],
  },
  {
    id: "halfling",
    name: "Halfling",
    abilityScoreIncreases: [{ ability: "Dexterity", bonus: 2 }],
    size: "Small",
    speed: 25,
    languages: ["Common", "Halfling"],
    description: "The comforts of home are the goals of most halflings' lives: a place to settle in peace and quiet, far from marauding monsters and clashing armies; a blazing fire and a generous meal; fine drink and fine conversation. Though some halflings live out their days in remote agricultural communities, others form nomadic bands that travel constantly.",
    traits: [
      { name: "Lucky", description: "When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll." },
      { name: "Brave", description: "You have advantage on saving throws against being frightened." },
      { name: "Halfling Nimbleness", description: "You can move through the space of any creature that is of a size larger than yours." },
    ],
    subraces: [
      {
        id: "lightfoot",
        name: "Lightfoot Halfling",
        description: "As a lightfoot halfling, you can easily hide from notice, even using other people as cover.",
        abilityScoreIncreases: [{ ability: "Charisma", bonus: 1 }],
        traits: [
          { name: "Naturally Stealthy", description: "You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you." },
        ],
      },
      {
        id: "stout",
        name: "Stout Halfling",
        description: "As a stout halfling, you're hardier than average and have some resistance to poison.",
        abilityScoreIncreases: [{ ability: "Constitution", bonus: 1 }],
        traits: [
          { name: "Stout Resilience", description: "You have advantage on saving throws against poison, and you have resistance against poison damage." },
        ],
      },
    ],
  },
  {
    id: "human",
    name: "Human",
    abilityScoreIncreases: [
      { ability: "Strength", bonus: 1 },
      { ability: "Dexterity", bonus: 1 },
      { ability: "Constitution", bonus: 1 },
      { ability: "Intelligence", bonus: 1 },
      { ability: "Wisdom", bonus: 1 },
      { ability: "Charisma", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Common", "One extra language of your choice"],
    description: "In the reckonings of most worlds, humans are the youngest of the common races, late to arrive on the world scene and short-lived in comparison to dwarves, elves, and dragons. Perhaps it is because of their shorter lives that they strive to achieve as much as they can in the years they are given.",
    traits: [
      { name: "Extra Language", description: "You can speak, read, and write one extra language of your choice." },
    ],
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    abilityScoreIncreases: [
      { ability: "Strength", bonus: 2 },
      { ability: "Charisma", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Common", "Draconic"],
    description: "Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or the dragons themselves, dragonborn originally hatched from dragon eggs as a unique race, combining the best attributes of dragons and humanoids.",
    traits: [
      { name: "Draconic Ancestry", description: "You have draconic ancestry of a particular type of dragon. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type." },
      { name: "Breath Weapon", description: "You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw." },
      { name: "Damage Resistance", description: "You have resistance to the damage type associated with your draconic ancestry." },
    ],
  },
  {
    id: "gnome",
    name: "Gnome",
    abilityScoreIncreases: [{ ability: "Intelligence", bonus: 2 }],
    size: "Small",
    speed: 25,
    languages: ["Common", "Gnomish"],
    description: "A gnome's energy and enthusiasm for living shines through every inch of his or her tiny body. Gnomes average slightly over 3 feet tall and weigh 40 to 45 pounds. Their tan or brown faces are usually adorned with broad smiles (beneath their prodigious noses), and their bright eyes shine with excitement.",
    traits: [
      { name: "Darkvision", description: "Accustomed to life underground, you have superior vision in dark and dim conditions." },
      { name: "Gnome Cunning", description: "You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic." },
    ],
    subraces: [
      {
        id: "forest-gnome",
        name: "Forest Gnome",
        description: "As a forest gnome, you have a natural knack for illusion and inherent quickness and stealth.",
        abilityScoreIncreases: [{ ability: "Dexterity", bonus: 1 }],
        traits: [
          { name: "Natural Illusionist", description: "You know the minor illusion cantrip. Intelligence is your spellcasting ability for it." },
          { name: "Speak with Small Beasts", description: "Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts." },
        ],
      },
      {
        id: "rock-gnome",
        name: "Rock Gnome",
        description: "As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.",
        abilityScoreIncreases: [{ ability: "Constitution", bonus: 1 }],
        traits: [
          { name: "Artificer's Lore", description: "Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply." },
          { name: "Tinker", description: "You have proficiency with artisan's tools (tinker's tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device." },
        ],
      },
    ],
  },
  {
    id: "half-elf",
    name: "Half-Elf",
    abilityScoreIncreases: [
      { ability: "Charisma", bonus: 2 },
      { ability: "Two others of your choice", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Common", "Elvish", "One extra language of your choice"],
    description: "Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents: human curiosity, inventiveness, and ambition tempered by the refined senses, love of nature, and artistic tastes of the elves.",
    traits: [
      { name: "Darkvision", description: "Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light." },
      { name: "Fey Ancestry", description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Skill Versatility", description: "You gain proficiency in two skills of your choice." },
    ],
  },
  {
    id: "half-orc",
    name: "Half-Orc",
    abilityScoreIncreases: [
      { ability: "Strength", bonus: 2 },
      { ability: "Constitution", bonus: 1 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Common", "Orc"],
    description: "Whether united under the leadership of a mighty warlock or having fought to a standstill after years of conflict, orc and human communities have often necessitated the intermingling of the two populations. Half-orcs have inherited a tendency toward chaos from their orc parents.",
    traits: [
      { name: "Darkvision", description: "Thanks to your orc blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light." },
      { name: "Menacing", description: "You gain proficiency in the Intimidation skill." },
      { name: "Relentless Endurance", description: "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can't use this feature again until you finish a long rest." },
      { name: "Savage Attacks", description: "When you score a critical hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit." },
    ],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    abilityScoreIncreases: [
      { ability: "Intelligence", bonus: 1 },
      { ability: "Charisma", bonus: 2 },
    ],
    size: "Medium",
    speed: 30,
    languages: ["Common", "Infernal"],
    description: "To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling. And to twist the knife, tieflings know that this is because a pact struck generations ago infused the essence of Asmodeus — overlord of the Nine Hells — into their bloodline.",
    traits: [
      { name: "Darkvision", description: "Thanks to your infernal heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light." },
      { name: "Hellish Resistance", description: "You have resistance to fire damage." },
      { name: "Infernal Legacy", description: "You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can also cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells." },
    ],
  },
];

export function getRaceById(id: string): Race | undefined {
  return RACES.find(r => r.id === id);
}
