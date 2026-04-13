/**
 * ExportSaveDialog — unified "Guardar" dialog.
 *
 * Offers two tabs:
 *  1. "Exportar"  — download the final rendered file (PNG/JPEG for photos, MP4 for videos).
 *  2. "Proyecto"  — save the editable project as .peracut.json, or load a previous one.
 */

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Save, FolderOpen, Image, Video } from "lucide-react";
import { toast } from "sonner";
import {
  initFFmpeg,
  createSimpleVideo,
  isFFmpegReady,
  downloadBlob,
} from "@/lib/videoRenderer";
import { downloadProject, loadProjectFromFile } from "@/lib/projectSchema";
import type { PeraCutProject } from "@/lib/projectSchema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageFormat = "png" | "jpeg";
export type ImageQuality = "high" | "medium" | "low";

export interface PhotoExportOptions {
  format: ImageFormat;
  quality: ImageQuality;
}

export interface VideoExportOptions {
  /** scenes to render — each must have an imageUrl for the current MVP */
  scenes: Array<{ id: string; imageUrl?: string; duration: number }>;
  projectName: string;
}

interface ExportSaveDialogProps {
  editorType: "photo" | "video";
  /** Required when editorType === "photo" */
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  /** Required when editorType === "photo" */
  imageFilters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    rotation: number;
    filter: string;
  };
  /** Required when editorType === "photo" */
  currentImageSrc?: string | null;
  /** Required when editorType === "video" */
  videoScenes?: Array<{ id: string; imageUrl?: string; duration: number }>;
  projectName?: string;
  /** Serialisable project state used for the "Proyecto" tab */
  project: PeraCutProject;
  onProjectLoaded?: (project: PeraCutProject) => void;
  children?: React.ReactNode;
}

// ─── Quality → JPEG quality number ───────────────────────────────────────────

function qualityToNumber(q: ImageQuality): number {
  return q === "high" ? 0.95 : q === "medium" ? 0.8 : 0.6;
}

// ─── Canvas export helper ─────────────────────────────────────────────────────

/**
 * Render the current editor image (with all CSS-style filters baked in) to a
 * fresh offscreen canvas and return a Blob.
 */
async function exportPhotoBlob(
  imageSrc: string,
  filters: NonNullable<ExportSaveDialogProps["imageFilters"]>,
  format: ImageFormat,
  quality: ImageQuality
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img") as HTMLImageElement;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Cannot get 2d context"));

      // Build filter string for the canvas context (same as CSS)
      const presetMap: Record<string, string> = {
        grayscale: "grayscale(100%)",
        sepia: "sepia(100%)",
        vintage: "sepia(50%) saturate(50%) brightness(110%)",
        cool: "hue-rotate(180deg) saturate(120%)",
        warm: "hue-rotate(10deg) saturate(130%)",
        noir: "grayscale(100%) contrast(150%)",
        none: "",
      };

      const presetFilter = presetMap[filters.filter] ?? "";
      const adjustments = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
      ctx.filter =
        presetFilter
          ? `${adjustments} ${presetFilter}`
          : adjustments;

      // Apply rotation around canvas centre
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((filters.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("toBlob returned null"));
        },
        mimeType,
        qualityToNumber(quality)
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportSaveDialog({
  editorType,
  canvasRef,
  imageFilters,
  currentImageSrc,
  videoScenes = [],
  projectName = "proyecto",
  project,
  onProjectLoaded,
  children,
}: ExportSaveDialogProps) {
  const [open, setOpen] = useState(false);

  // Photo export state
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png");
  const [imageQuality, setImageQuality] = useState<ImageQuality>("high");
  const [isExportingPhoto, setIsExportingPhoto] = useState(false);

  // Video render state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Project save/load state
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // ── Photo export ────────────────────────────────────────────────────────────

  const handlePhotoExport = async () => {
    if (!currentImageSrc || !imageFilters) {
      toast.error("No hay imagen para exportar");
      return;
    }
    setIsExportingPhoto(true);
    try {
      const blob = await exportPhotoBlob(
        currentImageSrc,
        imageFilters,
        imageFormat,
        imageQuality
      );
      const ext = imageFormat === "jpeg" ? "jpg" : "png";
      downloadBlob(blob, `${projectName}-export.${ext}`);
      toast.success(`Imagen exportada como ${imageFormat.toUpperCase()}`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Error al exportar la imagen");
    } finally {
      setIsExportingPhoto(false);
    }
  };

  // ── Video render ────────────────────────────────────────────────────────────

  const handleVideoRender = async () => {
    if (videoScenes.length === 0) {
      toast.error("Agrega al menos una escena para renderizar");
      return;
    }
    setIsRendering(true);
    setRenderProgress(0);
    setVideoBlob(null);
    setPreviewUrl(null);

    try {
      if (!isFFmpegReady()) {
        setRenderProgress(10);
        await initFFmpeg();
        setRenderProgress(30);
      }

      const imageBlobs: Blob[] = [];
      for (let i = 0; i < videoScenes.length; i++) {
        setRenderProgress(30 + (i / videoScenes.length) * 30);
        if (videoScenes[i].imageUrl) {
          const res = await fetch(videoScenes[i].imageUrl!);
          imageBlobs.push(await res.blob());
        }
      }

      if (imageBlobs.length === 0) {
        toast.error("No hay imágenes en las escenas para renderizar");
        return;
      }

      const durationPerImage = Math.floor(15_000 / imageBlobs.length);
      setRenderProgress(60);

      const blob = await createSimpleVideo(imageBlobs, durationPerImage);
      setVideoBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setRenderProgress(100);
      toast.success("Video renderizado. ¡Descárgalo!");
    } catch (err) {
      console.error("Render error:", err);
      toast.error("Error al renderizar el video");
    } finally {
      setIsRendering(false);
    }
  };

  const handleVideoDownload = () => {
    if (videoBlob) {
      downloadBlob(videoBlob, `${projectName}-video.mp4`);
      toast.success("Video descargado");
    }
  };

  // ── Project save/load ───────────────────────────────────────────────────────

  const handleSaveProject = async () => {
    setIsSavingProject(true);
    try {
      downloadProject(project);
      toast.success("Proyecto guardado como .peracut.json");
    } catch (err) {
      toast.error("Error al guardar el proyecto");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleLoadProject = async () => {
    setIsLoadingProject(true);
    try {
      const loaded = await loadProjectFromFile();
      if (onProjectLoaded) onProjectLoaded(loaded);
      toast.success(`Proyecto "${loaded.name}" cargado`);
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`No se pudo cargar el proyecto: ${msg}`);
    } finally {
      setIsLoadingProject(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Guardar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Guardar / Exportar</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export">
          <TabsList className="w-full">
            <TabsTrigger value="export" className="flex-1">
              {editorType === "photo" ? (
                <span className="flex items-center gap-2">
                  <Image className="w-4 h-4" /> Exportar imagen
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4" /> Renderizar video
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="project" className="flex-1">
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Proyecto
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ── Export tab ── */}
          <TabsContent value="export" className="space-y-4 pt-4">
            {editorType === "photo" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Exporta la imagen con todos los filtros y ajustes aplicados.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Formato</Label>
                    <Select
                      value={imageFormat}
                      onValueChange={(v) => setImageFormat(v as ImageFormat)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (sin pérdida)</SelectItem>
                        <SelectItem value="jpeg">JPEG (comprimido)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Calidad</Label>
                    <Select
                      value={imageQuality}
                      onValueChange={(v) => setImageQuality(v as ImageQuality)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta (95 %)</SelectItem>
                        <SelectItem value="medium">Media (80 %)</SelectItem>
                        <SelectItem value="low">Baja (60 %)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!currentImageSrc && (
                  <p className="text-sm text-amber-600 bg-amber-50 rounded p-2">
                    Carga una imagen primero antes de exportar.
                  </p>
                )}

                <Button
                  onClick={handlePhotoExport}
                  disabled={isExportingPhoto || !currentImageSrc}
                  className="w-full gap-2"
                >
                  {isExportingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Descargar {imageFormat.toUpperCase()}
                </Button>
              </>
            ) : (
              /* ── Video render ── */
              <>
                <p className="text-sm text-muted-foreground">
                  Renderiza todas las escenas en un archivo MP4 (máx. 15 s).
                </p>

                <div className="bg-muted rounded p-3 text-sm space-y-1">
                  <p className="font-medium">Escenas: {videoScenes.length}</p>
                  {videoScenes.length > 0 && (
                    <p className="text-muted-foreground">
                      ~{Math.floor(15 / Math.max(videoScenes.length, 1))} s por escena
                    </p>
                  )}
                </div>

                {isRendering && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Renderizando…</span>
                      <span>{Math.round(renderProgress)} %</span>
                    </div>
                    <Progress value={renderProgress} className="h-2" />
                  </div>
                )}

                {previewUrl && (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded-lg bg-black max-h-48"
                  />
                )}

                <div className="flex gap-2">
                  {!videoBlob ? (
                    <Button
                      onClick={handleVideoRender}
                      disabled={isRendering || videoScenes.length === 0}
                      className="flex-1 gap-2"
                    >
                      {isRendering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                      {isRendering ? "Renderizando…" : "Renderizar MP4"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVideoBlob(null);
                          setPreviewUrl(null);
                        }}
                        className="flex-1"
                      >
                        Renderizar de nuevo
                      </Button>
                      <Button onClick={handleVideoDownload} className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Descargar MP4
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Project tab ── */}
          <TabsContent value="project" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Guarda el estado editable de tu proyecto y recupéralo después.
            </p>

            <div className="rounded border p-3 text-sm space-y-1 bg-muted/30">
              <p>
                <span className="font-medium">Nombre:</span> {project.name}
              </p>
              <p>
                <span className="font-medium">Tipo:</span>{" "}
                {project.type === "photo" ? "Foto" : "Video"}
              </p>
              {project.savedAt && (
                <p className="text-muted-foreground text-xs">
                  Último guardado:{" "}
                  {new Date(project.savedAt).toLocaleString()}
                </p>
              )}
            </div>

            <Button
              onClick={handleSaveProject}
              disabled={isSavingProject}
              className="w-full gap-2"
            >
              {isSavingProject ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar proyecto (.peracut.json)
            </Button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="px-2 text-xs text-muted-foreground">o</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button
              variant="outline"
              onClick={handleLoadProject}
              disabled={isLoadingProject}
              className="w-full gap-2"
            >
              {isLoadingProject ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderOpen className="w-4 h-4" />
              )}
              Cargar proyecto existente…
            </Button>

            <p className="text-xs text-muted-foreground">
              Al cargar un proyecto se reemplazará el estado actual del editor.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
