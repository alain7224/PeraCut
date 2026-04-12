/**
 * Sistema de efectos avanzados para fotos y videos
 * Incluye blur, sharpen, vignette, grain, motion blur, chromatic aberration, glitch
 */

export type EffectType = 
  | 'blur' 
  | 'sharpen' 
  | 'vignette' 
  | 'grain' 
  | 'motionBlur' 
  | 'chromaticAberration' 
  | 'glitch'
  | 'sepia'
  | 'vintage'
  | 'noir'
  | 'cool'
  | 'warm';

export interface EffectConfig {
  type: EffectType;
  intensity: number; // 0-100
  enabled: boolean;
}

export interface EffectSettings {
  [key: string]: EffectConfig;
}

// Descripciones de efectos
export const EFFECT_DESCRIPTIONS: Record<EffectType, string> = {
  blur: 'Desenfoque suave',
  sharpen: 'Nitidez aumentada',
  vignette: 'Viñeta oscura en bordes',
  grain: 'Grano de película',
  motionBlur: 'Desenfoque de movimiento',
  chromaticAberration: 'Aberración cromática',
  glitch: 'Efecto glitch digital',
  sepia: 'Tono sepia clásico',
  vintage: 'Efecto vintage retro',
  noir: 'Blanco y negro dramático',
  cool: 'Tonos fríos azulados',
  warm: 'Tonos cálidos dorados',
};

// Valores por defecto de intensidad
export const DEFAULT_EFFECT_INTENSITY: Record<EffectType, number> = {
  blur: 5,
  sharpen: 30,
  vignette: 40,
  grain: 20,
  motionBlur: 25,
  chromaticAberration: 15,
  glitch: 30,
  sepia: 50,
  vintage: 60,
  noir: 80,
  cool: 40,
  warm: 40,
};

/**
 * Genera filtro CSS para efecto blur
 */
export function generateBlurFilter(intensity: number): string {
  const blurValue = (intensity / 100) * 20; // Máximo 20px
  return `blur(${blurValue}px)`;
}

/**
 * Genera filtro CSS para efecto sharpen (usando contraste)
 */
export function generateSharpenFilter(intensity: number): string {
  const contrast = 100 + (intensity / 100) * 50; // 100-150%
  return `contrast(${contrast}%)`;
}

/**
 * Genera filtro CSS para efecto vignette
 */
export function generateVignetteFilter(intensity: number): string {
  const opacity = (intensity / 100) * 0.8;
  return `drop-shadow(0 0 ${intensity / 5}px rgba(0, 0, 0, ${opacity}))`;
}

/**
 * Genera filtro CSS para efecto grain (usando saturación y contraste)
 */
export function generateGrainFilter(intensity: number): string {
  const saturation = 100 - (intensity / 100) * 20;
  const contrast = 100 + (intensity / 100) * 10;
  return `saturate(${saturation}%) contrast(${contrast}%)`;
}

/**
 * Genera filtro CSS para efecto sepia
 */
export function generateSepiaFilter(intensity: number): string {
  const sepiaValue = (intensity / 100) * 1; // 0-1
  return `sepia(${sepiaValue})`;
}

/**
 * Genera filtro CSS para efecto vintage
 */
export function generateVintageFilter(intensity: number): string {
  const factor = intensity / 100;
  const saturation = 100 - factor * 30;
  const hueRotate = factor * 15;
  const contrast = 100 + factor * 20;
  return `saturate(${saturation}%) hue-rotate(${hueRotate}deg) contrast(${contrast}%)`;
}

/**
 * Genera filtro CSS para efecto noir (B&N con contraste)
 */
export function generateNoirFilter(intensity: number): string {
  const factor = intensity / 100;
  const grayscale = factor * 1;
  const contrast = 100 + factor * 40;
  return `grayscale(${grayscale}) contrast(${contrast}%)`;
}

/**
 * Genera filtro CSS para tonos fríos
 */
export function generateCoolFilter(intensity: number): string {
  const factor = intensity / 100;
  const hueRotate = factor * -30;
  const saturation = 100 + factor * 20;
  return `hue-rotate(${hueRotate}deg) saturate(${saturation}%)`;
}

/**
 * Genera filtro CSS para tonos cálidos
 */
export function generateWarmFilter(intensity: number): string {
  const factor = intensity / 100;
  const hueRotate = factor * 30;
  const saturation = 100 + factor * 15;
  return `hue-rotate(${hueRotate}deg) saturate(${saturation}%)`;
}

/**
 * Genera filtro CSS para aberración cromática
 */
export function generateChromaticAberrationFilter(intensity: number): string {
  const offset = (intensity / 100) * 4;
  return `drop-shadow(${offset}px 0 0 rgba(255, 0, 0, 0.5)) drop-shadow(-${offset}px 0 0 rgba(0, 0, 255, 0.5))`;
}

/**
 * Genera filtro CSS para efecto glitch
 */
export function generateGlitchFilter(intensity: number): string {
  const factor = intensity / 100;
  const skew = factor * 5;
  return `skew(${skew}deg)`;
}

/**
 * Obtiene el generador de filtro para un tipo de efecto
 */
export function getEffectGenerator(type: EffectType): (intensity: number) => string {
  const generators: Record<EffectType, (intensity: number) => string> = {
    blur: generateBlurFilter,
    sharpen: generateSharpenFilter,
    vignette: generateVignetteFilter,
    grain: generateGrainFilter,
    motionBlur: generateGrainFilter, // Similar a grain
    chromaticAberration: generateChromaticAberrationFilter,
    glitch: generateGlitchFilter,
    sepia: generateSepiaFilter,
    vintage: generateVintageFilter,
    noir: generateNoirFilter,
    cool: generateCoolFilter,
    warm: generateWarmFilter,
  };

  return generators[type] || generateBlurFilter;
}

/**
 * Aplica múltiples efectos a un canvas
 */
export function applyEffectsToCanvas(
  canvas: HTMLCanvasElement,
  effects: EffectSettings
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Aplicar efectos como filtros CSS al canvas
  const filterArray: string[] = [];

  Object.values(effects).forEach((effect) => {
    if (effect.enabled && effect.intensity > 0) {
      const generator = getEffectGenerator(effect.type);
      const filter = generator(effect.intensity);
      filterArray.push(filter);
    }
  });

  canvas.style.filter = filterArray.join(' ');
}

/**
 * Genera filtro FFmpeg para video
 */
export function generateFFmpegEffectFilter(
  effects: EffectConfig[],
  width: number,
  height: number
): string {
  const filters: string[] = [];

  effects.forEach((effect) => {
    if (!effect.enabled || effect.intensity === 0) return;

    const intensity = effect.intensity / 100;

    switch (effect.type) {
      case 'blur':
        filters.push(`boxblur=${Math.ceil(intensity * 10)}`);
        break;
      case 'sharpen':
        filters.push(`unsharp=5:5:${intensity * 2}`);
        break;
      case 'vignette':
        filters.push(`vignette=PI/${intensity * 10}`);
        break;
      case 'grain':
        filters.push(`noise=alls=${intensity * 5}`);
        break;
      case 'sepia':
        filters.push(`colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`);
        break;
      case 'noir':
        filters.push(`format=gray`);
        break;
      case 'cool':
        filters.push(`colorbalance=cb=${intensity * 50}`);
        break;
      case 'warm':
        filters.push(`colorbalance=cr=${intensity * 50}`);
        break;
    }
  });

  return filters.join(',');
}

/**
 * Valida configuración de efectos
 */
export function validateEffectConfig(config: EffectConfig): boolean {
  if (!config.type || !EFFECT_DESCRIPTIONS[config.type]) {
    return false;
  }

  if (config.intensity < 0 || config.intensity > 100) {
    return false;
  }

  return true;
}

/**
 * Crea configuración de efecto por defecto
 */
export function createDefaultEffectConfig(type: EffectType): EffectConfig {
  return {
    type,
    intensity: DEFAULT_EFFECT_INTENSITY[type],
    enabled: false,
  };
}

/**
 * Obtiene todos los efectos disponibles
 */
export function getAllEffects(): EffectType[] {
  return Object.keys(EFFECT_DESCRIPTIONS) as EffectType[];
}
