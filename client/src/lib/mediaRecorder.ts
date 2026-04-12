/**
 * Sistema de grabación de audio y video directamente desde el navegador
 */

import React from 'react';

export interface RecordingOptions {
  audio?: boolean;
  video?: boolean;
  videoConstraints?: MediaStreamConstraints['video'];
  audioConstraints?: MediaStreamConstraints['audio'];
  maxDuration?: number; // en milisegundos
  mimeType?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  chunks: Blob[];
}

export class MediaRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    chunks: [],
  };
  private startTime: number = 0;
  private pauseTime: number = 0;
  private durationInterval: NodeJS.Timeout | null = null;
  private maxDuration: number = 0;
  private onStateChange?: (state: RecordingState) => void;
  private onError?: (error: Error) => void;

  /**
   * Inicializar grabación
   */
  async startRecording(
    options: RecordingOptions = { audio: true, video: false },
    onStateChange?: (state: RecordingState) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.onStateChange = onStateChange;
      this.onError = onError;
      this.maxDuration = options.maxDuration || 0;

      // Obtener permisos de cámara/micrófono
      const constraints: MediaStreamConstraints = {
        audio: options.audio ? (options.audioConstraints || true) : false,
        video: options.video ? (options.videoConstraints || { width: 1280, height: 720 }) : false,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Determinar MIME type
      const mimeType = this.getMimeType(options.mimeType);

      // Crear MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
      });

      this.chunks = [];
      this.state.chunks = [];

      // Event listeners
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
          this.state.chunks = [...this.chunks];
        }
      };

      this.mediaRecorder.onstop = () => {
        this.stopDurationTracking();
        this.state.isRecording = false;
        this.updateState();
      };

      // Iniciar grabación
      this.mediaRecorder.start();
      this.state.isRecording = true;
      this.state.isPaused = false;
      this.state.duration = 0;
      this.startTime = Date.now();
      this.startDurationTracking();
      this.updateState();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Pausar grabación
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.state.isPaused = true;
      this.pauseTime = Date.now();
      this.stopDurationTracking();
      this.updateState();
    }
  }

  /**
   * Reanudar grabación
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.state.isPaused = false;
      // Ajustar tiempo de inicio para compensar la pausa
      this.startTime += Date.now() - this.pauseTime;
      this.startDurationTracking();
      this.updateState();
    }
  }

  /**
   * Detener grabación y obtener blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No hay grabación en progreso'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.stopDurationTracking();
        this.state.isRecording = false;
        this.updateState();

        // Crear blob
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.chunks, { type: mimeType });

        // Limpiar
        this.cleanup();

        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancelar grabación
   */
  cancelRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.cleanup();
    this.state.isRecording = false;
    this.state.isPaused = false;
    this.state.duration = 0;
    this.chunks = [];
    this.state.chunks = [];
    this.updateState();
  }

  /**
   * Obtener estado actual
   */
  getState(): RecordingState {
    return { ...this.state };
  }

  /**
   * Obtener duración en segundos
   */
  getDuration(): number {
    return Math.floor(this.state.duration / 1000);
  }

  /**
   * Obtener duración formateada (MM:SS)
   */
  getFormattedDuration(): string {
    const totalSeconds = this.getDuration();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Privado: Iniciar seguimiento de duración
   */
  private startDurationTracking(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }

    this.durationInterval = setInterval(() => {
      this.state.duration = Date.now() - this.startTime;

      // Verificar límite de duración
      if (this.maxDuration > 0 && this.state.duration >= this.maxDuration) {
        this.stopRecording();
        return;
      }

      this.updateState();
    }, 100);
  }

  /**
   * Privado: Detener seguimiento de duración
   */
  private stopDurationTracking(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  /**
   * Privado: Actualizar estado
   */
  private updateState(): void {
    this.onStateChange?.(this.getState());
  }

  /**
   * Privado: Limpiar recursos
   */
  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }

    this.stopDurationTracking();
  }

  /**
   * Privado: Obtener MIME type soportado
   */
  private getMimeType(preferred?: string): string {
    const mimeTypes = [
      preferred,
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
      'audio/webm',
      'audio/mp4',
    ].filter(Boolean);

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType as string)) {
        return mimeType as string;
      }
    }

    return 'video/webm';
  }
}

/**
 * Hook para usar MediaRecorderManager
 */
export function useMediaRecorder() {
  const recorderRef = React.useRef<MediaRecorderManager | null>(null);

  if (!recorderRef.current) {
    recorderRef.current = new MediaRecorderManager();
  }

  return recorderRef.current;
}


