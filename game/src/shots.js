// Deterministic screenshot scenes for Sizzle & Serve, behind
// ?shot=cover|assembly|cooking|rush&seed=N. Each scene builds a real game
// state — real tickets, real items on the real stations, real scores — and
// the normal renderers draw it, so a screenshot is the game itself, staged.

import { CUSTOMER_LOOKS } from './orders.js';
import { recipeById } from './recipes.js';
import { SCREEN_PLAY, SCREEN_TITLE, spawnEffect, startDay } from './state.js';

let shotTicketId = 500;

function ticket(game, recipeId, patienceFraction) {
  const recipe = recipeById(recipeId);
  const patienceMax = 60;
  shotTicketId += 1;
  return {
    id: shotTicketId,
    recipe,
    patience: patienceMax * patienceFraction,
    patienceMax,
    look: CUSTOMER_LOOKS[shotTicketId % CUSTOMER_LOOKS.length],
    bob: shotTicketId * 1.3,
  };
}

function item(ing, stage, quality = 'fresh') {
  return { ing, stage, quality };
}

/** A lively kitchen behind the title: two tickets, a pan on, a dish plating. */
function stageCover(game) {
  startDay(game, 2);
  game.screen = SCREEN_TITLE;
  game.orders = [ticket(game, 'cheeseburger', 0.8), ticket(game, 'garden-salad', 0.62)];
  game.stations.burners[0] = { ...item('patty', 0), cook: 0.62 };
  game.stations.board = { ...item('tomato', 0), chops: 2 };
  game.stations.plates[0] = [item('bun', 0), item('patty', 1, 'perfect')];
  game.bank = 42;
  game.coins = 42;
  spawnEffect(game, 'steam', 872, 470);
  spawnEffect(game, 'steam', 884, 466);
}

/** The mandatory mid-assembly frame: a cheeseburger half built, hand busy. */
function stageAssembly(game) {
  startDay(game, 3);
  game.screen = SCREEN_PLAY;
  game.orders = [
    ticket(game, 'cheeseburger', 0.78),
    ticket(game, 'deluxe-burger', 0.55),
    ticket(game, 'garden-salad', 0.86),
  ];
  // Plate 1: bun + perfect patty + cheese down, chopped tomato in hand.
  game.stations.plates[0] = [item('bun', 0), item('patty', 1, 'perfect'), item('cheese', 0)];
  game.hand = item('tomato', 1);
  game.stations.board = { ...item('lettuce', 0), chops: 1 };
  game.stations.burners[1] = { ...item('chicken', 0), cook: 0.4 };
  game.timeLeft = 74;
  game.coins = 64;
  game.bank = 86;
  game.served = 5;
  game.combo = 3;
  spawnEffect(game, 'steam', 988, 468);
}

/** Both burners working, fries ready, a potato mid-chop. */
function stageCooking(game) {
  startDay(game, 3);
  game.screen = SCREEN_PLAY;
  game.orders = [
    ticket(game, 'chicken-plate', 0.7),
    ticket(game, 'golden-fries', 0.9),
    ticket(game, 'cheeseburger', 0.5),
  ];
  game.stations.burners[0] = { ...item('chicken', 0), cook: 0.66 };
  game.stations.burners[1] = { ...item('potato', 1), cook: 0.3 };
  game.stations.board = { ...item('potato', 0), chops: 2 };
  game.stations.plates[1] = [item('potato', 2, 'perfect')];
  game.timeLeft = 58;
  game.coins = 97;
  game.bank = 132;
  game.served = 7;
  game.combo = 4;
  spawnEffect(game, 'steam', 870, 466);
  spawnEffect(game, 'steam', 986, 470);
  spawnEffect(game, 'steam', 880, 460);
}

/** Full rush: four tickets, one nearly gone, two plates ready to serve. */
function stageRush(game) {
  startDay(game, 4);
  game.screen = SCREEN_PLAY;
  game.orders = [
    ticket(game, 'deluxe-burger', 0.2),
    ticket(game, 'garden-salad', 0.66),
    ticket(game, 'loaded-fries', 0.45),
    ticket(game, 'sunrise-plate', 0.82),
  ];
  game.stations.plates[0] = [
    item('bun', 0),
    item('patty', 1, 'perfect'),
    item('cheese', 0),
    item('lettuce', 0),
    item('tomato', 1),
    item('egg', 1, 'perfect'),
  ];
  game.stations.plates[1] = [item('lettuce', 1), item('tomato', 1), item('egg', 1, 'perfect')];
  game.stations.burners[0] = { ...item('patty', 0), cook: 0.88 };
  game.stations.board = { ...item('tomato', 0), chops: 3 };
  game.timeLeft = 31;
  game.coins = 158;
  game.bank = 246;
  game.served = 11;
  game.combo = 7;
  game.bestCombo = 7;
  game.strikes = 1;
  spawnEffect(game, 'steam', 872, 464);
  spawnEffect(game, 'coins', 1096, 420, '+31');
}

/** Stage the named scene on a fresh game and return the game. */
export function stageShot(game, name) {
  shotTicketId = 500;
  switch (name) {
    case 'assembly':
      stageAssembly(game);
      break;
    case 'cooking':
      stageCooking(game);
      break;
    case 'rush':
      stageRush(game);
      break;
    default:
      stageCover(game);
      break;
  }
  return game;
}
