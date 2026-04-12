/**
 * Sistema de cámara lenta (slow motion) para videos
 * Permite ajustar la velocidad de reproducción de 0.25x a 2x
 */

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface SlowMotionConfig {
  enabled: boolean;
  speed: PlaybackSpeed;
  startTime: number; // en ms
  endTime: number; // en ms
}

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SPEED_LABELS: Record<PlaybackSpeed, string> = {
  0.25: '4x Lento',
  0.5: '2x Lento',
  0.75: '1.33x Lento',
  1: 'Normal',
  1.25: '1.25x Rápido',
  1.5: '1.5x Rápido',
  1.75: '1.75x Rápido',
  2: '2x Rápido',
};

/**
 * Calcula la duración de un video con velocidad ajustada
 */
export function calculateAdjustedDuration(
  originalDuration: number,
  speed: PlaybackSpeed
): number {
  return Math.round(originalDuration / speed);
}

/**
 * Calcula el tiempo ajustado para una posición en el video
 */
export function calculateAdjustedTime(
  originalTime: number,
  speed: PlaybackSpeed
): number {
  return Math.round(originalTime * speed);
}

/**
 * Genera filtro FFmpeg para slow motion
 */
export function generateSlowMotionFilter(speed: PlaybackSpeed): string {
  if (speed === 1) {
    return ''; // Sin cambio de velocidad
  }

  // setpts cambia la velocidad del video
  // audio también necesita ser ajustado
  const videoPts = `setpts=PTS/${speed}`;
  const audioPts = `asetpts=PTS/${speed}`;

  return `${videoPts},${audioPts}`;
}

/**
 * Valida configuración de slow motion
 */
export function validateSlowMotionConfig(config: SlowMotionConfig): boolean {
  if (!PLAYBACK_SPEEDS.includes(config.speed)) {
    return false;
  }

  if (config.startTime < 0 || config.endTime < 0) {
    return false;
  }

  if (config.startTime >= config.endTime) {
    return false;
  }

  return true;
}

/**
 * Crea configuración de slow motion por defecto
 */
export function createDefaultSlowMotionConfig(
  videoDuration: number
): SlowMotionConfig {
  return {
    enabled: false,
    speed: 1,
    startTime: 0,
    endTime: videoDuration,
  };
}

/**
 * Obtiene la etiqueta de velocidad
 */
export function getSpeedLabel(speed: PlaybackSpeed): string {
  return SPEED_LABELS[speed] || 'Normal';
}

/**
 * Calcula el factor de cambio de duración
 */
export function getDurationFactor(speed: PlaybackSpeed): number {
  return 1 / speed;
}

/**
 * Valida si una velocidad es válida
 */
export function isValidSpeed(speed: number): speed is PlaybackSpeed {
  return PLAYBACK_SPEEDS.includes(speed as PlaybackSpeed);
}

/**
 * Obtiene la velocidad más cercana a un valor
 */
export function getNearestSpeed(value: number): PlaybackSpeed {
  return PLAYBACK_SPEEDS.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

/**
 * Calcula el tiempo total del video con slow motion aplicado
 */
export function calculateTotalDurationWithSlowMotion(
  scenes: Array<{ duration: number }>,
  slowMotionConfigs: Record<string, SlowMotionConfig>
): number {
  return scenes.reduce((total, scene, index) => {
    const config = slowMotionConfigs[index];
    if (config?.enabled) {
      return total + calculateAdjustedDuration(scene.duration, config.speed);
    }
    return total + scene.duration;
  }, 0);
}

/**
 * Aplica slow motion a múltiples escenas
 */
export function applySlowMotionToScenes(
  scenes: Array<{ id: string; duration: number }>,
  slowMotionConfigs: Record<string, SlowMotionConfig>
): Array<{ id: string; duration: number; speed: PlaybackSpeed }> {
  return scenes.map((scene, index) => {
    const config = slowMotionConfigs[index];
    const speed = config?.enabled ? config.speed : 1;
    return {
      ...scene,
      duration: calculateAdjustedDuration(scene.duration, speed),
      speed,
    };
  });
}
