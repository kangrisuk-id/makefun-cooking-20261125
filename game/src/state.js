// The whole mutable game state of Sizzle & Serve, and the day/shift lifecycle.
// Everything lives in one plain object so the renderers stay pure readers and
// the screenshot scenes can stage any moment by writing fields directly.

import { DAY_GOAL_BASE, DAY_GOAL_GROWTH, MAX_STRIKES, SHIFT_SECONDS } from './config.js';
import { createRandom } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSE = 'pause';
export const SCREEN_DAY_CLEAR = 'dayclear';
export const SCREEN_OVER = 'over';

/** The coin goal for a 1-based day number. */
export function dayGoal(day) {
  return DAY_GOAL_BASE + (day - 1) * DAY_GOAL_GROWTH;
}

/** A blank kitchen: empty board, cold burners, clean plates. */
export function freshStations() {
  return {
    board: null, // an item being chopped, with .chops counting knife clicks
    burners: [null, null], // items cooking, each with .cook 0..1 progress
    plates: [[], [], []], // arrays of plated items
  };
}

/** Create the state for a brand-new game (day 1, title screen). */
export function createGame(seed) {
  return {
    screen: SCREEN_TITLE,
    random: createRandom(seed),
    seed,
    day: 1,
    timeLeft: SHIFT_SECONDS,
    coins: 0, // coins earned this day, against the goal
    bank: 0, // coins banked across the whole run
    score: 0,
    served: 0,
    lost: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    hand: null, // the item the player is holding, or null
    orders: [],
    nextOrderIn: 1.2,
    stations: freshStations(),
    effects: [], // floating texts, steam, sparkles: {kind, x, y, t, life, text}
    shake: 0,
    message: '',
    messageT: 0,
    lastPlate: 0,
    stats: { perfect: 0, burnt: 0 },
  };
}

/** Begin a day: reset the clock, the stations and the tickets, keep the bank. */
export function startDay(game, day) {
  game.day = day;
  game.timeLeft = SHIFT_SECONDS;
  game.coins = 0;
  game.strikes = 0;
  game.combo = 0;
  game.hand = null;
  game.orders = [];
  game.nextOrderIn = 0.8;
  game.stations = freshStations();
  game.effects = [];
  game.message = '';
  game.messageT = 0;
  game.screen = SCREEN_PLAY;
}

/** Add a floating effect (coin popup, steam puff, sparkle) to the world. */
export function spawnEffect(game, kind, x, y, text = '') {
  game.effects.push({ kind, x, y, t: 0, life: kind === 'steam' ? 1.1 : 0.9, text });
  if (game.effects.length > 90) game.effects.splice(0, game.effects.length - 90);
}

/** Age and drop effects; called once per frame from the main loop. */
export function stepEffects(game, dt) {
  for (const effect of game.effects) effect.t += dt;
  game.effects = game.effects.filter((effect) => effect.t < effect.life);
  if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 2.4);
  if (game.messageT > 0) game.messageT = Math.max(0, game.messageT - dt);
}

/** Show a short centre-screen message (also used by the renderers). */
export function showMessage(game, text, seconds = 1.6) {
  game.message = text;
  game.messageT = seconds;
}

/** Whether the day is won, lost, or still running. */
export function dayOutcome(game) {
  if (game.strikes >= MAX_STRIKES) return 'lost';
  if (game.timeLeft <= 0) return game.coins >= dayGoal(game.day) ? 'won' : 'lost';
  return 'running';
}
