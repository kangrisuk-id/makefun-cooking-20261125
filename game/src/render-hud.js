// The heads-up layer of Sizzle & Serve: the top bar with the shift clock and
// the till, the order tickets on their rail (customer face, dish, parts and
// patience bar), the centre message, and the full-screen states (title,
// pause, day clear, game over) drawn over the kitchen.

import { COLORS, MAX_STRIKES, SHIFT_SECONDS, TICKET_RAIL, TOP_BAR } from './config.js';
import { PAUSE_BUTTON } from './input.js';
import { patienceFraction } from './orders.js';
import { dayGoal, SCREEN_DAY_CLEAR, SCREEN_OVER, SCREEN_PAUSE, SCREEN_TITLE } from './state.js';
import { drawFood, roundRect } from './render-kitchen.js';

function bar(ctx, x, y, w, h, fraction, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (fraction > 0) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, Math.max(h, w * Math.min(1, fraction)), h, h / 2);
    ctx.fill();
  }
}

/** The top strip: brand, shift clock, day goal progress, coins, combo, pause. */
export function drawTopBar(ctx, game) {
  ctx.fillStyle = '#241407';
  ctx.fillRect(TOP_BAR.x, TOP_BAR.y, TOP_BAR.width, TOP_BAR.height);
  ctx.fillStyle = COLORS.brass;
  ctx.fillRect(0, TOP_BAR.height - 3, 1280, 3);
  ctx.fillStyle = COLORS.brass;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('Sizzle & Serve', 18, 38);
  ctx.fillStyle = COLORS.cream;
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`Day ${game.day}`, 232, 37);
  // Shift clock.
  const clockFrac = Math.max(0, game.timeLeft / SHIFT_SECONDS);
  bar(ctx, 330, 22, 240, 15, clockFrac, clockFrac > 0.25 ? COLORS.good : COLORS.bad);
  ctx.fillStyle = COLORS.cream;
  ctx.font = '13px Georgia, serif';
  ctx.fillText(`${Math.ceil(game.timeLeft)}s left`, 580, 35);
  // Day goal.
  const goal = dayGoal(game.day);
  bar(ctx, 700, 22, 170, 15, game.coins / goal, COLORS.brass);
  ctx.fillStyle = COLORS.cream;
  ctx.fillText(`goal ${goal}`, 878, 35);
  // Till and combo.
  ctx.fillStyle = COLORS.brass;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`◉ ${game.bank}`, 968, 38);
  if (game.combo >= 2) {
    ctx.fillStyle = '#ff9f43';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(`combo ×${game.combo}`, 1052, 38);
  }
  // Strikes.
  ctx.font = '16px Georgia, serif';
  for (let i = 0; i < MAX_STRIKES; i += 1) {
    ctx.fillStyle = i < game.strikes ? COLORS.bad : 'rgba(255,243,214,0.3)';
    ctx.fillText('✖', 1136 + i * 16, 37);
  }
  // Pause button.
  ctx.fillStyle = '#3a2410';
  roundRect(ctx, PAUSE_BUTTON.x, PAUSE_BUTTON.y, PAUSE_BUTTON.width, PAUSE_BUTTON.height, 8);
  ctx.fill();
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.screen === SCREEN_PAUSE ? 'RESUME' : 'PAUSE', PAUSE_BUTTON.x + PAUSE_BUTTON.width / 2, PAUSE_BUTTON.y + 24);
  ctx.textAlign = 'left';
}

/** One customer's face, drawn from the ticket's look. */
function drawCustomer(ctx, look, x, y, r, happy) {
  ctx.fillStyle = look.shirt;
  ctx.beginPath();
  ctx.ellipse(x, y + r + 8, r * 0.95, r * 0.55, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = look.skin;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.55, r * 0.98, r * 0.5, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#2e1a0c';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.34, y - r * 0.05, r * 0.09, r * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.34, y - r * 0.05, r * 0.09, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2e1a0c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (happy) ctx.arc(x, y + r * 0.18, r * 0.42, 0.15 * Math.PI, 0.85 * Math.PI);
  else ctx.arc(x, y + r * 0.62, r * 0.36, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();
}

/** The ticket rail: one paper ticket per order, pinned to the board. */
export function drawTickets(ctx, game) {
  // The rail itself.
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(0, 64, 1280, 8);
  if (game.orders.length === 0 && game.screen === 'play') {
    ctx.fillStyle = 'rgba(255,243,214,0.65)';
    ctx.font = 'italic 17px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('No orders yet — the lunch crowd is on its way…', 24, 130);
  }
  game.orders.forEach((ticket, index) => {
    const x = TICKET_RAIL.x + index * (TICKET_RAIL.width + TICKET_RAIL.gap);
    const y = TICKET_RAIL.y + Math.sin(ticket.bob) * 1.5;
    const frac = patienceFraction(ticket);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    roundRect(ctx, x + 4, y + 5, TICKET_RAIL.width, TICKET_RAIL.height, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.ticketPaper;
    roundRect(ctx, x, y, TICKET_RAIL.width, TICKET_RAIL.height, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.ticketPin;
    ctx.beginPath();
    ctx.ellipse(x + TICKET_RAIL.width / 2, y + 4, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCustomer(ctx, ticket.look, x + 40, y + 52, 26, frac > 0.3);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 19px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(ticket.recipe.name, x + 78, y + 38);
    ctx.fillStyle = '#8a6d3b';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(`${ticket.recipe.price} coins`, x + 78, y + 60);
    // Parts as mini icons with stage words.
    ticket.recipe.parts.forEach((part, i) => {
      const px = x + 30 + i * 46;
      drawFood(ctx, { ing: part.ing, stage: 0, quality: 'fresh', stageNameOverride: part.stage }, px, y + 106, 15);
      ctx.fillStyle = '#5d4326';
      ctx.font = '10px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(part.stage === 'raw' ? '' : part.stage, px, y + 132);
    });
    ctx.textAlign = 'left';
    // Patience bar.
    const color = frac > 0.5 ? COLORS.good : frac > 0.25 ? COLORS.warn : COLORS.bad;
    bar(ctx, x + 12, y + TICKET_RAIL.height - 14, TICKET_RAIL.width - 24, 8, frac, color);
  });
}

/** The short centre message ("Perfect!", "That plate has burnt food…"). */
export function drawMessage(ctx, game) {
  if (game.messageT <= 0 || game.message === '') return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, game.messageT / 0.4);
  ctx.font = 'bold 27px Georgia, serif';
  const w = ctx.measureText(game.message).width + 44;
  ctx.fillStyle = 'rgba(30, 17, 7, 0.88)';
  roundRect(ctx, 640 - w / 2, 396, w, 48, 12);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.fillText(game.message, 640, 429);
  ctx.restore();
}

function dimScreen(ctx, alpha) {
  ctx.fillStyle = `rgba(16, 8, 3, ${alpha})`;
  ctx.fillRect(0, 0, 1280, 800);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#c99a5f';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/** Title screen: the name big, the rules in one panel, the kitchen behind. */
export function drawTitle(ctx, game) {
  dimScreen(ctx, 0.45);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd873';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('Sizzle & Serve', 640, 196);
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('a rush-hour cooking game', 640, 236);
  panel(ctx, 340, 276, 600, 300);
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('HOW TO PLAY', 640, 316);
  ctx.font = '17px Georgia, serif';
  ctx.textAlign = 'left';
  const lines = [
    '1.  Read the tickets on the rail — each wants a dish.',
    '2.  Click an ingredient bin (or press 1–8) to pick food up.',
    '3.  Chop at the board (click ×3), cook in a pan and pull',
    '      it out inside the green window — not raw, not burnt.',
    '4.  Build the dish on a plate, then click the plate to serve.',
    '5.  Fast, perfect plates earn tips and grow your combo.',
    'Reach the coin goal before the shift ends.',
    'Three walk-outs and the day is lost!',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 386, 352 + i * 27));
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.bad;
  ctx.font = 'bold 23px Georgia, serif';
  ctx.fillText('Click anywhere or press Enter to open the kitchen', 640, 632);
  if (game.served > 0) {
    ctx.fillStyle = COLORS.cream;
    ctx.font = '16px Georgia, serif';
    ctx.fillText(`Last run: ${game.served} served · best combo ×${game.bestCombo}`, 640, 668);
  }
  ctx.textAlign = 'left';
}

/** Pause overlay. */
export function drawPause(ctx) {
  dimScreen(ctx, 0.55);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText('Paused', 640, 380);
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Click PAUSE or press P to get back to the pans', 640, 424);
  ctx.textAlign = 'left';
}

/** Day-clear overlay: the goal was met, the next day is harder. */
export function drawDayClear(ctx, game) {
  dimScreen(ctx, 0.55);
  panel(ctx, 390, 250, 500, 300);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText(`Day ${game.day} cleared!`, 640, 316);
  ctx.font = '19px Georgia, serif';
  const lines = [
    `You earned ${game.coins} coins (goal ${dayGoal(game.day)})`,
    `${game.served} dishes served · best combo ×${game.bestCombo}`,
    `Bank: ${game.bank} coins · Score: ${game.score}`,
    '',
    `Day ${game.day + 1} brings new recipes and a faster rush.`,
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 362 + i * 28));
  ctx.fillStyle = COLORS.bad;
  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText('Click or press Enter for the next day', 640, 522);
  ctx.textAlign = 'left';
}

/** Game-over overlay with the run's summary. */
export function drawOver(ctx, game) {
  dimScreen(ctx, 0.6);
  panel(ctx, 390, 240, 500, 320);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('Kitchen Closed', 640, 306);
  ctx.font = '19px Georgia, serif';
  const reason = game.strikes >= 3 ? 'Three customers walked out.' : 'The shift ended short of the goal.';
  const lines = [
    reason,
    `You reached day ${game.day} · ${game.served} dishes served`,
    `${game.lost} walk-outs · ${game.stats.burnt} dishes burnt`,
    `Best combo ×${game.bestCombo}`,
    `Final score: ${game.score} · Bank: ${game.bank} coins`,
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 352 + i * 28));
  ctx.fillStyle = COLORS.bad;
  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText('Click or press Enter to cook again', 640, 528);
  ctx.textAlign = 'left';
}

/** Every HUD element for the current screen, in draw order. */
export function drawHud(ctx, game) {
  drawTopBar(ctx, game);
  drawTickets(ctx, game);
  drawMessage(ctx, game);
  if (game.screen === SCREEN_TITLE) drawTitle(ctx, game);
  else if (game.screen === SCREEN_PAUSE) drawPause(ctx);
  else if (game.screen === SCREEN_DAY_CLEAR) drawDayClear(ctx, game);
  else if (game.screen === SCREEN_OVER) drawOver(ctx, game);
}
