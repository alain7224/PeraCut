export type SfxType = 'beep' | 'whoosh' | 'clap' | 'riser' | 'pop';

export const SFX_PATHS: Record<SfxType, string> = {
  beep: '/sfx/beep.wav',
  whoosh: '/sfx/whoosh.wav',
  clap: '/sfx/clap.wav',
  riser: '/sfx/riser.wav',
  pop: '/sfx/pop.wav',
};

export async function generateBeep(
  ctx: AudioContext,
  duration = 0.3,
  frequency = 880
): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 5);
    data[i] = envelope * Math.sin(2 * Math.PI * frequency * t);
  }
  return buffer;
}

export async function generateWhoosh(
  ctx: AudioContext,
  duration = 0.5
): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const freq = 200 + t * 1800;
    const envelope = Math.sin(Math.PI * t);
    data[i] = envelope * 0.5 * Math.sin(2 * Math.PI * freq * (i / sampleRate));
  }
  return buffer;
}

export async function generateClap(
  ctx: AudioContext,
  duration = 0.2
): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 25);
    data[i] = envelope * (Math.random() * 2 - 1);
  }
  return buffer;
}

export async function generateRiser(
  ctx: AudioContext,
  duration = 1.0
): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const freq = 200 + t * 1000;
    const envelope = t;
    data[i] = envelope * 0.5 * Math.sin(2 * Math.PI * freq * (i / sampleRate));
  }
  return buffer;
}

export async function generatePop(
  ctx: AudioContext,
  duration = 0.15
): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 30);
    data[i] = envelope * Math.sin(2 * Math.PI * 200 * t);
  }
  return buffer;
}

  // SharedAudioContext: reuse a single context to avoid hitting browser limits
let _sharedCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!_sharedCtx || _sharedCtx.state === 'closed') {
    _sharedCtx = new AudioContext();
  }
  return _sharedCtx;
}

export async function playSfx(type: SfxType): Promise<void> {
  const ctx = getAudioContext();
  let buffer: AudioBuffer;

  switch (type) {
    case 'beep':
      buffer = await generateBeep(ctx);
      break;
    case 'whoosh':
      buffer = await generateWhoosh(ctx);
      break;
    case 'clap':
      buffer = await generateClap(ctx);
      break;
    case 'riser':
      buffer = await generateRiser(ctx);
      break;
    case 'pop':
      buffer = await generatePop(ctx);
      break;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  // Don't close the shared context; it will be reused for future SFX playback
}
