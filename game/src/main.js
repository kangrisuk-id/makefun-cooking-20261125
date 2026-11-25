// Sizzle & Serve — the entry point. Owns the canvas, the frame loop, and the
// translation of input actions into station calls and sounds. All rules live
// in orders.js / stations.js / state.js; all drawing in the renderers.

import {
  playBell,
  playChop,
  playCoins,
  playDayClear,
  playPanDown,
  playThud,
  setSizzle,
  unlockAudio,
} from './audio.js';
import { actionAt, actionForKey, canvasPoint } from './input.js';
import { stepOrders } from './orders.js';
import { drawKitchen } from './render-kitchen.js';
import { drawHud } from './render-hud.js';
import { stageShot } from './shots.js';
import {
  createGame,
  dayOutcome,
  SCREEN_DAY_CLEAR,
  SCREEN_OVER,
  SCREEN_PAUSE,
  SCREEN_PLAY,
  SCREEN_TITLE,
  showMessage,
  startDay,
  stepEffects,
} from './state.js';
import { boardInteract, burnerInteract, plateInteract, stepStations, takeFromBin, trashInteract } from './stations.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? '1') || 1;

const game = createGame(shotName !== null ? seed : (Date.now() % 90000) + 7);
const pointer = { x: 0, y: 0, inside: false };
let hover = '';
let elapsed = 0;

function hoverName(action) {
  if (action === null || action === undefined) return '';
  switch (action.type) {
    case 'bin':
      return `bin:${action.ing}`;
    case 'plate':
      return `plate:${action.index}`;
    case 'board':
      return 'board';
    case 'trash':
      return 'trash';
    default:
      return '';
  }
}

/** Sound + feel for a station event word. */
function react(event) {
  switch (event) {
    case 'took':
    case 'placed':
    case 'plated':
      playPanDown();
      break;
    case 'chopped':
      playChop();
      break;
    case 'took-perfect':
      playBell();
      showMessage(game, 'Perfectly cooked!', 1.1);
      break;
    case 'served':
      playBell();
      playCoins();
      break;
    case 'trashed':
      playThud();
      break;
    case 'refused':
      playThud();
      game.shake = 0.6;
      break;
    default:
      break;
  }
}

/** Run one input action against the current screen. */
export function performAction(action) {
  if (action === null) return;
  unlockAudio();
  if (game.screen === SCREEN_TITLE) {
    startDay(game, 1);
    return;
  }
  if (game.screen === SCREEN_DAY_CLEAR) {
    if (action.type === 'confirm' || action.type === 'plate' || action.type === 'bin') startDay(game, game.day + 1);
    return;
  }
  if (game.screen === SCREEN_OVER) {
    if (action.type === 'confirm' || action.type === 'plate' || action.type === 'bin') {
      const fresh = createGame((Date.now() % 90000) + 7);
      Object.assign(game, fresh);
      startDay(game, 1);
    }
    return;
  }
  if (action.type === 'pause') {
    game.screen = game.screen === SCREEN_PAUSE ? SCREEN_PLAY : SCREEN_PAUSE;
    if (game.screen === SCREEN_PAUSE) setSizzle(false);
    return;
  }
  if (game.screen !== SCREEN_PLAY) return;
  switch (action.type) {
    case 'bin':
      react(takeFromBin(game, action.ing));
      break;
    case 'board':
      react(boardInteract(game));
      break;
    case 'burner':
      react(burnerInteract(game, action.index));
      break;
    case 'plate':
      react(plateInteract(game, action.index));
      break;
    case 'trash':
      react(trashInteract(game));
      break;
    default:
      break;
  }
}

/** One simulation step of a live shift. */
function stepGame(dt) {
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  const walkedOut = stepOrders(game, dt);
  if (walkedOut.length > 0) {
    playThud();
    game.shake = 1;
  }
  const anyCooking = stepStations(game, dt);
  setSizzle(anyCooking);
  stepEffects(game, dt);
  const outcome = dayOutcome(game);
  if (outcome === 'won') {
    game.screen = SCREEN_DAY_CLEAR;
    setSizzle(false);
    playDayClear();
  } else if (outcome === 'lost') {
    game.screen = SCREEN_OVER;
    setSizzle(false);
    playThud();
  }
}

/** Draw one frame, with a small screen shake when the game asks for it. */
function draw(time) {
  ctx.save();
  if (game.shake > 0) {
    const s = game.shake * 5;
    ctx.translate((Math.sin(time * 61) * s) / 2, (Math.cos(time * 53) * s) / 2);
  }
  drawKitchen(ctx, game, hover, pointer, time);
  drawHud(ctx, game);
  ctx.restore();
}

canvas.addEventListener('mousemove', (event) => {
  const point = canvasPoint(canvas, event);
  pointer.x = point.x;
  pointer.y = point.y;
  pointer.inside = true;
  hover = hoverName(actionAt(point.x, point.y));
});
canvas.addEventListener('mouseleave', () => {
  pointer.inside = false;
  hover = '';
});
canvas.addEventListener('click', (event) => {
  const point = canvasPoint(canvas, event);
  performAction(actionAt(point.x, point.y));
});
window.addEventListener('keydown', (event) => {
  if (event.key === ' ') event.preventDefault();
  const action = actionForKey(event.key);
  if (action !== null) performAction(action);
});

// Screenshot mode: stage one deterministic scene, draw it once, and say so.
if (shotName !== null) {
  stageShot(game, shotName);
  if (shotName === 'assembly') {
    pointer.x = 1070;
    pointer.y = 512;
    pointer.inside = true;
  }
  draw(2.4);
  window.__shotReady = true;
  window.__game = game;
} else {
  window.__game = game;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    if (game.screen === SCREEN_PLAY) stepGame(dt);
    else stepEffects(game, dt);
    draw(elapsed);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
