// The three work stations and what a click (or key) on each one does. Every
// function returns a short event word so main.js can play the matching sound
// and message; the state changes themselves all happen here.

import { CHOPS_NEEDED, COOK_PERFECT, COOK_TIME_SECONDS } from './config.js';
import { freshItem, itemLabel, nextVia, stageName } from './recipes.js';
import { servePlate } from './orders.js';
import { showMessage, spawnEffect } from './state.js';

/** Pick a fresh ingredient up from its bin (only with an empty hand). */
export function takeFromBin(game, ing) {
  if (game.hand !== null) return 'busy';
  game.hand = freshItem(ing);
  return 'took';
}

/** Put the held item back / swap is not allowed: bins only give, never take. */
export function boardInteract(game) {
  const board = game.stations.board;
  if (board === null) {
    if (game.hand === null) return 'empty';
    if (nextVia(game.hand) !== 'chop') {
      showMessage(game, `${itemLabel(game.hand)} does not need chopping`, 1.4);
      return 'refused';
    }
    game.stations.board = { ...game.hand, chops: 0 };
    game.hand = null;
    return 'placed';
  }
  if (game.hand !== null) return 'busy';
  if (board.chops < CHOPS_NEEDED) {
    board.chops += 1;
    spawnEffect(game, 'spark', 687, 540);
    return 'chopped';
  }
  game.hand = { ing: board.ing, stage: board.stage + 1, quality: 'fresh' };
  game.stations.board = null;
  return 'took';
}

/** Place the held item in a pan, or take the pan's item out when it is done. */
export function burnerInteract(game, index) {
  const current = game.stations.burners[index];
  if (current === null) {
    if (game.hand === null) return 'empty';
    if (nextVia(game.hand) !== 'cook') {
      showMessage(game, `${itemLabel(game.hand)} cannot go in a pan`, 1.4);
      return 'refused';
    }
    game.stations.burners[index] = { ...game.hand, cook: 0 };
    game.hand = null;
    return 'placed';
  }
  if (game.hand !== null) return 'busy';
  if (current.cook < 0.3) {
    showMessage(game, 'Still raw — give it a moment', 1.2);
    return 'refused';
  }
  let quality = 'under';
  if (current.quality === 'burnt') quality = 'burnt';
  else if (current.cook >= COOK_PERFECT.from && current.cook <= COOK_PERFECT.to) quality = 'perfect';
  else if (current.cook > COOK_PERFECT.to) quality = 'over';
  game.hand = { ing: current.ing, stage: current.stage + 1, quality };
  game.stations.burners[index] = null;
  return quality === 'perfect' ? 'took-perfect' : 'took';
}

/** Advance the pans: progress, steam, and the moment a dish burns. */
export function stepStations(game, dt) {
  let anyCooking = false;
  game.stations.burners.forEach((item, index) => {
    if (item === null) return;
    anyCooking = true;
    const wasBurnt = item.quality === 'burnt';
    item.cook = Math.min(1.15, item.cook + dt / COOK_TIME_SECONDS);
    const x = [870, 986][index];
    if (Math.random() < dt * 6) spawnEffect(game, 'steam', x + (Math.random() * 30 - 15), 470);
    if (item.cook >= 1 && !wasBurnt) {
      item.quality = 'burnt';
      game.stats.burnt += 1;
      spawnEffect(game, 'smoke', x, 460);
      showMessage(game, 'Something burnt! Take it out and bin it', 1.6);
    }
  });
  return anyCooking;
}

/** Click a plate: add the held item, or serve the plate when the hand is free. */
export function plateInteract(game, index) {
  game.lastPlate = index;
  const plate = game.stations.plates[index];
  if (game.hand !== null) {
    if (plate.length >= 6) {
      showMessage(game, 'That plate is full', 1.2);
      return 'refused';
    }
    plate.push(game.hand);
    game.hand = null;
    return 'plated';
  }
  if (plate.length === 0) return 'empty';
  const served = servePlate(game, index);
  return served === null ? 'refused' : 'served';
}

/** The bin under the board: discards the held item, or clears the last plate. */
export function trashInteract(game) {
  if (game.hand !== null) {
    game.hand = null;
    return 'trashed';
  }
  const plate = game.stations.plates[game.lastPlate];
  if (plate.length > 0) {
    game.stations.plates[game.lastPlate] = [];
    return 'trashed';
  }
  if (game.stations.board !== null) {
    game.stations.board = null;
    return 'trashed';
  }
  return 'empty';
}

/** A one-line description of what the board holds, for the HUD hint. */
export function boardLabel(game) {
  const board = game.stations.board;
  if (board === null) return '';
  return board.chops >= CHOPS_NEEDED ? `${itemLabel({ ing: board.ing, stage: board.stage + 1 })} ready` : `Chopping ${stageName(board)}… ${board.chops}/${CHOPS_NEEDED}`;
}
