import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, Play } from "lucide-react";
import { initFFmpeg, createSimpleVideo, downloadBlob, isFFmpegReady } from "@/lib/videoRenderer";
import TransitionSelector from "@/components/TransitionSelector";
import { TransitionType } from "@/lib/transitions";
import { toast } from "sonner";

interface VideoRenderDialogProps {
  scenes: Array<{
    id: string;
    imageUrl?: string;
    duration: number;
  }>;
  projectName: string;
}

export default function VideoRenderDialog({ scenes, projectName }: VideoRenderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('fade');
  const [transitionDuration, setTransitionDuration] = useState(500);

  const handleTransitionChange = (type: TransitionType, duration: number) => {
    setSelectedTransition(type);
    setTransitionDuration(duration);
  };

  const handleInitFFmpeg = async () => {
    try {
      if (!isFFmpegReady()) {
        setProgress(10);
        await initFFmpeg();
        setProgress(30);
        toast.success("FFmpeg inicializado correctamente");
      }
    } catch (error) {
      toast.error("Error inicializando FFmpeg");
      console.error(error);
    }
  };

  const handleRenderVideo = async () => {
    if (scenes.length === 0) {
      toast.error("Agrega al menos una escena para renderizar");
      return;
    }

    setIsRendering(true);
    setProgress(0);

    try {
      // Inicializar FFmpeg si no está listo
      if (!isFFmpegReady()) {
        setProgress(10);
        await initFFmpeg();
        setProgress(30);
      }

      // Descargar imágenes de escenas
      const imageBlobs: Blob[] = [];
      for (let i = 0; i < scenes.length; i++) {
        setProgress(30 + (i / scenes.length) * 30);
        
        if (scenes[i].imageUrl) {
          const response = await fetch(scenes[i].imageUrl!);
          const blob = await response.blob();
          imageBlobs.push(blob);
        }
      }

      if (imageBlobs.length === 0) {
        toast.error("No hay imágenes para renderizar");
        setIsRendering(false);
        return;
      }

      // Calcular duración por imagen (máximo 15 segundos total)
      const totalDuration = 15000; // 15 segundos en ms
      const durationPerImage = Math.floor(totalDuration / imageBlobs.length);

      setProgress(60);

      // Renderizar video
      const blob = await createSimpleVideo(imageBlobs, durationPerImage);
      setVideoBlob(blob);

      // Crear URL de preview
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      setProgress(100);
      toast.success("Video renderizado exitosamente");
    } catch (error) {
      console.error("Error renderizando video:", error);
      toast.error("Error al renderizar el video");
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadVideo = () => {
    if (videoBlob) {
      downloadBlob(videoBlob, `${projectName}-video.mp4`);
      toast.success("Video descargado");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Play className="h-4 w-4" />
          Renderizar Video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Renderizar Video MP4</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de escenas */}
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">Escenas: {scenes.length}</p>
            <p className="text-muted-foreground">
              Duración total: ~15 segundos ({Math.floor(15 / scenes.length)}s por escena)
            </p>
          </div>

          {/* Selector de transiciones */}
          <TransitionSelector
            onTransitionChange={handleTransitionChange}
            defaultType={selectedTransition}
            defaultDuration={transitionDuration}
          />

          {/* Barra de progreso */}
          {isRendering && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Renderizando...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Preview del video */}
          {previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <video
                src={previewUrl}
                controls
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end">
            {!videoBlob ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleInitFFmpeg}
                  disabled={isRendering || isFFmpegReady()}
                >
                  Inicializar FFmpeg
                </Button>
                <Button
                  onClick={handleRenderVideo}
                  disabled={isRendering || scenes.length === 0}
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Renderizando...
                    </>
                  ) : (
                    "Renderizar Video"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setVideoBlob(null)}>
                  Renderizar de Nuevo
                </Button>
                <Button onClick={handleDownloadVideo} className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar MP4
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
