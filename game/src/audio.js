// Every sound in Sizzle & Serve is synthesized with WebAudio: no audio files,
// no network. Short envelopes of oscillators and filtered noise give the chop,
// the sizzle loop, the service bell and the coin sparkle. Audio starts lazily
// on the first user gesture, as browsers require.

let context = null;
let master = null;
let sizzleNodes = null;

function ensureContext() {
  if (context !== null) return context;
  const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
  if (AudioCtor === undefined) return null;
  context = new AudioCtor();
  master = context.createGain();
  master.gain.value = 0.35;
  master.connect(context.destination);
  return context;
}

/** Call from any click or key press so the browser unlocks the audio context. */
export function unlockAudio() {
  const ctx = ensureContext();
  if (ctx !== null && ctx.state === 'suspended') void ctx.resume();
}

function tone(freqFrom, freqTo, seconds, type, volume, delay = 0) {
  const ctx = ensureContext();
  if (ctx === null || master === null) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), start + seconds);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + seconds + 0.05);
}

function noiseBurst(seconds, volume, filterFreq, delay = 0) {
  const ctx = ensureContext();
  if (ctx === null || master === null) return;
  const start = ctx.currentTime + delay;
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.9;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  source.connect(filter).connect(gain).connect(master);
  source.start(start);
}

/** One knife chop: a woody knock with a short noise snap. */
export function playChop() {
  tone(210, 90, 0.09, 'square', 0.25);
  noiseBurst(0.05, 0.2, 1800);
}

/** A pan placed on a burner: a soft metallic clink. */
export function playPanDown() {
  tone(620, 480, 0.07, 'triangle', 0.2);
  noiseBurst(0.04, 0.08, 3200);
}

/** Start or stop the looping sizzle that plays while anything is in a pan. */
export function setSizzle(on) {
  const ctx = ensureContext();
  if (ctx === null || master === null) return;
  if (on && sizzleNodes === null) {
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4200;
    const gain = ctx.createGain();
    gain.gain.value = 0.045;
    source.connect(filter).connect(gain).connect(master);
    source.start();
    sizzleNodes = { source, gain };
  } else if (!on && sizzleNodes !== null) {
    try {
      sizzleNodes.source.stop();
    } catch {
      /* already stopped */
    }
    sizzleNodes = null;
  }
}

/** The service bell when a plate goes out. */
export function playBell() {
  tone(1568, 1560, 0.35, 'sine', 0.3);
  tone(2093, 2080, 0.22, 'sine', 0.14, 0.02);
}

/** Coins landing in the till: two bright pings. */
export function playCoins() {
  tone(988, 940, 0.09, 'square', 0.16);
  tone(1319, 1240, 0.14, 'square', 0.16, 0.07);
}

/** A dull thud for a mistake (wrong plate, burnt food, a walk-out). */
export function playThud() {
  tone(140, 70, 0.18, 'sine', 0.3);
}

/** A rising little arpeggio when a day's goal is met. */
export function playDayClear() {
  tone(523, 523, 0.12, 'triangle', 0.22);
  tone(659, 659, 0.12, 'triangle', 0.22, 0.11);
  tone(784, 784, 0.12, 'triangle', 0.22, 0.22);
  tone(1047, 1047, 0.3, 'triangle', 0.24, 0.33);
}
