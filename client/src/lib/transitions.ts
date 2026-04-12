/**
 * Tipos de transiciones disponibles
 */
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'wipeLeft' | 'wipeRight' | 'none';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // Duración en milisegundos
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

/**
 * Generar filtro FFmpeg para transición de fundido (fade)
 */
export function generateFadeTransition(
  inputIndex1: number,
  inputIndex2: number,
  duration: number,
  totalDuration: number
): string {
  const fadeDuration = duration / 1000;
  const startTime = (totalDuration - fadeDuration) / 1000;

  return `[${inputIndex1}]format=yuv420p,scale=1280:720[v1];[${inputIndex2}]format=yuv420p,scale=1280:720[v2];[v1][v2]xfade=transition=fade:duration=${fadeDuration}:offset=${startTime}[out]`;
}

/**
 * Generar filtro FFmpeg para transición de barrido (slide)
 */
export function generateSlideTransition(
  inputIndex1: number,
  inputIndex2: number,
  duration: number,
  totalDuration: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'left'
): string {
  const fadeDuration = duration / 1000;
  const startTime = (totalDuration - fadeDuration) / 1000;

  const transitionMap: Record<string, string> = {
    left: 'slideleft',
    right: 'slideright',
    up: 'slideup',
    down: 'slidedown',
  };

  const transition = transitionMap[direction] || 'slideleft';

  return `[${inputIndex1}]format=yuv420p,scale=1280:720[v1];[${inputIndex2}]format=yuv420p,scale=1280:720[v2];[v1][v2]xfade=transition=${transition}:duration=${fadeDuration}:offset=${startTime}[out]`;
}

/**
 * Generar filtro FFmpeg para transición de zoom
 */
export function generateZoomTransition(
  inputIndex1: number,
  inputIndex2: number,
  duration: number,
  totalDuration: number,
  direction: 'in' | 'out' = 'in'
): string {
  const fadeDuration = duration / 1000;
  const startTime = (totalDuration - fadeDuration) / 1000;

  const transition = direction === 'in' ? 'zoomin' : 'zoomout';

  return `[${inputIndex1}]format=yuv420p,scale=1280:720[v1];[${inputIndex2}]format=yuv420p,scale=1280:720[v2];[v1][v2]xfade=transition=${transition}:duration=${fadeDuration}:offset=${startTime}[out]`;
}

/**
 * Generar filtro FFmpeg para transición de barrido circular (wipe)
 */
export function generateWipeTransition(
  inputIndex1: number,
  inputIndex2: number,
  duration: number,
  totalDuration: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'left'
): string {
  const fadeDuration = duration / 1000;
  const startTime = (totalDuration - fadeDuration) / 1000;

  const transitionMap: Record<string, string> = {
    left: 'wipeleft',
    right: 'wiperight',
    up: 'wipeup',
    down: 'wipedown',
  };

  const transition = transitionMap[direction] || 'wipeleft';

  return `[${inputIndex1}]format=yuv420p,scale=1280:720[v1];[${inputIndex2}]format=yuv420p,scale=1280:720[v2];[v1][v2]xfade=transition=${transition}:duration=${fadeDuration}:offset=${startTime}[out]`;
}

/**
 * Generar filtro FFmpeg para transición de rotación
 */
export function generateRotateTransition(
  inputIndex1: number,
  inputIndex2: number,
  duration: number,
  totalDuration: number
): string {
  const fadeDuration = duration / 1000;
  const startTime = (totalDuration - fadeDuration) / 1000;

  return `[${inputIndex1}]format=yuv420p,scale=1280:720[v1];[${inputIndex2}]format=yuv420p,scale=1280:720[v2];[v1][v2]xfade=transition=circleopen:duration=${fadeDuration}:offset=${startTime}[out]`;
}

/**
 * Generar filtro FFmpeg para transición de cortinilla
 */
export function generateCurtainTransition(
  inputIndex1: number,
  inputIndex2: number,
  duration: number,
  totalDuration: number
): string {
  const fadeDuration = duration / 1000;
  const startTime = (totalDuration - fadeDuration) / 1000;

  return `[${inputIndex1}]format=yuv420p,scale=1280:720[v1];[${inputIndex2}]format=yuv420p,scale=1280:720[v2];[v1][v2]xfade=transition=horzopen:duration=${fadeDuration}:offset=${startTime}[out]`;
}

/**
 * Obtener función generadora de transición basada en tipo
 */
export function getTransitionGenerator(
  type: TransitionType,
  direction?: string
): (
  i1: number,
  i2: number,
  d: number,
  td: number
) => string {
  switch (type) {
    case 'fade':
      return generateFadeTransition;
    case 'slide':
      return (i1, i2, d, td) =>
        generateSlideTransition(i1, i2, d, td, (direction as 'left' | 'right' | 'up' | 'down') || 'left');
    case 'zoom':
      return (i1, i2, d, td) =>
        generateZoomTransition(i1, i2, d, td, (direction as 'in' | 'out') || 'in');
    case 'wipeLeft':
      return (i1, i2, d, td) => generateWipeTransition(i1, i2, d, td, 'left');
    case 'wipeRight':
      return (i1, i2, d, td) => generateWipeTransition(i1, i2, d, td, 'right');
    case 'none':
    default:
      return (i1, i2, d, td) =>
        `[${i1}]format=yuv420p,scale=1280:720[v1];[${i2}]format=yuv420p,scale=1280:720[v2];[v1][v2]concat=n=2:v=1:a=0[out]`;
  }
}

/**
 * Descripción amigable de transiciones
 */
export const TRANSITION_DESCRIPTIONS: Record<TransitionType, string> = {
  fade: 'Fundido suave entre escenas',
  slide: 'Barrido lateral de una escena a otra',
  zoom: 'Zoom de entrada o salida',
  wipeLeft: 'Cortinilla de izquierda a derecha',
  wipeRight: 'Cortinilla de derecha a izquierda',
  none: 'Sin transición (corte directo)',
};

/**
 * Duración recomendada para transiciones (en ms)
 */
export const RECOMMENDED_TRANSITION_DURATION = 500; // 500ms = 0.5 segundos

/**
 * Validar configuración de transición
 */
export function validateTransitionConfig(config: TransitionConfig): boolean {
  if (!config.type || !['fade', 'slide', 'zoom', 'wipeLeft', 'wipeRight', 'none'].includes(config.type)) {
    return false;
  }

  if (config.duration < 100 || config.duration > 2000) {
    return false;
  }

  return true;
}
