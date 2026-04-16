export const TEMPLATE_DURATIONS = [15000, 18000, 25000, 35000, 42000, 50000, 60000] as const;
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
  defaultMusicTrack?: string;
  tags: string[];
  isNew?: boolean;
}

interface StyleDefinition {
  styleId: StyleId;
  styleName: string;
  styleDescription: string;
  fillStrategy: TemplatePreset['fillStrategy'];
  transitionType: string;
  transitionDurationMs: number;
  effects: string[];
  overlay?: TemplatePresetScene['overlay'];
  sfxTrack?: string;
}

const STYLE_DEFINITIONS: StyleDefinition[] = [
  {
    styleId: 'cutout',
    styleName: 'Cutout',
    styleDescription: 'Blanco y negro con bordes y grano cinematográfico.',
    fillStrategy: 'freeze',
    transitionType: 'cut',
    transitionDurationMs: 0,
    effects: ['blackwhite', 'grain', 'whiteBorder'],
    overlay: { type: 'color', value: 'rgba(255,255,255,0.08)' },
    sfxTrack: '/sfx/clap.wav',
  },
  {
    styleId: 'split',
    styleName: 'Split Screen',
    styleDescription: 'Pantalla dividida con cortes de ritmo rápido.',
    fillStrategy: 'loop',
    transitionType: 'slideLeft',
    transitionDurationMs: 180,
    effects: ['splitScreen', 'colorBars'],
    sfxTrack: '/sfx/whoosh.wav',
  },
  {
    styleId: 'flash',
    styleName: 'Flash Cuts',
    styleDescription: 'Destellos blancos y mucha energía.',
    fillStrategy: 'stretch',
    transitionType: 'flashWhite',
    transitionDurationMs: 80,
    effects: ['flashOverlay', 'highContrast'],
    overlay: { type: 'color', value: 'rgba(255,255,255,0.15)' },
    sfxTrack: '/sfx/beep.wav',
  },
  {
    styleId: 'glitch',
    styleName: 'Glitch',
    styleDescription: 'Ruido digital y efecto tech.',
    fillStrategy: 'loop',
    transitionType: 'glitch',
    transitionDurationMs: 150,
    effects: ['digitalNoise', 'rgbShift', 'scanLines'],
    sfxTrack: '/sfx/beep.wav',
  },
  {
    styleId: 'bars',
    styleName: 'Letterbox',
    styleDescription: 'Barras de cine y look de película.',
    fillStrategy: 'freeze',
    transitionType: 'fade',
    transitionDurationMs: 350,
    effects: ['letterboxBars', 'filmGrain', 'colorGrade'],
    sfxTrack: '/sfx/riser.wav',
  },
  {
    styleId: 'zoom',
    styleName: 'Progressive Zoom',
    styleDescription: 'Zoom progresivo escena a escena.',
    fillStrategy: 'stretch',
    transitionType: 'zoom',
    transitionDurationMs: 260,
    effects: ['progressiveZoom', 'vignette'],
    sfxTrack: '/sfx/whoosh.wav',
  },
];

const DEFAULT_MUSIC_TRACKS = ['/audio/track-a.mp3', '/audio/track-b.mp3', '/audio/track-c.mp3'];

function buildSceneDurations(totalMs: number, sceneCount: number): number[] {
  const base = Math.floor(totalMs / sceneCount);
  const remainder = totalMs - base * sceneCount;
  return Array.from({ length: sceneCount }, (_, index) => (index === sceneCount - 1 ? base + remainder : base));
}

function buildScenes(
  durations: number[],
  transitionType: string,
  transitionDurationMs: number,
  effects: string[],
  overlay?: TemplatePresetScene['overlay'],
): TemplatePresetScene[] {
  return durations.map((durationMs, index) => ({
    index,
    durationMs,
    mediaSlot: 'placeholder' as const,
    transition: { type: transitionType, durationMs: transitionDurationMs },
    effects: [...effects],
    ...(overlay ? { overlay } : {}),
  }));
}

function buildTemplate(
  style: StyleDefinition,
  aspectRatio: TemplateAspectRatio,
  durationMs: TemplateDurationMs,
): TemplatePreset {
  const sceneCount = Math.max(3, Math.min(12, Math.round(durationMs / 5000)));
  const scenes = buildScenes(
    buildSceneDurations(durationMs, sceneCount),
    style.transitionType,
    style.transitionDurationMs,
    style.effects,
    style.overlay,
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
    defaultMusicTrack: DEFAULT_MUSIC_TRACKS[(durationMs / 1000) % DEFAULT_MUSIC_TRACKS.length],
    tags: [style.styleId, style.styleName.toLowerCase(), `${durationMs / 1000}s`, aspectRatio],
    isNew: durationMs >= 42000,
  };
}

export const ALL_TEMPLATE_PRESETS: TemplatePreset[] = STYLE_DEFINITIONS.flatMap((style) =>
  TEMPLATE_ASPECT_RATIOS.flatMap((aspectRatio) =>
    TEMPLATE_DURATIONS.map((durationMs) => buildTemplate(style, aspectRatio, durationMs)),
  ),
);

export function getTemplatesByAspectRatio(ar: TemplateAspectRatio): TemplatePreset[] {
  return ALL_TEMPLATE_PRESETS.filter((template) => template.aspectRatio === ar);
}

export function getTemplatesByDuration(ms: number): TemplatePreset[] {
  return ALL_TEMPLATE_PRESETS.filter((template) => template.durationMs === ms);
}

export function getTemplateById(id: string): TemplatePreset | undefined {
  return ALL_TEMPLATE_PRESETS.find((template) => template.id === id);
}

export function applyTemplateToMedia(template: TemplatePreset): TemplatePreset {
  return {
    ...template,
    scenes: template.scenes.map((scene) => ({ ...scene })),
  };
}
