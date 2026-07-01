export interface Equipment {
  id: string;
  name: string;
  category: "weapon" | "armor" | "gear" | "tool" | "mount" | "magic";
  subcategory?: string;
  cost: string;
  weight?: number;
  description: string;
  properties?: string[];
  damage?: string;
  damageType?: string;
  range?: string;
  ac?: number;
  acBonus?: boolean;
  stealthDisadvantage?: boolean;
  rarity?: string;
  requiresAttunement?: boolean;
  magicBonus?: number;
}

export const EQUIPMENT: Equipment[] = [
  // Simple Melee Weapons
  { id: "club", name: "Club", category: "weapon", subcategory: "Simple Melee", cost: "1 sp", weight: 2, description: "A simple wooden club used as a bludgeoning weapon.", properties: ["Light"], damage: "1d4", damageType: "bludgeoning" },
  { id: "dagger", name: "Dagger", category: "weapon", subcategory: "Simple Melee", cost: "2 gp", weight: 1, description: "A small, light blade effective at close range. Often used by thieves and assassins.", properties: ["Finesse", "Light", "Thrown (range 20/60)"], damage: "1d4", damageType: "piercing" },
  { id: "greatclub", name: "Greatclub", category: "weapon", subcategory: "Simple Melee", cost: "2 sp", weight: 10, description: "A large, heavy club that delivers devastating blows.", properties: ["Two-handed"], damage: "1d8", damageType: "bludgeoning" },
  { id: "handaxe", name: "Handaxe", category: "weapon", subcategory: "Simple Melee", cost: "5 gp", weight: 2, description: "A small axe that can be thrown or used as a melee weapon.", properties: ["Light", "Thrown (range 20/60)"], damage: "1d6", damageType: "slashing" },
  { id: "javelin", name: "Javelin", category: "weapon", subcategory: "Simple Melee", cost: "5 sp", weight: 2, description: "A light spear designed to be thrown.", properties: ["Thrown (range 30/120)"], damage: "1d6", damageType: "piercing" },
  { id: "light-hammer", name: "Light Hammer", category: "weapon", subcategory: "Simple Melee", cost: "2 gp", weight: 2, description: "A small hammer usable as a throwing weapon.", properties: ["Light", "Thrown (range 20/60)"], damage: "1d4", damageType: "bludgeoning" },
  { id: "mace", name: "Mace", category: "weapon", subcategory: "Simple Melee", cost: "5 gp", weight: 4, description: "A heavy-headed club, often with a flanged metal head.", properties: [], damage: "1d6", damageType: "bludgeoning" },
  { id: "quarterstaff", name: "Quarterstaff", category: "weapon", subcategory: "Simple Melee", cost: "2 sp", weight: 4, description: "A simple wooden staff useful as both a walking stick and weapon.", properties: ["Versatile (1d8)"], damage: "1d6", damageType: "bludgeoning" },
  { id: "sickle", name: "Sickle", category: "weapon", subcategory: "Simple Melee", cost: "1 gp", weight: 2, description: "A curved blade on a short handle, originally a farming tool.", properties: ["Light"], damage: "1d4", damageType: "slashing" },
  { id: "spear", name: "Spear", category: "weapon", subcategory: "Simple Melee", cost: "1 gp", weight: 3, description: "A pole weapon with a pointed metal tip.", properties: ["Thrown (range 20/60)", "Versatile (1d8)"], damage: "1d6", damageType: "piercing" },

  // Simple Ranged Weapons
  { id: "crossbow-light", name: "Light Crossbow", category: "weapon", subcategory: "Simple Ranged", cost: "25 gp", weight: 5, description: "A mechanical bow that fires crossbow bolts.", properties: ["Ammunition (range 80/320)", "Loading", "Two-handed"], damage: "1d8", damageType: "piercing", range: "80/320 ft." },
  { id: "dart", name: "Dart", category: "weapon", subcategory: "Simple Ranged", cost: "5 cp", weight: 0.25, description: "A small thrown projectile.", properties: ["Finesse", "Thrown (range 20/60)"], damage: "1d4", damageType: "piercing", range: "20/60 ft." },
  { id: "shortbow", name: "Shortbow", category: "weapon", subcategory: "Simple Ranged", cost: "25 gp", weight: 2, description: "A small bow that can be used on horseback or in tight spaces.", properties: ["Ammunition (range 80/320)", "Two-handed"], damage: "1d6", damageType: "piercing", range: "80/320 ft." },
  { id: "sling", name: "Sling", category: "weapon", subcategory: "Simple Ranged", cost: "1 sp", weight: 0, description: "A leather pouch used to hurl stones or bullets.", properties: ["Ammunition (range 30/120)"], damage: "1d4", damageType: "bludgeoning", range: "30/120 ft." },

  // Martial Melee Weapons
  { id: "battleaxe", name: "Battleaxe", category: "weapon", subcategory: "Martial Melee", cost: "10 gp", weight: 4, description: "A versatile axe used by warriors.", properties: ["Versatile (1d10)"], damage: "1d8", damageType: "slashing" },
  { id: "flail", name: "Flail", category: "weapon", subcategory: "Martial Melee", cost: "10 gp", weight: 2, description: "A chain weapon with a spiked ball on the end.", properties: [], damage: "1d8", damageType: "bludgeoning" },
  { id: "glaive", name: "Glaive", category: "weapon", subcategory: "Martial Melee", cost: "20 gp", weight: 6, description: "A polearm with a single-edged blade.", properties: ["Heavy", "Reach", "Two-handed"], damage: "1d10", damageType: "slashing" },
  { id: "greataxe", name: "Greataxe", category: "weapon", subcategory: "Martial Melee", cost: "30 gp", weight: 7, description: "A massive two-handed axe capable of tremendous damage.", properties: ["Heavy", "Two-handed"], damage: "1d12", damageType: "slashing" },
  { id: "greatsword", name: "Greatsword", category: "weapon", subcategory: "Martial Melee", cost: "50 gp", weight: 6, description: "A massive two-handed sword capable of devastating strikes.", properties: ["Heavy", "Two-handed"], damage: "2d6", damageType: "slashing" },
  { id: "halberd", name: "Halberd", category: "weapon", subcategory: "Martial Melee", cost: "20 gp", weight: 6, description: "A polearm combining an axe blade and a spike.", properties: ["Heavy", "Reach", "Two-handed"], damage: "1d10", damageType: "slashing" },
  { id: "lance", name: "Lance", category: "weapon", subcategory: "Martial Melee", cost: "10 gp", weight: 6, description: "A long weapon designed to be used while mounted.", properties: ["Reach", "Special"], damage: "1d12", damageType: "piercing" },
  { id: "longsword", name: "Longsword", category: "weapon", subcategory: "Martial Melee", cost: "15 gp", weight: 3, description: "A classic knightly sword, versatile for one or two-handed use.", properties: ["Versatile (1d10)"], damage: "1d8", damageType: "slashing" },
  { id: "maul", name: "Maul", category: "weapon", subcategory: "Martial Melee", cost: "10 gp", weight: 10, description: "A massive two-handed hammer.", properties: ["Heavy", "Two-handed"], damage: "2d6", damageType: "bludgeoning" },
  { id: "morningstar", name: "Morningstar", category: "weapon", subcategory: "Martial Melee", cost: "15 gp", weight: 4, description: "A spiked mace that punctures armor.", properties: [], damage: "1d8", damageType: "piercing" },
  { id: "pike", name: "Pike", category: "weapon", subcategory: "Martial Melee", cost: "5 gp", weight: 18, description: "A very long spear used in formations.", properties: ["Heavy", "Reach", "Two-handed"], damage: "1d10", damageType: "piercing" },
  { id: "rapier", name: "Rapier", category: "weapon", subcategory: "Martial Melee", cost: "25 gp", weight: 2, description: "A slender thrusting sword favored by duelists.", properties: ["Finesse"], damage: "1d8", damageType: "piercing" },
  { id: "scimitar", name: "Scimitar", category: "weapon", subcategory: "Martial Melee", cost: "25 gp", weight: 3, description: "A curved blade favored by cavalry.", properties: ["Finesse", "Light"], damage: "1d6", damageType: "slashing" },
  { id: "shortsword", name: "Shortsword", category: "weapon", subcategory: "Martial Melee", cost: "10 gp", weight: 2, description: "A light one-handed blade, good for quick strikes.", properties: ["Finesse", "Light"], damage: "1d6", damageType: "piercing" },
  { id: "trident", name: "Trident", category: "weapon", subcategory: "Martial Melee", cost: "5 gp", weight: 4, description: "A three-pronged spear.", properties: ["Thrown (range 20/60)", "Versatile (1d8)"], damage: "1d6", damageType: "piercing" },
  { id: "war-pick", name: "War Pick", category: "weapon", subcategory: "Martial Melee", cost: "5 gp", weight: 2, description: "A pick designed to pierce armor.", properties: [], damage: "1d8", damageType: "piercing" },
  { id: "warhammer", name: "Warhammer", category: "weapon", subcategory: "Martial Melee", cost: "15 gp", weight: 2, description: "A one-handed hammer for crushing blows.", properties: ["Versatile (1d10)"], damage: "1d8", damageType: "bludgeoning" },
  { id: "whip", name: "Whip", category: "weapon", subcategory: "Martial Melee", cost: "2 gp", weight: 3, description: "A flexible leather weapon with reach.", properties: ["Finesse", "Reach"], damage: "1d4", damageType: "slashing" },

  // Martial Ranged Weapons
  { id: "crossbow-hand", name: "Hand Crossbow", category: "weapon", subcategory: "Martial Ranged", cost: "75 gp", weight: 3, description: "A compact crossbow that can be used one-handed.", properties: ["Ammunition (range 30/120)", "Light", "Loading"], damage: "1d6", damageType: "piercing", range: "30/120 ft." },
  { id: "crossbow-heavy", name: "Heavy Crossbow", category: "weapon", subcategory: "Martial Ranged", cost: "50 gp", weight: 18, description: "A powerful crossbow with a long range.", properties: ["Ammunition (range 100/400)", "Heavy", "Loading", "Two-handed"], damage: "1d10", damageType: "piercing", range: "100/400 ft." },
  { id: "longbow", name: "Longbow", category: "weapon", subcategory: "Martial Ranged", cost: "50 gp", weight: 2, description: "A tall bow capable of great range and power.", properties: ["Ammunition (range 150/600)", "Heavy", "Two-handed"], damage: "1d8", damageType: "piercing", range: "150/600 ft." },
  { id: "net", name: "Net", category: "weapon", subcategory: "Martial Ranged", cost: "1 gp", weight: 3, description: "A throwing net used to entangle enemies.", properties: ["Special", "Thrown (range 5/15)"], range: "5/15 ft." },

  // Light Armor
  { id: "padded-armor", name: "Padded Armor", category: "armor", subcategory: "Light Armor", cost: "5 gp", weight: 8, description: "Quilted layers of cloth and batting, offering minimal protection.", ac: 11, acBonus: true, stealthDisadvantage: true },
  { id: "leather-armor", name: "Leather Armor", category: "armor", subcategory: "Light Armor", cost: "10 gp", weight: 10, description: "The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil.", ac: 11, acBonus: true },
  { id: "studded-leather", name: "Studded Leather Armor", category: "armor", subcategory: "Light Armor", cost: "45 gp", weight: 13, description: "Made from tough but flexible leather, studded leather armor is reinforced with close-set rivets or spikes.", ac: 12, acBonus: true },

  // Medium Armor
  { id: "hide-armor", name: "Hide Armor", category: "armor", subcategory: "Medium Armor", cost: "10 gp", weight: 12, description: "This crude armor consists of thick furs and pelts.", ac: 12, acBonus: true },
  { id: "chain-shirt", name: "Chain Shirt", category: "armor", subcategory: "Medium Armor", cost: "50 gp", weight: 20, description: "Made of interlocking metal rings, a chain shirt is worn between layers of clothing or leather.", ac: 13, acBonus: true },
  { id: "scale-mail", name: "Scale Mail", category: "armor", subcategory: "Medium Armor", cost: "50 gp", weight: 45, description: "This armor consists of a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal.", ac: 14, acBonus: true, stealthDisadvantage: true },
  { id: "breastplate", name: "Breastplate", category: "armor", subcategory: "Medium Armor", cost: "400 gp", weight: 20, description: "This armor consists of a fitted metal chest piece worn with supple leather. Although it leaves the legs and arms relatively unprotected, this armor provides good protection for the wearer's vital organs.", ac: 14, acBonus: true },
  { id: "half-plate", name: "Half Plate Armor", category: "armor", subcategory: "Medium Armor", cost: "750 gp", weight: 40, description: "Half plate armor consists of shaped metal plates that cover most of the wearer's body.", ac: 15, acBonus: true, stealthDisadvantage: true },

  // Heavy Armor
  { id: "ring-mail", name: "Ring Mail", category: "armor", subcategory: "Heavy Armor", cost: "30 gp", weight: 40, description: "This armor is leather armor with heavy rings sewn into it.", ac: 14, stealthDisadvantage: true },
  { id: "chain-mail", name: "Chain Mail", category: "armor", subcategory: "Heavy Armor", cost: "75 gp", weight: 55, description: "Made of interlocking metal rings, chain mail includes a layer of quilted fabric worn underneath the mail to prevent chafing and to cushion the impact of blows.", ac: 16, stealthDisadvantage: true },
  { id: "splint-armor", name: "Splint Armor", category: "armor", subcategory: "Heavy Armor", cost: "200 gp", weight: 60, description: "This armor is made of narrow vertical strips of metal riveted to a backing of leather that is worn over cloth padding.", ac: 17, stealthDisadvantage: true },
  { id: "plate-armor", name: "Plate Armor", category: "armor", subcategory: "Heavy Armor", cost: "1500 gp", weight: 65, description: "Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor.", ac: 18, stealthDisadvantage: true },

  // Shield
  { id: "shield", name: "Shield", category: "armor", subcategory: "Shield", cost: "10 gp", weight: 6, description: "A shield is made from wood or metal and is carried in one hand. Wielding a shield increases your Armor Class by 2.", ac: 2, acBonus: true },

  // Adventuring Gear
  { id: "backpack", name: "Backpack", category: "gear", subcategory: "Containers", cost: "2 gp", weight: 5, description: "A leather pack with compartments and straps for carrying adventuring equipment." },
  { id: "bedroll", name: "Bedroll", category: "gear", subcategory: "Survival", cost: "1 gp", weight: 7, description: "A rolled sleeping mat for camping." },
  { id: "rope-hempen", name: "Rope, Hempen (50 feet)", category: "gear", subcategory: "Survival", cost: "1 gp", weight: 10, description: "Rope has 2 hit points and can be burst with a DC 17 Strength check." },
  { id: "rope-silk", name: "Rope, Silk (50 feet)", category: "gear", subcategory: "Survival", cost: "10 gp", weight: 5, description: "Silk rope has 2 hit points and can be burst with a DC 17 Strength check. Lighter and stronger than hemp." },
  { id: "torch", name: "Torch", category: "gear", subcategory: "Light", cost: "1 cp", weight: 1, description: "A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet." },
  { id: "lantern-bullseye", name: "Lantern, Bullseye", category: "gear", subcategory: "Light", cost: "10 gp", weight: 2, description: "A bullseye lantern casts bright light in a 60-foot cone and dim light for an additional 60 feet." },
  { id: "lantern-hooded", name: "Lantern, Hooded", category: "gear", subcategory: "Light", cost: "5 gp", weight: 2, description: "A hooded lantern casts bright light in a 30-foot radius and dim light for an additional 30 feet." },
  { id: "tinderbox", name: "Tinderbox", category: "gear", subcategory: "Survival", cost: "5 sp", weight: 1, description: "This small container holds flint, fire steel, and tinder used to kindle a fire." },
  { id: "rations", name: "Rations (1 day)", category: "gear", subcategory: "Survival", cost: "5 sp", weight: 2, description: "Rations consist of dry foods suitable for extended travel, including jerky, dried fruit, hardtack, and nuts." },
  { id: "waterskin", name: "Waterskin", category: "gear", subcategory: "Survival", cost: "2 sp", weight: 5, description: "A leather container for holding water." },
  { id: "healers-kit", name: "Healer's Kit", category: "gear", subcategory: "Medical", cost: "5 gp", weight: 3, description: "This kit is a leather pouch containing bandages, salves, and splints. The kit has ten uses." },
  { id: "holy-water", name: "Holy Water (flask)", category: "gear", subcategory: "Religious", cost: "25 gp", weight: 1, description: "As an action, you can splash the contents of this flask onto a creature within 5 feet of you or throw it up to 20 feet, shattering it on impact. In either case, make a ranged attack against a target creature, treating the holy water as an improvised weapon. If the target is a fiend or undead, it takes 2d6 radiant damage." },
  { id: "thieves-tools", name: "Thieves' Tools", category: "tool", subcategory: "Tools", cost: "25 gp", weight: 1, description: "This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers." },
  { id: "herbalism-kit", name: "Herbalism Kit", category: "tool", subcategory: "Tools", cost: "5 gp", weight: 3, description: "This kit contains a variety of instruments such as clippers, mortar and pestle, and pouches and vials used by herbalists to create remedies and potions." },
  { id: "climbers-kit", name: "Climber's Kit", category: "gear", subcategory: "Survival", cost: "25 gp", weight: 12, description: "A climber's kit includes special pitons, boot tips, gloves, and a harness." },
  { id: "disguise-kit", name: "Disguise Kit", category: "tool", subcategory: "Tools", cost: "25 gp", weight: 3, description: "This pouch of cosmetics, hair dye, and small props lets you create disguises that change your physical appearance." },
  { id: "spellbook", name: "Spellbook", category: "gear", subcategory: "Arcane", cost: "50 gp", weight: 3, description: "Essential for wizards, a spellbook is a leather-bound tome with 100 vellum pages suitable for recording spells." },
  { id: "component-pouch", name: "Component Pouch", category: "gear", subcategory: "Arcane", cost: "25 gp", weight: 2, description: "A component pouch is a small, watertight leather belt pouch that has compartments to hold all the material components and other special items you need to cast your spells." },
  { id: "arcane-focus-crystal", name: "Arcane Focus (Crystal)", category: "gear", subcategory: "Arcane", cost: "10 gp", weight: 1, description: "An arcane focus is a special item designed to channel the power of arcane spells." },
  { id: "holy-symbol", name: "Holy Symbol", category: "gear", subcategory: "Religious", cost: "5 gp", weight: 1, description: "A holy symbol is a representation of a god or pantheon. It might be an amulet depicting a symbol representing a deity, the same symbol carefully engraved or inlaid as an emblem on a shield, or a tiny box holding a fragment of a sacred relic." },
  { id: "druidic-focus", name: "Druidic Focus (Sprig of Mistletoe)", category: "gear", subcategory: "Nature", cost: "1 gp", weight: 0, description: "A druidic focus might be a sprig of mistletoe or holly, a wand or scepter made of yew or another special wood, a staff drawn whole out of a living tree, or a totem object incorporating feathers, fur, bones, and teeth from sacred animals." },
  { id: "musical-instrument-lute", name: "Lute", category: "tool", subcategory: "Musical Instruments", cost: "35 gp", weight: 2, description: "A stringed instrument played by plucking. Proficiency with a lute allows you to add your proficiency bonus to any ability check you make to play the instrument." },
  { id: "grappling-hook", name: "Grappling Hook", category: "gear", subcategory: "Survival", cost: "2 gp", weight: 4, description: "A metal hook used with rope for climbing." },

  // Magic Items
  { id: "potion-healing", name: "Potion of Healing", category: "magic", subcategory: "Potions", cost: "50 gp", weight: 0.5, description: "A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.", rarity: "Common" },
  { id: "potion-greater-healing", name: "Potion of Greater Healing", category: "magic", subcategory: "Potions", cost: "150 gp", weight: 0.5, description: "Regains 4d4 + 4 hit points.", rarity: "Uncommon" },
  { id: "potion-superior-healing", name: "Potion of Superior Healing", category: "magic", subcategory: "Potions", cost: "450 gp", weight: 0.5, description: "Regains 8d4 + 8 hit points.", rarity: "Rare" },
  { id: "potion-supreme-healing", name: "Potion of Supreme Healing", category: "magic", subcategory: "Potions", cost: "1350 gp", weight: 0.5, description: "Regains 10d4 + 20 hit points.", rarity: "Very Rare" },
  { id: "potion-invisibility", name: "Potion of Invisibility", category: "magic", subcategory: "Potions", cost: "180 gp", weight: 0.5, description: "This potion's container looks empty but feels as though it holds liquid. When you drink it, you become invisible for 1 hour. Anything you wear or carry is invisible with you. The effect ends early if you attack or cast a spell.", rarity: "Very Rare" },
  { id: "potion-flying", name: "Potion of Flying", category: "magic", subcategory: "Potions", cost: "500 gp", weight: 0.5, description: "When you drink this potion, you gain a flying speed equal to your walking speed for 1 hour and can hover. If you're in the air when the potion wears off, you fall unless you have some other means of staying aloft.", rarity: "Very Rare" },
  { id: "ring-protection", name: "Ring of Protection", category: "magic", subcategory: "Rings", cost: "3500 gp", weight: 0, description: "You gain a +1 bonus to AC and saving throws while wearing this ring.", rarity: "Rare", requiresAttunement: true },
  { id: "ring-spell-storing", name: "Ring of Spell Storing", category: "magic", subcategory: "Rings", cost: "24000 gp", weight: 0, description: "This ring stores spells cast into it, holding them until the attuned wearer uses them. The ring can store up to 5 levels worth of spells at a time.", rarity: "Rare", requiresAttunement: true },
  { id: "cloak-elvenkind", name: "Cloak of Elvenkind", category: "magic", subcategory: "Wondrous Items", cost: "5000 gp", weight: 1, description: "While you wear this cloak with its hood up, Wisdom (Perception) checks made to see you have disadvantage, and you have advantage on Dexterity (Stealth) checks made to hide, as the cloak's color shifts to camouflage you.", rarity: "Uncommon", requiresAttunement: true },
  { id: "boots-speed", name: "Boots of Speed", category: "magic", subcategory: "Wondrous Items", cost: "4000 gp", weight: 1, description: "While you wear these boots, you can use a bonus action and click the boots' heels together. If you do, the boots double your walking speed, and any creature that makes an opportunity attack against you has disadvantage on the attack roll. If you click your heels together again, you end the effect.", rarity: "Rare", requiresAttunement: true },
  { id: "bag-of-holding", name: "Bag of Holding", category: "magic", subcategory: "Wondrous Items", cost: "4000 gp", weight: 15, description: "This bag has an interior space considerably larger than its outside dimensions, roughly 2 feet in diameter at the mouth and 4 feet deep. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet.", rarity: "Uncommon" },
  { id: "staff-of-power", name: "Staff of Power", category: "magic", subcategory: "Staffs", cost: "95500 gp", weight: 4, description: "This staff can be wielded as a magic quarterstaff that grants a +2 bonus to attack and damage rolls made with it. While holding it, you gain a +2 bonus to Armor Class, saving throws, and spell attack rolls.", rarity: "Very Rare", requiresAttunement: true, magicBonus: 2 },
  { id: "sword-+1", name: "Sword, +1", category: "magic", subcategory: "Weapons", cost: "1000 gp", weight: 3, description: "You have a +1 bonus to attack and damage rolls made with this magic weapon.", rarity: "Uncommon", magicBonus: 1 },
  { id: "sword-+2", name: "Sword, +2", category: "magic", subcategory: "Weapons", cost: "4000 gp", weight: 3, description: "You have a +2 bonus to attack and damage rolls made with this magic weapon.", rarity: "Rare", magicBonus: 2 },
  { id: "sword-+3", name: "Sword, +3", category: "magic", subcategory: "Weapons", cost: "24000 gp", weight: 3, description: "You have a +3 bonus to attack and damage rolls made with this magic weapon.", rarity: "Very Rare", magicBonus: 3 },
  { id: "flame-tongue", name: "Flame Tongue", category: "magic", subcategory: "Weapons", cost: "5000 gp", weight: 3, description: "You can use a bonus action to speak this magic sword's command word, causing flames to erupt from the blade. These flames shed bright light in a 40-foot radius and dim light for an additional 40 feet. While the sword is ablaze, it deals an extra 2d6 fire damage to any target it hits.", rarity: "Rare", requiresAttunement: true },
  { id: "vorpal-sword", name: "Vorpal Sword", category: "magic", subcategory: "Weapons", cost: "75000 gp", weight: 3, description: "You gain a +3 bonus to attack and damage rolls made with this magic weapon. In addition, the weapon ignores resistance to slashing damage. When you attack a creature that has at least one head with this weapon and roll a 20 on the attack roll, you cut off one of the creature's heads.", rarity: "Legendary", requiresAttunement: true, magicBonus: 3 },
  { id: "amulet-health", name: "Amulet of Health", category: "magic", subcategory: "Wondrous Items", cost: "8000 gp", weight: 0, description: "Your Constitution score is 19 while you wear this amulet. It has no effect on you if your Constitution is already 19 or higher.", rarity: "Rare", requiresAttunement: true },
  { id: "headband-intellect", name: "Headband of Intellect", category: "magic", subcategory: "Wondrous Items", cost: "8000 gp", weight: 0, description: "Your Intelligence score is 19 while you wear this headband. It has no effect on you if your Intelligence is already 19 or higher.", rarity: "Uncommon", requiresAttunement: true },
  { id: "gauntlets-ogre-power", name: "Gauntlets of Ogre Power", category: "magic", subcategory: "Wondrous Items", cost: "8000 gp", weight: 1, description: "Your Strength score is 19 while you wear these gauntlets. They have no effect on you if your Strength is already 19 or higher.", rarity: "Uncommon", requiresAttunement: true },
];

export function getEquipmentByCategory(category: string): Equipment[] {
  return EQUIPMENT.filter(e => e.category === category);
}

export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT.find(e => e.id === id);
}

export const BACKGROUNDS = [
  {
    id: "acolyte",
    name: "Acolyte",
    description: "You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world, performing sacred rites and offering sacrifices in order to conduct worshipers into the presence of the divine.",
    skillProficiencies: ["Insight", "Religion"],
    toolProficiencies: [],
    languages: 2,
    equipment: ["A holy symbol (a gift to you when you entered the priesthood)", "A prayer book or prayer wheel", "5 sticks of incense", "Vestments", "A set of common clothes", "A pouch containing 15 gp"],
    feature: "Shelter of the Faithful",
    featureDescription: "As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith, though you must provide any material components needed for spells.",
  },
  {
    id: "criminal",
    name: "Criminal",
    description: "You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld. You're far closer than most people to the world of murder, theft, and violence that pervades the underbelly of civilization.",
    skillProficiencies: ["Deception", "Stealth"],
    toolProficiencies: ["One type of gaming set", "Thieves' tools"],
    languages: 0,
    equipment: ["A crowbar", "A set of dark common clothes including a hood", "A pouch containing 15 gp"],
    feature: "Criminal Contact",
    featureDescription: "You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact, even over great distances; specifically, you know the local messengers, corrupt caravan masters, and seedy sailors who can deliver messages for you.",
  },
  {
    id: "folk-hero",
    name: "Folk Hero",
    description: "You come from a humble social rank, but you are destined for so much more. Already the people of your home village regard you as their champion, and your destiny calls you to stand against the tyrants and monsters that threaten the common folk everywhere.",
    skillProficiencies: ["Animal Handling", "Survival"],
    toolProficiencies: ["One type of artisan's tools", "Vehicles (land)"],
    languages: 0,
    equipment: ["A set of artisan's tools (one of your choice)", "A shovel", "An iron pot", "A set of common clothes", "A pouch containing 10 gp"],
    feature: "Rustic Hospitality",
    featureDescription: "Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them. They will shield you from the law or anyone else searching for you, though they will not risk their lives for you.",
  },
  {
    id: "noble",
    name: "Noble",
    description: "You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence. You might be a pampered aristocrat unfamiliar with work or discomfort, a former merchant just elevated to the nobility, or a disinherited scoundrel with a disproportionate sense of entitlement.",
    skillProficiencies: ["History", "Persuasion"],
    toolProficiencies: ["One type of gaming set"],
    languages: 1,
    equipment: ["A set of fine clothes", "A signet ring", "A scroll of pedigree", "A purse containing 25 gp"],
    feature: "Position of Privilege",
    featureDescription: "Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. The common folk make every effort to accommodate you and avoid your displeasure, and other people of high birth treat you as a member of the same social sphere.",
  },
  {
    id: "sage",
    name: "Sage",
    description: "You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you. Your efforts have made you a master in your fields of study.",
    skillProficiencies: ["Arcana", "History"],
    toolProficiencies: [],
    languages: 2,
    equipment: ["A bottle of black ink", "A quill", "A small knife", "A letter from a dead colleague posing a question you have not yet been able to answer", "A set of common clothes", "A pouch containing 10 gp"],
    feature: "Researcher",
    featureDescription: "When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it. Usually, this information comes from a library, scriptorium, university, or a sage or other learned person or creature. Your DM might rule that the knowledge you seek is secreted away in an almost inaccessible place, or that it simply cannot be found.",
  },
  {
    id: "soldier",
    name: "Soldier",
    description: "War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques, including how to stay alive on the battlefield. You might have been part of a standing army or perhaps a mercenary company.",
    skillProficiencies: ["Athletics", "Intimidation"],
    toolProficiencies: ["One type of gaming set", "Vehicles (land)"],
    languages: 0,
    equipment: ["An insignia of rank", "A trophy taken from a fallen enemy (a dagger, broken blade, or piece of a banner)", "A set of bone dice or deck of cards", "A set of common clothes", "A pouch containing 10 gp"],
    feature: "Military Rank",
    featureDescription: "You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence, and they defer to you if they are of a lower rank. You can invoke your rank to exert influence over other soldiers and requisition simple equipment or horses for temporary use.",
  },
];
