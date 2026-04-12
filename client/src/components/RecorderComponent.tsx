import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Video, Square, Play, Pause, RotateCcw, Download } from 'lucide-react';

export interface RecorderComponentProps {
  open: boolean;
  onClose: () => void;
  onSave: (blob: Blob, type: 'audio' | 'video') => void;
  maxDuration?: number; // en segundos
}

export function RecorderComponent({
  open,
  onClose,
  onSave,
  maxDuration = 300, // 5 minutos por defecto
}: RecorderComponentProps) {
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Iniciar grabación
  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: recordingType === 'video' ? { width: 1280, height: 720 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      // Mostrar preview de video
      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Crear MediaRecorder
      const mimeType = recordingType === 'video'
        ? 'video/webm;codecs=vp9,opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedChunks([]);
      setPreviewUrl(null);
      setDuration(0);
      startTimeRef.current = Date.now();

      // Iniciar contador de duración
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Detener si se alcanza la duración máxima
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      alert('No se pudo acceder a la cámara o micrófono');
    }
  };

  // Pausar grabación
  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  // Reanudar grabación
  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - duration * 1000;
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Detener stream
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Cancelar grabación
  const cancelRecording = () => {
    stopRecording();
    setRecordedChunks([]);
    setPreviewUrl(null);
    setDuration(0);
  };

  // Guardar grabación
  const saveRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: recordingType === 'video' ? 'video/webm' : 'audio/webm',
      });
      onSave(blob, recordingType);
      onClose();
    }
  };

  // Formatear duración
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Limpiar al cerrar
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [mediaStream]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Grabar Video o Audio</DialogTitle>
        </DialogHeader>

        <Tabs value={recordingType} onValueChange={(v) => setRecordingType(v as 'audio' | 'video')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-2">
              <Mic className="h-4 w-4" />
              Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4">
            {!previewUrl ? (
              <div className="space-y-4">
                {/* Preview de video en vivo */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-black"
                  style={{ aspectRatio: '16/9' }}
                />

                {/* Controles */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                    <span className="text-lg font-mono">{formatDuration(duration)}</span>
                    <span className="text-sm text-muted-foreground">
                      Máximo: {formatDuration(maxDuration)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="flex-1 gap-2"
                        size="lg"
                      >
                        <Mic className="h-4 w-4" />
                        Iniciar Grabación
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={isPaused ? resumeRecording : pauseRecording}
                          variant="outline"
                          className="gap-2"
                          size="lg"
                        >
                          {isPaused ? (
                            <>
                              <Play className="h-4 w-4" />
                              Reanudar
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4" />
                              Pausar
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          className="flex-1 gap-2"
                          size="lg"
                        >
                          <Square className="h-4 w-4" />
                          Detener
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview de grabación */}
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg bg-black"
                  style={{ aspectRatio: '16/9' }}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={cancelRecording}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Grabar de Nuevo
                  </Button>
                  <Button
                    onClick={saveRecording}
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            {!previewUrl ? (
              <div className="space-y-4">
                {/* Visualizador de audio */}
                <Card className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Mic className="mx-auto h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {isRecording ? 'Grabando...' : 'Listo para grabar'}
                    </p>
                  </div>
                </Card>

                {/* Controles */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                    <span className="text-lg font-mono">{formatDuration(duration)}</span>
                    <span className="text-sm text-muted-foreground">
                      Máximo: {formatDuration(maxDuration)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="flex-1 gap-2"
                        size="lg"
                      >
                        <Mic className="h-4 w-4" />
                        Iniciar Grabación
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={isPaused ? resumeRecording : pauseRecording}
                          variant="outline"
                          className="gap-2"
                          size="lg"
                        >
                          {isPaused ? (
                            <>
                              <Play className="h-4 w-4" />
                              Reanudar
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4" />
                              Pausar
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          className="flex-1 gap-2"
                          size="lg"
                        >
                          <Square className="h-4 w-4" />
                          Detener
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview de audio */}
                <audio
                  src={previewUrl}
                  controls
                  className="w-full"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={cancelRecording}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Grabar de Nuevo
                  </Button>
                  <Button
                    onClick={saveRecording}
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
