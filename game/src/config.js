// Layout and tuning constants for Sizzle & Serve: one 1280x800 canvas, a ticket
// rail across the top, the kitchen counter below it, and fixed rectangles for
// every clickable thing so input.js and the renderers agree on the geometry.

export const VIEW = { width: 1280, height: 800 };

/** The top strip: shift clock, coins, combo and the pause button. */
export const TOP_BAR = { x: 0, y: 0, width: 1280, height: 58 };

/** Where order tickets hang, just under the top bar. */
export const TICKET_RAIL = { x: 18, y: 70, gap: 14, width: 302, height: 148 };
export const MAX_TICKETS = 4;

/** The wooden counter the whole kitchen stands on. */
export const COUNTER = { x: 0, y: 470, width: 1280, height: 330 };

/** Ingredient bins: two rows of four on the left of the counter. */
export const BIN_GRID = { x: 24, y: 492, cellW: 128, cellH: 118, gapX: 10, gapY: 12, cols: 4 };

/** The chopping board, centre-left of the counter. */
export const BOARD = { x: 592, y: 500, width: 190, height: 128 };
/** The knife block / board action button under the board. */
export const TRASH = { x: 592, y: 700, width: 190, height: 64 };

/** The stove: two burners with pans, centre-right of the counter. */
export const STOVE = { x: 812, y: 492, width: 216, height: 150 };
export const BURNERS = [
  { x: 830, y: 512, r: 40 },
  { x: 946, y: 512, r: 40 },
];
/** Doneness is judged on a 0..1 sweep; this window of it counts as perfect. */
export const COOK_PERFECT = { from: 0.55, to: 0.8 };
export const COOK_TIME_SECONDS = 6;

/** Plating shelf on the right: three plates in a column. */
export const PLATES = [
  { x: 1096, y: 486, r: 52 },
  { x: 1096, y: 606, r: 52 },
  { x: 1096, y: 726, r: 44 },
];

/** Chopping takes this many knife clicks (or the same time held by keyboard). */
export const CHOPS_NEEDED = 3;

/** Shift tuning: seconds per day, and the coin goal growth per day. */
export const SHIFT_SECONDS = 120;
export const DAY_GOAL_BASE = 110;
export const DAY_GOAL_GROWTH = 55;
/** A day ends in defeat at this many walked-out customers. */
export const MAX_STRIKES = 3;

/** Warm kitchen palette shared by the renderers. */
export const COLORS = {
  wallTop: '#4a2c17',
  wallBottom: '#6b4225',
  tile: '#7d5230',
  counterTop: '#9c6b3f',
  counterFace: '#7a4e2a',
  counterEdge: '#c99a5f',
  brass: '#e8b64c',
  cream: '#fff3d6',
  ink: '#2e1a0c',
  ticketPaper: '#fff8e7',
  ticketPin: '#d64541',
  good: '#58b368',
  warn: '#f2a541',
  bad: '#e4572e',
};
