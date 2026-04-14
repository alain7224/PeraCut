export const TEMPLATE_DURATIONS = [15000, 25000, 35000, 60000] as const;
export type TemplateDurationMs = (typeof TEMPLATE_DURATIONS)[number];

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
  tags: string[];
}

// ─── scene builders ──────────────────────────────────────────────────────────

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

/** Distribute totalMs evenly into n scenes. The last scene absorbs any rounding remainder. */
function evenSplit(totalMs: number, n: number): number[] {
  const base = Math.floor(totalMs / n);
  const rem = totalMs - base * n;
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? base + rem : base));
}

// ─── style definitions ───────────────────────────────────────────────────────

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
  sceneCounts: Record<TemplateDurationMs, number>;
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

// ─── preset factory ───────────────────────────────────────────────────────────

function buildPreset(
  style: StyleDef,
  aspectRatio: TemplateAspectRatio,
  durationMs: TemplateDurationMs
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
    tags: [...style.tags, `${durationMs / 1000}s`, aspectRatio],
  };
}

// ─── ALL_TEMPLATE_PRESETS (6 styles × 2 ratios × 4 durations = 48) ───────────

export const ALL_TEMPLATE_PRESETS: TemplatePreset[] = STYLE_DEFS.flatMap((style) =>
  TEMPLATE_ASPECT_RATIOS.flatMap((ar) =>
    TEMPLATE_DURATIONS.map((dur) => buildPreset(style, ar, dur))
  )
);

// ─── helpers ─────────────────────────────────────────────────────────────────

export function getTemplatesByAspectRatio(ar: TemplateAspectRatio): TemplatePreset[] {
  return ALL_TEMPLATE_PRESETS.filter((t) => t.aspectRatio === ar);
}

export function getTemplatesByDuration(ms: number): TemplatePreset[] {
  return ALL_TEMPLATE_PRESETS.filter((t) => t.durationMs === ms);
}

export function getTemplateById(id: string): TemplatePreset | undefined {
  return ALL_TEMPLATE_PRESETS.find((t) => t.id === id);
}

/**
 * Applies a template to incoming media while preserving the template timeline.
 * `mediaDurationMs` can influence how content is filled internally, but scene
 * slots must keep the template's fixed duration budget.
 */
export function applyTemplateToMedia(
  template: TemplatePreset,
  _mediaDurationMs: number
): TemplatePreset {
  return {
    ...template,
    scenes: template.scenes.map((s) => ({ ...s })),
  };
}
