// WAV file generator for SFX assets
// Generates 16-bit PCM mono WAV at 44100Hz
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SAMPLE_RATE = 44100;

function writeWav(samples, filePath) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);         // chunk size
  buffer.writeUInt16LE(1, 20);          // PCM format
  buffer.writeUInt16LE(1, 22);          // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);          // block align
  buffer.writeUInt16LE(16, 34);         // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  writeFileSync(filePath, buffer);
  console.log(`Written: ${filePath}`);
}

const outDir = join(__dirname, '../client/public/sfx');
mkdirSync(outDir, { recursive: true });

// beep.wav — 440Hz sine, 0.3s
{
  const duration = 0.3;
  const freq = 440;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 5);
    samples[i] = env * Math.sin(2 * Math.PI * freq * t);
  }
  writeWav(samples, join(outDir, 'beep.wav'));
}

// whoosh.wav — sweep 200→2000Hz, 0.5s
{
  const duration = 0.5;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = 200 + t * 1800;
    const env = Math.sin(Math.PI * t);
    samples[i] = env * 0.5 * Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE));
  }
  writeWav(samples, join(outDir, 'whoosh.wav'));
}

// clap.wav — noise burst with decay, 0.2s
{
  const duration = 0.2;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(n);
  // Seed-based pseudo-random for determinism
  let seed = 12345;
  function rand() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff * 2 - 1;
  }
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 25);
    samples[i] = env * rand();
  }
  writeWav(samples, join(outDir, 'clap.wav'));
}

// riser.wav — ascending 200→1200Hz, 1.0s
{
  const duration = 1.0;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = 200 + t * 1000;
    const env = t;
    samples[i] = env * 0.5 * Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE));
  }
  writeWav(samples, join(outDir, 'riser.wav'));
}

// pop.wav — short sine burst, 0.1s
{
  const duration = 0.1;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 30);
    samples[i] = env * Math.sin(2 * Math.PI * 200 * t);
  }
  writeWav(samples, join(outDir, 'pop.wav'));
}

console.log('All SFX files generated.');
