export const TEMPLATE_DURATIONS = [15000, 18000, 25000, 35000, 42000, 50000, 60000] as const;
export type TemplateDurationMs = (typeof TEMPLATE_DURATIONS)[number];
type LegacyTemplateDurationMs = 15000 | 25000 | 35000 | 60000;

export const TEMPLATE_ASPECT_RATIOS = ['9:16', '16:9'] as const;
export type TemplateAspectRatio = (typeof TEMPLATE_ASPECT_RATIOS)[number];

export type StyleId = 'cutout' | 'split' | 'flash' | 'glitch' | 'bars' | 'zoom';

export interface TemplatePresetScene {
  index: number;
  durationMs: number;
  mediaSlot: 'placeholder';
  transition: { type: string; durationMs: number };
  overlay?: { type: 'text' | 'color'; value: string };
  effects?: string[];
}

export interface TemplatePreset {
  id: string;
  styleId: StyleId;
  styleName: string;
  styleDescription: string;
  aspectRatio: TemplateAspectRatio;
  durationMs: TemplateDurationMs;
  scenes: TemplatePresetScene[];
  fillStrategy: 'loop' | 'freeze' | 'stretch';
  sfxTrack?: string;
  defaultMusicTrack?: string;
  tags: string[];
  isNew?: boolean;
}

function buildScenes(
  durations: number[],
  transitionType: string,
  transitionDurationMs: number,
  effects: string[],
  overlay?: TemplatePresetScene['overlay']
): TemplatePresetScene[] {
  return durations.map((d, i) => ({
    index: i,
    durationMs: d,
    mediaSlot: 'placeholder' as const,
    transition: { type: transitionType, durationMs: transitionDurationMs },
    effects: [...effects],
    ...(overlay ? { overlay } : {}),
  }));
}

function evenSplit(totalMs: number, n: number): number[] {
  const base = Math.floor(totalMs / n);
  const rem = totalMs - base * n;
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? base + rem : base));
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildFastSceneDurations(totalMs: number, sceneCount: number, seed: number): number[] {
  const min = 300;
  const max = 3000;
  const durations = Array.from({ length: sceneCount }, () => min);
  let remaining = totalMs - sceneCount * min;

  if (remaining < 0) {
    return evenSplit(totalMs, sceneCount);
  }

  for (let i = 0; i < sceneCount; i++) {
    if (remaining <= 0) break;
    const randomFactor = 0.2 + seededRandom(seed + i * 7) * 0.8;
    const room = max - durations[i];
    const add = Math.min(room, Math.round((remaining / (sceneCount - i)) * randomFactor));
    durations[i] += Math.max(0, add);
    remaining -= Math.max(0, add);
  }

  let idx = 0;
  while (remaining > 0) {
    const room = max - durations[idx % sceneCount];
    if (room > 0) {
      const add = Math.min(room, remaining, 120);
      durations[idx % sceneCount] += add;
      remaining -= add;
    }
    idx += 1;
  }

  return durations;
}

interface StyleDef {
  styleId: StyleId;
  styleName: string;
  styleDescription: string;
  fillStrategy: TemplatePreset['fillStrategy'];
  sfxTrack?: string;
  tags: string[];
  transitionType: string;
  transitionDurationMs: number;
  effects: string[];
  overlay?: TemplatePresetScene['overlay'];
  sceneCounts: Record<LegacyTemplateDurationMs, number>;
}

const STYLE_DEFS: StyleDef[] = [
  {
    styleId: 'cutout',
    styleName: 'Cutout',
    styleDescription: 'Efecto recorte en blanco y negro con bordes blancos y grano cinematográfico.',
    fillStrategy: 'freeze',
    sfxTrack: '/sfx/clap.wav',
    tags: ['b&w', 'grano', 'borde', 'cutout'],
    transitionType: 'cut',
    transitionDurationMs: 0,
    effects: ['blackwhite', 'grain', 'whiteBorder'],
    overlay: { type: 'color', value: 'rgba(255,255,255,0.08)' },
    sceneCounts: { 15000: 3, 25000: 5, 35000: 7, 60000: 10 },
  },
  {
    styleId: 'split',
    styleName: 'Split Screen',
    styleDescription: 'Pantalla dividida estilo b-roll con barras laterales y cortes netos.',
    fillStrategy: 'loop',
    sfxTrack: '/sfx/whoosh.wav',
    tags: ['split', 'broll', 'bars', 'dual'],
    transitionType: 'slideLeft',
    transitionDurationMs: 200,
    effects: ['splitScreen', 'colorBars'],
    sceneCounts: { 15000: 4, 25000: 6, 35000: 8, 60000: 12 },
  },
  {
    styleId: 'flash',
    styleName: 'Flash Cuts',
    styleDescription: 'Cortes rápidos con destello blanco entre escenas para energía máxima.',
    fillStrategy: 'stretch',
    sfxTrack: '/sfx/beep.wav',
    tags: ['flash', 'rápido', 'energía', 'blanco'],
    transitionType: 'flashWhite',
    transitionDurationMs: 80,
    effects: ['flashOverlay', 'highContrast'],
    overlay: { type: 'color', value: 'rgba(255,255,255,0.15)' },
    sceneCounts: { 15000: 4, 25000: 6, 35000: 8, 60000: 12 },
  },
  {
    styleId: 'glitch',
    styleName: 'Glitch',
    styleDescription: 'Efectos de fallo digital y ruido para un look tech disruptivo.',
    fillStrategy: 'loop',
    sfxTrack: '/sfx/beep.wav',
    tags: ['glitch', 'digital', 'ruido', 'tech'],
    transitionType: 'glitch',
    transitionDurationMs: 150,
    effects: ['digitalNoise', 'rgbShift', 'scanLines'],
    sceneCounts: { 15000: 3, 25000: 5, 35000: 7, 60000: 10 },
  },
  {
    styleId: 'bars',
    styleName: 'Letterbox',
    styleDescription: 'Barras cinemáticas en la parte superior e inferior para un aspecto de película.',
    fillStrategy: 'freeze',
    sfxTrack: '/sfx/riser.wav',
    tags: ['cinematic', 'letterbox', 'barras', 'película'],
    transitionType: 'fade',
    transitionDurationMs: 400,
    effects: ['letterboxBars', 'filmGrain', 'colorGrade'],
    sceneCounts: { 15000: 3, 25000: 5, 35000: 7, 60000: 10 },
  },
  {
    styleId: 'zoom',
    styleName: 'Progressive Zoom',
    styleDescription: 'Zoom progresivo que aumenta intensidad escena a escena.',
    fillStrategy: 'stretch',
    sfxTrack: '/sfx/whoosh.wav',
    tags: ['zoom', 'dinámico', 'intensidad', 'progressivo'],
    transitionType: 'zoom',
    transitionDurationMs: 300,
    effects: ['progressiveZoom', 'vignette'],
    sceneCounts: { 15000: 3, 25000: 5, 35000: 7, 60000: 10 },
  },
];

function buildPreset(
  style: StyleDef,
  aspectRatio: TemplateAspectRatio,
  durationMs: LegacyTemplateDurationMs
): TemplatePreset {
  const sceneCount = style.sceneCounts[durationMs];
  const scenes = buildScenes(
    evenSplit(durationMs, sceneCount),
    style.transitionType,
    style.transitionDurationMs,
    style.effects,
    style.overlay
  );

  return {
    id: `${style.styleId}-${aspectRatio.replace(':', 'x')}-${durationMs}`,
    styleId: style.styleId,
    styleName: style.styleName,
    styleDescription: style.styleDescription,
    aspectRatio,
    durationMs,
    scenes,
    fillStrategy: style.fillStrategy,
    sfxTrack: style.sfxTrack,
    defaultMusicTrack: '/audio/default-template.mp3',
    tags: [...style.tags, `${durationMs / 1000}s`, aspectRatio],
  };
}

const LEGACY_DURATIONS: LegacyTemplateDurationMs[] = [15000, 25000, 35000, 60000];

const LEGACY_TEMPLATE_PRESETS: TemplatePreset[] = STYLE_DEFS.flatMap((style) =>
  TEMPLATE_ASPECT_RATIOS.flatMap((ar) =>
    LEGACY_DURATIONS.map((dur) => buildPreset(style, ar, dur))
  )
);

const NEW_TEMPLATE_COUNTS: Record<Extract<TemplateDurationMs, 15000 | 18000 | 25000 | 35000 | 42000 | 50000>, number> = {
  15000: 10,
  18000: 10,
  25000: 10,
  35000: 8,
  42000: 7,
  50000: 5,
};

const NEW_TEMPLATE_NAMES = [
  'Neon Boom','Street Zoom','Retro Flash','Beat Pulse','Vibe Shift','Urban Drop','Quick Spark','Night Drive','Glow Rush','Skyline Pop',
  'Pulse Drift','Color Dash','Electric Cut','Dream Motion','Flash Orbit','Echo Wave','Hyper Clip','Prisma Beat','Rapid Mood','Frame Storm',
  'City Lights','Bloom Jump','Tape Remix','Meta Flow','Glass Beat','Turbo Swipe','Wave Focus','Lunar Glide','Snap Motion','Fresh Vibes',
  'Aura Sprint','Silk Cuts','Solar Hype','Violet Groove','Comet Jump','Luma Beat','Flash Story','Tempo Ride','Nova Speed','Trend Scene',
  'Boom Sequence','Sharp Vibe','Mirror Pulse','Bold Drift','Prime Motion','Beat Cascade','Star Cut','Neon Drift','Vision Pop','Dynamic Reel',
];

const DEFAULT_MUSIC_TRACKS = ['/audio/track-a.mp3', '/audio/track-b.mp3', '/audio/track-c.mp3'];

const NEW_TEMPLATE_PRESETS: TemplatePreset[] = (Object.entries(NEW_TEMPLATE_COUNTS) as Array<[`${Extract<TemplateDurationMs, 15000 | 18000 | 25000 | 35000 | 42000 | 50000>}`, number]>).flatMap(
  ([durationKey, count], durationIndex) => {
    const durationMs = Number(durationKey) as Extract<TemplateDurationMs, 15000 | 18000 | 25000 | 35000 | 42000 | 50000>;
    return Array.from({ length: count }, (_, i) => {
      const globalIndex = Object.entries(NEW_TEMPLATE_COUNTS)
        .slice(0, durationIndex)
        .reduce((sum, [, c]) => sum + c, 0) + i;
      const style = STYLE_DEFS[globalIndex % STYLE_DEFS.length];
      const aspectRatio: TemplateAspectRatio = globalIndex % 2 === 0 ? '9:16' : '16:9';
      const sceneCount = Math.min(40, Math.max(10, Math.round(durationMs / 900) + (globalIndex % 6)));
      const sceneDurations = buildFastSceneDurations(durationMs, sceneCount, globalIndex + 1);

      return {
        id: `peracut-new-${durationMs}-${globalIndex + 1}`,
        styleId: style.styleId,
        styleName: NEW_TEMPLATE_NAMES[globalIndex],
        styleDescription: `Plantilla rápida PeraCut de ${durationMs / 1000}s con cortes dinámicos.`,
        aspectRatio,
        durationMs,
        scenes: buildScenes(
          sceneDurations,
          style.transitionType,
          Math.max(60, Math.min(300, style.transitionDurationMs)),
          style.effects,
          style.overlay,
        ),
        fillStrategy: 'loop',
        sfxTrack: style.sfxTrack,
        defaultMusicTrack: DEFAULT_MUSIC_TRACKS[globalIndex % DEFAULT_MUSIC_TRACKS.length],
        tags: [...style.tags, `${durationMs / 1000}s`, aspectRatio, 'new', 'peracut'],
        isNew: true,
      };
    });
  }
);

export const ALL_TEMPLATE_PRESETS: TemplatePreset[] = [...LEGACY_TEMPLATE_PRESETS, ...NEW_TEMPLATE_PRESETS];

export function getTemplatesByAspectRatio(ar: TemplateAspectRatio): TemplatePreset[] {
  return ALL_TEMPLATE_PRESETS.filter((t) => t.aspectRatio === ar);
}

export function getTemplatesByDuration(ms: number): TemplatePreset[] {
  return ALL_TEMPLATE_PRESETS.filter((t) => t.durationMs === ms);
}

export function getTemplateById(id: string): TemplatePreset | undefined {
  return ALL_TEMPLATE_PRESETS.find((t) => t.id === id);
}

export function applyTemplateToMedia(template: TemplatePreset): TemplatePreset {
  return {
    ...template,
    scenes: template.scenes.map((s) => ({ ...s })),
  };
}
