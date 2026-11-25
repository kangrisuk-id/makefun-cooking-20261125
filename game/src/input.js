// Pointer and keyboard input for Sizzle & Serve. This file only translates
// positions and keys into action words ({ type: 'bin' | 'board' | 'burner' |
// 'plate' | 'trash' | 'pause' | 'confirm', ... }); main.js performs them, so
// the geometry here is the single source both input and hover rendering use.

import { BIN_GRID, BOARD, BURNERS, PLATES, TRASH } from './config.js';
import { INGREDIENT_ORDER } from './recipes.js';

/** The rectangle of ingredient bin `index` (0..7, row by row). */
export function binRect(index) {
  const col = index % BIN_GRID.cols;
  const row = Math.floor(index / BIN_GRID.cols);
  return {
    x: BIN_GRID.x + col * (BIN_GRID.cellW + BIN_GRID.gapX),
    y: BIN_GRID.y + row * (BIN_GRID.cellH + BIN_GRID.gapY),
    width: BIN_GRID.cellW,
    height: BIN_GRID.cellH,
  };
}

/** The pause button's rectangle in the top bar. */
export const PAUSE_BUTTON = { x: 1180, y: 10, width: 84, height: 38 };

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/** What a click at canvas position (x, y) means, in play-screen priority order. */
export function actionAt(x, y) {
  if (inRect(x, y, PAUSE_BUTTON)) return { type: 'pause' };
  for (let i = 0; i < INGREDIENT_ORDER.length; i += 1) {
    if (inRect(x, y, binRect(i))) return { type: 'bin', ing: INGREDIENT_ORDER[i] };
  }
  if (inRect(x, y, BOARD)) return { type: 'board' };
  for (let i = 0; i < BURNERS.length; i += 1) {
    const burner = BURNERS[i];
    if (inCircle(x, y, burner.x, burner.y, burner.r + 14)) return { type: 'burner', index: i };
  }
  for (let i = 0; i < PLATES.length; i += 1) {
    const plate = PLATES[i];
    if (inCircle(x, y, plate.x, plate.y, plate.r + 12)) return { type: 'plate', index: i };
  }
  if (inRect(x, y, TRASH)) return { type: 'trash' };
  return { type: 'none' };
}

/** What a keyboard event means; returns null for keys the game ignores. */
export function actionForKey(key) {
  const lower = key.toLowerCase();
  const byNumber = INGREDIENT_ORDER.findIndex((ing, index) => String(index + 1) === key);
  if (byNumber >= 0) return { type: 'bin', ing: INGREDIENT_ORDER[byNumber] };
  switch (lower) {
    case 'q':
      return { type: 'board' };
    case 'w':
      return { type: 'burner', index: 0 };
    case 'e':
      return { type: 'burner', index: 1 };
    case 'a':
      return { type: 'plate', index: 0 };
    case 's':
      return { type: 'plate', index: 1 };
    case 'd':
      return { type: 'plate', index: 2 };
    case 't':
      return { type: 'trash' };
    case 'p':
    case 'escape':
      return { type: 'pause' };
    case 'enter':
    case ' ':
      return { type: 'confirm' };
    default:
      return null;
  }
}

/** Convert a mouse event on the canvas to canvas coordinates. */
export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}
