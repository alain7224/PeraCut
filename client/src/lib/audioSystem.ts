/**
 * Sistema de audio para videos
 * Gestiona múltiples pistas de audio, volumen, sincronización
 */

export type AudioTrackType = 'background' | 'effect' | 'voiceover';

export interface AudioTrack {
  id: string;
  name: string;
  type: AudioTrackType;
  url: string;
  duration: number; // en ms
  volume: number; // 0-100
  startTime: number; // en ms
  fadeIn: number; // en ms
  fadeOut: number; // en ms
  syncPoint?: number; // punto de sincronización con transición
}

export interface AudioMix {
  id: string;
  projectId: string;
  tracks: AudioTrack[];
  masterVolume: number; // 0-100
}

export interface SyncPoint {
  transitionIndex: number;
  audioTrackId: string;
  audioTime: number; // en ms
  videoTime: number; // en ms
}

/**
 * Crea una pista de audio por defecto
 */
export function createDefaultAudioTrack(
  id: string,
  name: string,
  url: string,
  duration: number,
  type: AudioTrackType = 'background'
): AudioTrack {
  return {
    id,
    name,
    type,
    url,
    duration,
    volume: 100,
    startTime: 0,
    fadeIn: 0,
    fadeOut: 0,
  };
}

/**
 * Calcula el volumen con fade in/out
 */
export function calculateVolumeWithFade(
  baseVolume: number,
  currentTime: number,
  fadeIn: number,
  fadeOut: number,
  totalDuration: number
): number {
  let volume = baseVolume;

  // Aplicar fade in
  if (currentTime < fadeIn && fadeIn > 0) {
    volume = (currentTime / fadeIn) * baseVolume;
  }

  // Aplicar fade out
  const fadeOutStart = totalDuration - fadeOut;
  if (currentTime > fadeOutStart && fadeOut > 0) {
    const fadeOutProgress = (currentTime - fadeOutStart) / fadeOut;
    volume = (1 - fadeOutProgress) * baseVolume;
  }

  return Math.max(0, Math.min(100, volume));
}

/**
 * Genera filtro FFmpeg para audio
 */
export function generateAudioFFmpegFilter(tracks: AudioTrack[]): string {
  if (tracks.length === 0) return '';

  const filters: string[] = [];

  // Crear inputs para cada pista
  tracks.forEach((track, index) => {
    // Ajustar volumen
    const volumeFactor = track.volume / 100;
    filters.push(`[${index}]volume=${volumeFactor}[a${index}]`);
  });

  // Mezclar todas las pistas
  const inputRefs = tracks.map((_, i) => `[a${i}]`).join('');
  filters.push(`${inputRefs}amix=inputs=${tracks.length}:duration=longest[out]`);

  return filters.join(';');
}

/**
 * Valida configuración de pista de audio
 */
export function validateAudioTrack(track: AudioTrack): boolean {
  if (!track.id || !track.name || !track.url) {
    return false;
  }

  if (track.volume < 0 || track.volume > 100) {
    return false;
  }

  if (track.startTime < 0 || track.duration < 0) {
    return false;
  }

  if (track.fadeIn < 0 || track.fadeOut < 0) {
    return false;
  }

  if (track.fadeIn + track.fadeOut > track.duration) {
    return false;
  }

  return true;
}

/**
 * Obtiene la duración total de todas las pistas
 */
export function getTotalAudioDuration(tracks: AudioTrack[]): number {
  if (tracks.length === 0) return 0;

  return Math.max(
    ...tracks.map((track) => track.startTime + track.duration)
  );
}

/**
 * Sincroniza pistas de audio con transiciones
 */
export function syncAudioWithTransitions(
  tracks: AudioTrack[],
  transitionPoints: number[], // tiempos de transiciones en ms
  videoDuration: number
): SyncPoint[] {
  const syncPoints: SyncPoint[] = [];

  transitionPoints.forEach((transitionTime, index) => {
    // Encontrar la pista de audio más importante (background)
    const backgroundTrack = tracks.find((t) => t.type === 'background');

    if (backgroundTrack) {
      // Calcular el punto de sincronización proporcional
      const audioSyncTime = (transitionTime / videoDuration) * backgroundTrack.duration;

      syncPoints.push({
        transitionIndex: index,
        audioTrackId: backgroundTrack.id,
        audioTime: audioSyncTime,
        videoTime: transitionTime,
      });
    }
  });

  return syncPoints;
}

/**
 * Crea una mezcla de audio por defecto
 */
export function createDefaultAudioMix(projectId: string): AudioMix {
  return {
    id: `mix-${Date.now()}`,
    projectId,
    tracks: [],
    masterVolume: 100,
  };
}

/**
 * Obtiene la pista de audio por tipo
 */
export function getAudioTracksByType(
  tracks: AudioTrack[],
  type: AudioTrackType
): AudioTrack[] {
  return tracks.filter((track) => track.type === type);
}

/**
 * Calcula el tiempo de reproducción ajustado
 */
export function calculateAdjustedPlaybackTime(
  currentTime: number,
  tracks: AudioTrack[]
): number {
  // Encontrar la pista más larga
  const longestTrack = tracks.reduce((prev, curr) =>
    prev.duration > curr.duration ? prev : curr
  );

  return Math.min(currentTime, longestTrack.duration);
}

/**
 * Valida que el audio encaje en la duración del video
 */
export function validateAudioFitsInVideo(
  tracks: AudioTrack[],
  videoDuration: number
): boolean {
  const totalAudioDuration = getTotalAudioDuration(tracks);
  return totalAudioDuration <= videoDuration;
}

/**
 * Obtiene información de compatibilidad de audio
 */
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg', // MP3
  'audio/wav', // WAV
  'audio/aac', // AAC
  'audio/ogg', // OGG
  'audio/webm', // WebM
  'audio/flac', // FLAC
];

export const AUDIO_FORMAT_EXTENSIONS = {
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/aac': '.aac',
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
  'audio/flac': '.flac',
};

/**
 * Valida formato de audio
 */
export function isValidAudioFormat(mimeType: string): boolean {
  return SUPPORTED_AUDIO_FORMATS.includes(mimeType);
}

/**
 * Obtiene la extensión de archivo de audio
 */
export function getAudioExtension(mimeType: string): string {
  return AUDIO_FORMAT_EXTENSIONS[mimeType as keyof typeof AUDIO_FORMAT_EXTENSIONS] || '.mp3';
}
