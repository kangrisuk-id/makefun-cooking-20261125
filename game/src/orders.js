// Order tickets: how they arrive, how their patience drains, and what a served
// plate earns. A ticket names a recipe; the customer waits while the patience
// bar drains, pays the menu price plus a tip for what is left of it, and walks
// out (a strike) when it empties.

import { MAX_TICKETS } from './config.js';
import { plateMatchesRecipe, recipesForDay } from './recipes.js';
import { showMessage, spawnEffect } from './state.js';

let nextTicketId = 1;

/** Faces and shirt colours customers are drawn with, picked per ticket. */
export const CUSTOMER_LOOKS = [
  { skin: '#f2c894', hair: '#5b3a1e', shirt: '#c8553d' },
  { skin: '#c68863', hair: '#241611', shirt: '#3d7ea6' },
  { skin: '#ffe0bd', hair: '#b5533c', shirt: '#588157' },
  { skin: '#8d5524', hair: '#101010', shirt: '#bc6c25' },
  { skin: '#f2c894', hair: '#777777', shirt: '#7f5539' },
  { skin: '#eac086', hair: '#3b2314', shirt: '#9b5de5' },
];

/** How long a customer for this recipe waits: more parts, a little more time. */
function patienceFor(recipe, day, random) {
  const base = 52 + recipe.parts.length * 9;
  const rush = Math.min(18, (day - 1) * 3);
  return Math.max(34, base - rush + random.range(-4, 5));
}

/** Seconds until the next ticket arrives; the rush tightens as the day runs. */
function spawnGap(game) {
  const elapsed = 1 - game.timeLeft / 120;
  const base = game.random.range(6.5, 10.5);
  const dayCut = Math.min(2.5, (game.day - 1) * 0.5);
  return Math.max(3.2, base - dayCut - elapsed * 2.2);
}

/** Deal a new ticket onto the rail, if there is room. */
export function spawnOrder(game) {
  if (game.orders.length >= MAX_TICKETS) return null;
  const menu = recipesForDay(game.day);
  const recipe = game.random.pick(menu);
  const look = game.random.pick(CUSTOMER_LOOKS);
  const patience = patienceFor(recipe, game.day, game.random);
  const ticket = {
    id: nextTicketId,
    recipe,
    patience,
    patienceMax: patience,
    look,
    bob: game.random.range(0, Math.PI * 2),
  };
  nextTicketId += 1;
  game.orders.push(ticket);
  return ticket;
}

/**
 * Advance tickets: spawn when the timer says so, drain patience, and turn an
 * emptied ticket into a walk-out (strike, combo lost, the order removed).
 * Returns the list of tickets that walked out this step.
 */
export function stepOrders(game, dt) {
  game.nextOrderIn -= dt;
  if (game.nextOrderIn <= 0) {
    if (spawnOrder(game) !== null) game.nextOrderIn = spawnGap(game);
    else game.nextOrderIn = 1.5;
  }
  const walkedOut = [];
  for (const ticket of game.orders) {
    ticket.patience -= dt;
    ticket.bob += dt * 2;
    if (ticket.patience <= 0) walkedOut.push(ticket);
  }
  for (const ticket of walkedOut) {
    game.orders = game.orders.filter((other) => other !== ticket);
    game.strikes += 1;
    game.lost += 1;
    game.combo = 0;
    showMessage(game, `${ticket.recipe.name} walked out!`, 1.8);
  }
  return walkedOut;
}

/** The fraction of patience a ticket has left, 0..1. */
export function patienceFraction(ticket) {
  return Math.max(0, ticket.patience / ticket.patienceMax);
}

/**
 * Serve a plate: find the happiest matching ticket, score the plate, clear it.
 * Payout = menu price + a patience tip + a quality bonus for perfectly cooked
 * parts (undercooked parts cost the bonus; a burnt part refuses the plate).
 * Returns { ticket, payout, tip, bonus } or null when nothing matches.
 */
export function servePlate(game, plateIndex) {
  const items = game.stations.plates[plateIndex];
  if (items.length === 0) return null;
  if (items.some((item) => item.quality === 'burnt')) {
    showMessage(game, 'That plate has burnt food on it — bin it!', 1.8);
    return null;
  }
  let best = null;
  for (const ticket of game.orders) {
    if (!plateMatchesRecipe(items, ticket.recipe)) continue;
    if (best === null || ticket.patience < best.patience) best = ticket;
  }
  if (best === null) {
    showMessage(game, 'No ticket wants that plate yet', 1.4);
    return null;
  }
  const tip = Math.round(best.recipe.price * 0.5 * patienceFraction(best));
  let bonus = 0;
  for (const item of items) {
    if (item.quality === 'perfect') bonus += 2;
    if (item.quality === 'under') bonus -= 2;
    if (item.quality === 'over') bonus -= 1;
  }
  const comboBonus = Math.min(8, game.combo);
  const payout = Math.max(1, best.recipe.price + tip + bonus) + comboBonus;
  game.orders = game.orders.filter((ticket) => ticket !== best);
  game.stations.plates[plateIndex] = [];
  game.coins += payout;
  game.bank += payout;
  game.score += payout * 10;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  const plate = { x: 1096, y: [486, 606, 726][plateIndex] };
  spawnEffect(game, 'coins', plate.x, plate.y - 60, `+${payout}`);
  return { ticket: best, payout, tip, bonus };
}
