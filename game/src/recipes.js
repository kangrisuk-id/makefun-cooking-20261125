// The pantry and the menu of Sizzle & Serve. Each ingredient is a small state
// machine: a list of stages it can be in, and how it reaches the next one
// ('chop' at the board, 'cook' in a pan, or null when it is used as it comes).
// A recipe is a list of { ing, stage } parts: the plate must hold exactly those
// parts, in those stages, before it can be served for that ticket.

export const INGREDIENTS = {
  bun: {
    label: 'Bun',
    key: '1',
    stages: [{ name: 'raw', via: null }],
  },
  patty: {
    label: 'Beef patty',
    key: '2',
    stages: [
      { name: 'raw', via: null },
      { name: 'cooked', via: 'cook' },
    ],
  },
  chicken: {
    label: 'Chicken',
    key: '3',
    stages: [
      { name: 'raw', via: null },
      { name: 'cooked', via: 'cook' },
    ],
  },
  potato: {
    label: 'Potato',
    key: '4',
    stages: [
      { name: 'raw', via: null },
      { name: 'chopped', via: 'chop' },
      { name: 'cooked', via: 'cook' },
    ],
  },
  tomato: {
    label: 'Tomato',
    key: '5',
    stages: [
      { name: 'raw', via: null },
      { name: 'chopped', via: 'chop' },
    ],
  },
  lettuce: {
    label: 'Lettuce',
    key: '6',
    stages: [
      { name: 'raw', via: null },
      { name: 'chopped', via: 'chop' },
    ],
  },
  cheese: {
    label: 'Cheese',
    key: '7',
    stages: [{ name: 'raw', via: null }],
  },
  egg: {
    label: 'Egg',
    key: '8',
    stages: [
      { name: 'raw', via: null },
      { name: 'cooked', via: 'cook' },
    ],
  },
};

/** Ingredient ids in bin order (left to right, top row first). */
export const INGREDIENT_ORDER = ['bun', 'patty', 'chicken', 'potato', 'tomato', 'lettuce', 'cheese', 'egg'];

/** A fresh item of an ingredient, in its first stage. */
export function freshItem(ing) {
  return { ing, stage: 0, quality: 'fresh' };
}

/** The stage name an item is in, e.g. 'chopped'. */
export function stageName(item) {
  return INGREDIENTS[item.ing].stages[item.stage].name;
}

/** How the item reaches its next stage ('chop' | 'cook'), or null when done. */
export function nextVia(item) {
  const stages = INGREDIENTS[item.ing].stages;
  return item.stage + 1 < stages.length ? stages[item.stage + 1].via : null;
}

/** A short human label like 'Potato · chopped'. */
export function itemLabel(item) {
  const name = stageName(item);
  return name === 'raw' ? INGREDIENTS[item.ing].label : `${INGREDIENTS[item.ing].label} · ${name}`;
}

export const RECIPES = [
  {
    id: 'classic-burger',
    name: 'Classic Burger',
    price: 14,
    unlockDay: 1,
    parts: [
      { ing: 'bun', stage: 'raw' },
      { ing: 'patty', stage: 'cooked' },
      { ing: 'lettuce', stage: 'raw' },
    ],
  },
  {
    id: 'garden-salad',
    name: 'Garden Salad',
    price: 11,
    unlockDay: 1,
    parts: [
      { ing: 'lettuce', stage: 'chopped' },
      { ing: 'tomato', stage: 'chopped' },
      { ing: 'egg', stage: 'cooked' },
    ],
  },
  {
    id: 'golden-fries',
    name: 'Golden Fries',
    price: 9,
    unlockDay: 1,
    parts: [{ ing: 'potato', stage: 'cooked' }],
  },
  {
    id: 'cheeseburger',
    name: 'Cheeseburger',
    price: 17,
    unlockDay: 2,
    parts: [
      { ing: 'bun', stage: 'raw' },
      { ing: 'patty', stage: 'cooked' },
      { ing: 'cheese', stage: 'raw' },
      { ing: 'tomato', stage: 'chopped' },
    ],
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    price: 13,
    unlockDay: 2,
    parts: [
      { ing: 'potato', stage: 'cooked' },
      { ing: 'cheese', stage: 'raw' },
    ],
  },
  {
    id: 'chicken-plate',
    name: 'Chicken & Fries Plate',
    price: 19,
    unlockDay: 3,
    parts: [
      { ing: 'chicken', stage: 'cooked' },
      { ing: 'potato', stage: 'cooked' },
    ],
  },
  {
    id: 'sunrise-plate',
    name: 'Sunrise Breakfast Plate',
    price: 16,
    unlockDay: 3,
    parts: [
      { ing: 'egg', stage: 'cooked' },
      { ing: 'cheese', stage: 'raw' },
      { ing: 'bun', stage: 'raw' },
    ],
  },
  {
    id: 'deluxe-burger',
    name: 'Deluxe Stack Burger',
    price: 24,
    unlockDay: 4,
    parts: [
      { ing: 'bun', stage: 'raw' },
      { ing: 'patty', stage: 'cooked' },
      { ing: 'cheese', stage: 'raw' },
      { ing: 'lettuce', stage: 'raw' },
      { ing: 'tomato', stage: 'chopped' },
      { ing: 'egg', stage: 'cooked' },
    ],
  },
];

/** The recipes a given day's customers may order. */
export function recipesForDay(day) {
  return RECIPES.filter((recipe) => recipe.unlockDay <= day);
}

/** The recipe with this id, or null. */
export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) ?? null;
}

/**
 * Does a plate's items match a recipe exactly? Compares multisets of
 * (ingredient, stage name); quality is scored separately at serving time.
 */
export function plateMatchesRecipe(items, recipe) {
  if (items.length !== recipe.parts.length) return false;
  const wanted = recipe.parts.map((part) => `${part.ing}:${part.stage}`).sort();
  const held = items.map((item) => `${item.ing}:${stageName(item)}`).sort();
  return wanted.every((part, index) => part === held[index]);
}
