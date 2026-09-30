// A dumb sheep "baaaa" synthesized with the Web Audio API — no audio asset
// needed, and it's created lazily inside the click handler so it satisfies
// the browser's autoplay-needs-a-user-gesture requirement.
let audioCtx: AudioContext | null = null;

export function playStupidNoise() {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const ctx = audioCtx;
  const now = ctx.currentTime;
  const duration = 0.8;

  // buzzy base tone that wobbles up and down a few times ("b-b-baaa") before
  // settling and dropping off at the end — the pitch shape a bleat has
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(360, now);
  osc.frequency.linearRampToValueAtTime(430, now + 0.08);
  osc.frequency.linearRampToValueAtTime(340, now + 0.18);
  osc.frequency.linearRampToValueAtTime(420, now + 0.3);
  osc.frequency.linearRampToValueAtTime(330, now + 0.45);
  osc.frequency.linearRampToValueAtTime(250, now + duration);

  // choppy amplitude tremolo gives it the "b-b-b-baa" bleating texture
  // rather than a smooth tone
  const tremolo = ctx.createOscillator();
  tremolo.frequency.value = 11;
  const tremoloDepth = ctx.createGain();
  tremoloDepth.gain.value = 0.3;
  const tremoloBase = ctx.createConstantSource();
  tremoloBase.offset.value = 0.7;

  const amplitude = ctx.createGain();
  tremolo.connect(tremoloDepth);
  tremoloDepth.connect(amplitude.gain);
  tremoloBase.connect(amplitude.gain);

  // overall fade in/out envelope
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.55, now + 0.06);
  envelope.gain.setValueAtTime(0.5, now + duration - 0.18);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(amplitude);
  amplitude.connect(envelope);
  envelope.connect(ctx.destination);

  osc.start(now);
  tremolo.start(now);
  tremoloBase.start(now);
  osc.stop(now + duration);
  tremolo.stop(now + duration);
  tremoloBase.stop(now + duration);
}
