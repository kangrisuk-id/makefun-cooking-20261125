// Drawing the kitchen itself: the wall, shelves and lamps behind the counter,
// the ingredient bins, the chopping board, the stove with its pans and
// doneness sweep, the plating shelf, the bin, the held item and the particle
// effects. All art is drawn in code; nothing is loaded.

import { BIN_GRID, BOARD, BURNERS, COLORS, COOK_PERFECT, COUNTER, PLATES, STOVE, TRASH } from './config.js';
import { binRect } from './input.js';
import { INGREDIENTS, INGREDIENT_ORDER, stageName } from './recipes.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

/** One ingredient, drawn at (x, y) with rough half-size s, in its stage. */
export function drawFood(ctx, item, x, y, s) {
  const stage = item.stageNameOverride ?? stageName(item);
  ctx.save();
  ctx.translate(x, y);
  if (item.quality === 'burnt') ctx.filter = 'brightness(0.45) saturate(0.6)';
  switch (item.ing) {
    case 'bun': {
      ctx.fillStyle = '#e9b558';
      ctx.beginPath();
      ctx.ellipse(0, 2, s, s * 0.62, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#d99b35';
      ctx.fillRect(-s, 2, s * 2, s * 0.22);
      ctx.fillStyle = '#fff3d6';
      for (const [dx, dy] of [[-s * 0.4, -s * 0.28], [0, -s * 0.42], [s * 0.42, -s * 0.24]]) {
        ctx.beginPath();
        ctx.ellipse(dx, dy, s * 0.09, s * 0.05, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'patty': {
      ctx.fillStyle = stage === 'cooked' ? '#6e4525' : '#b06a5a';
      ellipse(ctx, 0, 0, s, s * 0.52);
      ctx.fill();
      if (stage === 'cooked') {
        ctx.strokeStyle = '#4a2c15';
        ctx.lineWidth = 2;
        for (const dx of [-s * 0.5, 0, s * 0.5]) {
          ctx.beginPath();
          ctx.moveTo(dx, -s * 0.4);
          ctx.lineTo(dx + s * 0.16, s * 0.4);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ellipse(ctx, -s * 0.3, -s * 0.15, s * 0.4, s * 0.18);
        ctx.fill();
      }
      break;
    }
    case 'chicken': {
      ctx.fillStyle = stage === 'cooked' ? '#c97e35' : '#e8a798';
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, 0, s * 0.78, s * 0.58, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = stage === 'cooked' ? '#a86424' : '#d98f7d';
      ctx.beginPath();
      ctx.ellipse(s * 0.42, s * 0.34, s * 0.3, s * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7ead2';
      ctx.beginPath();
      ctx.ellipse(s * 0.66, s * 0.5, s * 0.16, s * 0.1, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'potato': {
      if (stage === 'raw') {
        ctx.fillStyle = '#d9b078';
        ellipse(ctx, 0, 0, s * 0.9, s * 0.62);
        ctx.fill();
        ctx.fillStyle = '#b98d4f';
        for (const [dx, dy] of [[-s * 0.4, -s * 0.1], [s * 0.2, s * 0.2], [s * 0.45, -s * 0.25]]) {
          ctx.beginPath();
          ctx.ellipse(dx, dy, s * 0.09, s * 0.06, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const stick = stage === 'cooked' ? '#f0b93e' : '#efdfae';
        ctx.fillStyle = stick;
        for (let i = -2; i <= 2; i += 1) {
          ctx.save();
          ctx.translate(i * s * 0.3, Math.abs(i) * s * 0.08);
          ctx.rotate(i * 0.16);
          ctx.fillRect(-s * 0.11, -s * 0.85, s * 0.22, s * 1.5);
          ctx.restore();
        }
        if (stage === 'cooked') {
          ctx.fillStyle = '#d64541';
          ctx.fillRect(-s * 0.95, s * 0.42, s * 1.9, s * 0.34);
          ctx.fillStyle = '#b02e2a';
          ctx.fillRect(-s * 0.95, s * 0.42, s * 1.9, s * 0.1);
        }
      }
      break;
    }
    case 'tomato': {
      if (stage === 'chopped') {
        ctx.fillStyle = '#d63c30';
        for (const [dx, dy] of [[-s * 0.45, -s * 0.2], [s * 0.1, -s * 0.42], [s * 0.48, 0], [-s * 0.05, s * 0.3], [-s * 0.55, s * 0.38]]) {
          roundRect(ctx, dx - s * 0.26, dy - s * 0.26, s * 0.52, s * 0.52, 4);
          ctx.fill();
        }
        ctx.fillStyle = '#f0836f';
        roundRect(ctx, -s * 0.31, -s * 0.66, s * 0.3, s * 0.3, 3);
        ctx.fill();
      } else {
        ctx.fillStyle = '#d63c30';
        ellipse(ctx, 0, s * 0.08, s * 0.82, s * 0.74);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ellipse(ctx, -s * 0.3, -s * 0.18, s * 0.26, s * 0.16);
        ctx.fill();
        ctx.fillStyle = '#3f7d33';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.62);
        ctx.lineTo(s * 0.3, -s * 0.34);
        ctx.lineTo(s * 0.05, -s * 0.3);
        ctx.lineTo(s * 0.12, -s * 0.78);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'lettuce': {
      // A ruffled leaf cluster: offset leaves at uneven angles, never a cross.
      const leaves = stage === 'chopped'
        ? [[-0.42, 0.1, 0.7], [-0.1, -0.3, 0.2], [0.3, 0.22, 1.1], [0.05, 0.38, 2.6], [-0.3, -0.32, 2.9], [0.44, -0.18, 1.9]]
        : [[-0.38, 0.16, 0.6], [0.02, -0.3, 0.1], [0.4, 0.1, 1.2], [-0.05, 0.34, 2.7], [0.18, -0.05, 0.9]];
      leaves.forEach(([fx, fy, rot], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#5da24a' : '#6cb457';
        ctx.beginPath();
        ctx.ellipse(fx * s, fy * s, s * 0.55, s * 0.3, rot, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#8fce74';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.42, s * 0.24, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(240, 255, 220, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, s * 0.1);
      ctx.quadraticCurveTo(0, -s * 0.08, s * 0.32, -s * 0.12);
      ctx.stroke();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-s * 0.85, s * 0.5);
      ctx.lineTo(s * 0.85, s * 0.5);
      ctx.lineTo(s * 0.85, -s * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e0aa2e';
      for (const [dx, dy, r] of [[s * 0.3, s * 0.12, 0.14], [s * 0.58, s * 0.3, 0.1], [-s * 0.1, s * 0.3, 0.09]]) {
        ctx.beginPath();
        ctx.ellipse(dx, dy, s * r, s * r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'egg': {
      if (stage === 'cooked') {
        ctx.fillStyle = '#fdf6e9';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.92, s * 0.66, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f5a623';
        ellipse(ctx, s * 0.1, -s * 0.05, s * 0.36, s * 0.3);
        ctx.fill();
        ctx.fillStyle = '#ffc95e';
        ellipse(ctx, 0, -s * 0.14, s * 0.16, s * 0.12);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fdf6e9';
        ellipse(ctx, 0, 0, s * 0.66, s * 0.82);
        ctx.fill();
        ctx.strokeStyle = '#e3d3ae';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

/** The wall behind everything: warm plaster, a tiled backsplash, shelves. */
function drawWall(ctx, game) {
  const grad = ctx.createLinearGradient(0, 58, 0, 470);
  grad.addColorStop(0, COLORS.wallTop);
  grad.addColorStop(1, COLORS.wallBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 58, 1280, 412);
  // Tiled backsplash band behind the counter.
  ctx.fillStyle = 'rgba(255, 220, 160, 0.07)';
  for (let y = 356; y < 470; y += 28) {
    for (let x = (y % 56 === 0 ? 0 : 24); x < 1280; x += 48) {
      ctx.fillRect(x, y, 44, 24);
    }
  }
  // A shelf with jars over the plating side.
  ctx.fillStyle = '#4a2c15';
  ctx.fillRect(830, 300, 400, 12);
  ctx.fillStyle = '#5d3a1d';
  ctx.fillRect(830, 312, 400, 6);
  const jars = [
    ['#d64541', 862], ['#f2a541', 916], ['#58b368', 970], ['#e8e3d5', 1024], ['#bc6c25', 1090], ['#9b5de5', 1150],
  ];
  for (const [color, jx] of jars) {
    ctx.fillStyle = 'rgba(240, 225, 195, 0.85)';
    roundRect(ctx, jx, 258, 34, 44, 5);
    ctx.fill();
    ctx.fillStyle = color;
    roundRect(ctx, jx + 4, 276, 26, 22, 3);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(jx + 2, 252, 30, 8);
  }
  // Hanging utensils over the board.
  ctx.strokeStyle = '#2e1a0c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(560, 330);
  ctx.lineTo(800, 330);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c8c8c8';
  for (const ux of [600, 660, 720]) {
    ctx.beginPath();
    ctx.moveTo(ux, 330);
    ctx.lineTo(ux, 356);
    ctx.stroke();
    ctx.fillStyle = '#9a9a9a';
    ctx.beginPath();
    ctx.ellipse(ux, 372, 10, 17, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // A chalkboard menu on the left wall.
  ctx.fillStyle = '#22392e';
  roundRect(ctx, 40, 262, 300, 168, 8);
  ctx.fill();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = '#f5eeda';
  ctx.font = 'bold 21px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText("TODAY'S SPECIALS", 62, 296);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#ffe9a8';
  const specials = ['Classic Burger .... 14', 'Cheeseburger ..... 17', 'Chicken Plate .... 19', 'Deluxe Stack ..... 24'];
  specials.forEach((line, i) => ctx.fillText(line, 62, 330 + i * 26));
  // Two hanging lamps.
  for (const lx of [420, 900]) {
    ctx.strokeStyle = '#1d1108';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 58);
    ctx.lineTo(lx, 96);
    ctx.stroke();
    const lampGrad = ctx.createRadialGradient(lx, 130, 6, lx, 130, 90);
    lampGrad.addColorStop(0, 'rgba(255, 205, 110, 0.5)');
    lampGrad.addColorStop(1, 'rgba(255, 205, 110, 0)');
    ctx.fillStyle = lampGrad;
    ctx.fillRect(lx - 90, 60, 180, 180);
    ctx.fillStyle = '#2e1a0c';
    ctx.beginPath();
    ctx.moveTo(lx - 30, 118);
    ctx.lineTo(lx + 30, 118);
    ctx.lineTo(lx + 14, 94);
    ctx.lineTo(lx - 14, 94);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd873';
    ellipse(ctx, lx, 120, 12, 7);
    ctx.fill();
  }
  void game;
}

/** The wooden counter block the stations stand on. */
function drawCounter(ctx) {
  const grad = ctx.createLinearGradient(0, COUNTER.y, 0, 800);
  grad.addColorStop(0, COLORS.counterTop);
  grad.addColorStop(0.18, COLORS.counterFace);
  grad.addColorStop(1, '#5f3a1e');
  ctx.fillStyle = grad;
  ctx.fillRect(COUNTER.x, COUNTER.y, COUNTER.width, COUNTER.height);
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(0, COUNTER.y, 1280, 10);
  ctx.strokeStyle = 'rgba(46, 26, 12, 0.35)';
  ctx.lineWidth = 2;
  for (const px of [200, 480, 760, 1040]) {
    ctx.beginPath();
    ctx.moveTo(px, 520);
    ctx.lineTo(px, 780);
    ctx.stroke();
  }
}

/** The eight ingredient bins, each with its food and its number key. */
function drawBins(ctx, game, hover) {
  INGREDIENT_ORDER.forEach((ing, index) => {
    const rect = binRect(index);
    const isHover = hover === `bin:${ing}`;
    ctx.fillStyle = isHover ? '#a9743f' : '#8a5a2f';
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    roundRect(ctx, rect.x + 7, rect.y + 7, rect.width - 14, rect.height - 44, 8);
    ctx.fill();
    drawFood(ctx, { ing, stage: 0, quality: 'fresh' }, rect.x + rect.width / 2, rect.y + 44, 27);
    ctx.fillStyle = COLORS.cream;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(INGREDIENTS[ing].label, rect.x + rect.width / 2, rect.y + rect.height - 18);
    ctx.fillStyle = COLORS.brass;
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText(`[${index + 1}]`, rect.x + rect.width / 2, rect.y + rect.height - 3);
  });
  void game;
  void BIN_GRID;
}

/** The chopping board, its item, the knife, and its progress pips. */
function drawBoard(ctx, game, hover, time) {
  ctx.fillStyle = hover === 'board' ? '#d8b988' : '#cda76e';
  roundRect(ctx, BOARD.x, BOARD.y, BOARD.width, BOARD.height, 10);
  ctx.fill();
  ctx.strokeStyle = '#a37c3f';
  ctx.lineWidth = 3;
  ctx.stroke();
  const board = game.stations.board;
  if (board !== null) {
    ctx.fillStyle = 'rgba(90, 55, 20, 0.35)';
    ellipse(ctx, BOARD.x + BOARD.width / 2, BOARD.y + 66, 40, 10);
    ctx.fill();
    drawFood(ctx, board, BOARD.x + BOARD.width / 2, BOARD.y + 58, 34);
    // Knife, mid-chop, angled above the board.
    const lift = board.chops >= 3 ? 0 : Math.abs(Math.sin(time * 5)) * 8;
    ctx.save();
    ctx.translate(BOARD.x + BOARD.width / 2 + 52, BOARD.y + 30 - lift);
    ctx.rotate(0.5);
    ctx.fillStyle = '#d9d9d9';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(46, 8);
    ctx.lineTo(44, 20);
    ctx.lineTo(2, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(-16, 2, 18, 10);
    ctx.restore();
    // Progress pips.
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < board.chops ? COLORS.good : 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(BOARD.x + 62 + i * 34, BOARD.y + BOARD.height - 14, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = 'rgba(46,26,12,0.55)';
    ctx.font = '15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHOPPING BOARD', BOARD.x + BOARD.width / 2, BOARD.y + 52);
    ctx.font = '13px Georgia, serif';
    ctx.fillText('click to place, click to chop', BOARD.x + BOARD.width / 2, BOARD.y + 76);
  }
  // The trash bin under the board.
  ctx.fillStyle = hover === 'trash' ? '#6e6e6e' : '#545454';
  roundRect(ctx, TRASH.x, TRASH.y, TRASH.width, TRASH.height, 8);
  ctx.fill();
  ctx.fillStyle = '#d8d8d8';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('BIN  [T]', TRASH.x + TRASH.width / 2, TRASH.y + 38);
}

/** One pan's doneness: an arc sweep with the perfect window marked. */
function drawDoneness(ctx, item, cx, cy) {
  const r = 52;
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();
  ctx.strokeStyle = COLORS.good;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * (0.75 + COOK_PERFECT.from * 1.5), Math.PI * (0.75 + COOK_PERFECT.to * 1.5));
  ctx.stroke();
  const angle = Math.PI * (0.75 + Math.min(1, item.cook) * 1.5);
  ctx.strokeStyle = item.quality === 'burnt' ? '#222' : COLORS.brass;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle) * (r - 4), cy + Math.sin(angle) * (r - 4));
  ctx.stroke();
}

/** The stove block, flames, pans and whatever is cooking in them. */
function drawStove(ctx, game, time) {
  ctx.fillStyle = '#33383e';
  roundRect(ctx, STOVE.x, STOVE.y, STOVE.width, STOVE.height, 12);
  ctx.fill();
  ctx.fillStyle = '#22252a';
  roundRect(ctx, STOVE.x + 10, STOVE.y + STOVE.height - 34, STOVE.width - 20, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#e8b64c';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SIZZLE STOVE', STOVE.x + STOVE.width / 2, STOVE.y + STOVE.height - 17);
  BURNERS.forEach((burner, index) => {
    const item = game.stations.burners[index];
    // Flame ring while a pan is on.
    if (item !== null) {
      for (let f = 0; f < 7; f += 1) {
        const a = (f / 7) * Math.PI * 2 + time * 3;
        const fx = burner.x + Math.cos(a) * (burner.r - 6);
        const fy = burner.y + Math.sin(a) * (burner.r - 6) + 8;
        ctx.fillStyle = f % 2 === 0 ? 'rgba(255, 140, 40, 0.75)' : 'rgba(255, 200, 60, 0.75)';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 6, 10 + Math.sin(time * 9 + f) * 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#15171a';
    ellipse(ctx, burner.x, burner.y + 6, burner.r + 8, burner.r - 8);
    ctx.fill();
    ctx.fillStyle = '#3c4148';
    ellipse(ctx, burner.x, burner.y, burner.r, burner.r - 12);
    ctx.fill();
    if (item !== null) {
      drawFood(ctx, item, burner.x, burner.y - 2, 26);
      drawDoneness(ctx, item, burner.x, burner.y);
    } else {
      ctx.fillStyle = 'rgba(255,243,214,0.5)';
      ctx.font = '12px Georgia, serif';
      ctx.fillText(`pan [${index === 0 ? 'W' : 'E'}]`, burner.x, burner.y + 4);
    }
  });
}

/** The plating shelf: three plates, their stacked dishes, serve hints. */
function drawPlates(ctx, game, hover) {
  ctx.fillStyle = 'rgba(46,26,12,0.6)';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PLATING', 1096, 452);
  PLATES.forEach((plate, index) => {
    const items = game.stations.plates[index];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ellipse(ctx, plate.x, plate.y + 8, plate.r + 6, plate.r * 0.42);
    ctx.fill();
    ctx.fillStyle = hover === `plate:${index}` ? '#ffffff' : '#f3ead8';
    ellipse(ctx, plate.x, plate.y, plate.r, plate.r * 0.72);
    ctx.fill();
    ctx.strokeStyle = '#c9b48a';
    ctx.lineWidth = 2;
    ctx.stroke();
    items.forEach((item, i) => {
      const dx = ((i % 3) - 1) * 22;
      const dy = Math.floor(i / 3) * -13 + (i % 2) * 5;
      drawFood(ctx, item, plate.x + dx, plate.y + dy, 19);
    });
    ctx.fillStyle = 'rgba(46,26,12,0.75)';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText(`plate ${index + 1} [${'ASD'[index]}]`, plate.x, plate.y + plate.r * 0.72 + 16);
    if (items.length > 0) {
      ctx.fillStyle = COLORS.good;
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillText('click plate to SERVE', plate.x, plate.y - plate.r * 0.72 - 6);
    }
  });
}

/** Particles and floating texts above the kitchen. */
function drawEffects(ctx, game) {
  for (const effect of game.effects) {
    const k = effect.t / effect.life;
    if (effect.kind === 'steam' || effect.kind === 'smoke') {
      ctx.fillStyle = effect.kind === 'steam' ? `rgba(255,255,255,${0.35 * (1 - k)})` : `rgba(40,40,40,${0.5 * (1 - k)})`;
      ctx.beginPath();
      ctx.ellipse(effect.x, effect.y - k * 56, 9 + k * 13, 7 + k * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.kind === 'coins') {
      ctx.fillStyle = COLORS.brass;
      ctx.beginPath();
      ctx.ellipse(effect.x - 14, effect.y - k * 44, 8, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(effect.x + 14, effect.y - k * 52, 7, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(88, 179, 104, ${1 - k * k})`;
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(effect.text, effect.x, effect.y - 16 - k * 44);
    } else if (effect.kind === 'spark') {
      ctx.strokeStyle = `rgba(255, 220, 120, ${1 - k})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2 + effect.x;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(effect.x + Math.cos(a) * (10 + k * 16), effect.y + Math.sin(a) * (10 + k * 16));
        ctx.stroke();
      }
    }
  }
}

/** The whole kitchen scene, back to front. */
export function drawKitchen(ctx, game, hover, pointer, time) {
  drawWall(ctx, game);
  drawCounter(ctx);
  drawBins(ctx, game, hover);
  drawBoard(ctx, game, hover, time);
  drawStove(ctx, game, time);
  drawPlates(ctx, game, hover);
  drawEffects(ctx, game);
  // The held item rides the pointer (or hovers over the board for keys).
  if (game.hand !== null && game.screen === 'play') {
    const hx = pointer.inside ? pointer.x : BOARD.x + BOARD.width / 2;
    const hy = pointer.inside ? pointer.y : BOARD.y - 24;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ellipse(ctx, hx, hy + 16, 26, 8);
    ctx.fill();
    drawFood(ctx, game.hand, hx, hy + Math.sin(time * 3) * 2, 26);
  }
}
