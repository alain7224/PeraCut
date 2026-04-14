import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Download,
  Share2,
  Home,
  Image,
  Video,
  Save,
  X,
  Plus,
  AlertTriangle,
  SkipBack,
  SkipForward,
  Volume2,
  FolderOpen,
  Copy,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import RegistrationModal, { isRegistered } from "@/components/RegistrationModal";
import MusicPanel from "@/components/MusicPanel";
import ExportSaveDialog from "@/components/ExportSaveDialog";
import TemplateSelector from "@/components/TemplateSelector";
import EditorShellLayout from "@/components/EditorShellLayout";
import { STICKERS, stickerToDataUrl } from "@/lib/stickers";
import type { StickerItem, PeraCutProject } from "@/lib/projectSchema";
import {
  exceedsExportLimit,
  EXPORT_LIMIT_WARNING_ES,
  MAX_EXPORT_DURATION_MS,
} from "@/lib/durationValidation";
import { getTemplateById, applyTemplateToMedia } from "@/lib/templateRegistry";
import type { MediaItem } from "@/components/MediaStrip";

type EditorType = "photo" | "video";
type RightTab = "media" | "clip" | "project";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface Scene {
  id: number;
  projectId: number;
  order: number;
  duration: number;
  mediaUrl: string | null;
  mediaType: string;
}

const DEFAULT_SCENE_MS = 3000;

export default function UnifiedEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const searchString = useSearch();

  const searchParams = new URLSearchParams(searchString);
  const editorTypeParam = searchParams.get("type") as EditorType | null;
  const templateParam = searchParams.get("template");

  const [editorType, setEditorType] = useState<EditorType>(editorTypeParam ?? "photo");
  const [showTypeSelector, setShowTypeSelector] = useState(!projectId && !editorTypeParam && !templateParam);
  const [projectName, setProjectName] = useState("Mi Proyecto");
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [previewAspectRatio, setPreviewAspectRatio] = useState<"9:16" | "1:1" | "16:9" | "4:5">("9:16");

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(true);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [slowMotionSpeed, setSlowMotionSpeed] = useState(1);
  const [transitionType, setTransitionType] = useState("fade");
  const [transitionDuration, setTransitionDuration] = useState(500);

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRenderDialog, setShowRenderDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("media");

  const loadedTemplate = useMemo(() => {
    if (!templateParam) return null;
    return getTemplateById(templateParam) ?? null;
  }, [templateParam]);

  const totalVideoDurationMs = useMemo(
    () => scenes.reduce((sum, s) => sum + (s.duration ?? 0), 0),
    [scenes],
  );

  const renderBlocked = editorType === "video" && exceedsExportLimit(totalVideoDurationMs);
  const showDurationWarning = editorType === "video" && totalVideoDurationMs >= MAX_EXPORT_DURATION_MS;

  const projectQuery = trpc.projects.get.useQuery(
    { id: parseInt(projectId || "0") },
    { enabled: !!projectId },
  );

  const scenesQuery = trpc.scenes.list.useQuery(
    { projectId: parseInt(projectId || "0") },
    { enabled: !!projectId && editorType === "video" },
  ) as any;

  useEffect(() => {
    if (templateParam) {
      setEditorType("video");
      setShowTypeSelector(false);
    } else if (editorTypeParam) {
      setEditorType(editorTypeParam);
      setShowTypeSelector(false);
    }
  }, [templateParam, editorTypeParam]);

  useEffect(() => {
    if (projectQuery.data) {
      setEditorType(projectQuery.data.type as EditorType);
      setProjectName(projectQuery.data.name || "Mi Proyecto");
      setShowTypeSelector(false);
    }
  }, [projectQuery.data]);

  useEffect(() => {
    if (!loadedTemplate && scenesQuery.data && editorType === "video" && mediaItems.length === 0) {
      setScenes(scenesQuery.data as Scene[]);
    }
  }, [scenesQuery.data, loadedTemplate, editorType, mediaItems.length]);

  const selectedMedia = mediaItems[selectedMediaIndex] ?? null;
  const currentImage = selectedMedia?.type === "image" ? selectedMedia.objectUrl : null;

  useEffect(() => {
    if (editorType !== "photo" || !currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = document.createElement("img") as HTMLImageElement;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const presetMap: Record<string, string> = {
        grayscale: "grayscale(100%)",
        sepia: "sepia(100%)",
        vintage: "sepia(50%) saturate(50%) brightness(110%)",
        cool: "hue-rotate(180deg) saturate(120%)",
        warm: "hue-rotate(10deg) saturate(130%)",
        noir: "grayscale(100%) contrast(150%)",
        none: "",
      };
      const presetStr = presetMap[selectedFilter] ?? "";
      const adjustStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.filter = presetStr ? `${adjustStr} ${presetStr}` : adjustStr;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      stickers.forEach((s) => {
        const stickerDef = STICKERS.find((st) => st.id === s.stickerId);
        if (!stickerDef) return;
        const stickerImg = document.createElement("img") as HTMLImageElement;
        stickerImg.onload = () => {
          const size = 80 * s.scale;
          const x = (s.x / 100) * canvas.width - size / 2;
          const y = (s.y / 100) * canvas.height - size / 2;
          ctx.save();
          ctx.filter = "none";
          ctx.translate(x + size / 2, y + size / 2);
          ctx.rotate((s.rotation * Math.PI) / 180);
          ctx.drawImage(stickerImg, -size / 2, -size / 2, size, size);
          ctx.restore();
        };
        stickerImg.src = stickerToDataUrl(stickerDef);
      });

      canvas.style.filter = "none";
    };
    img.src = currentImage;
  }, [currentImage, brightness, contrast, saturation, rotation, selectedFilter, stickers, editorType]);

  const buildVideoScenesFromMedia = useCallback(
    (items: MediaItem[], template = loadedTemplate): Scene[] => {
      const parsedProjectId = parseInt(projectId || "0");
      if (template) {
        const mediaDurationMs = items.length > 0
          ? items.reduce((sum, item) => sum + (item.durationMs ?? DEFAULT_SCENE_MS), 0)
          : template.durationMs;
        const applied = applyTemplateToMedia(template, mediaDurationMs);
        return applied.scenes.map((tplScene, idx) => {
          const media = items.length > 0 ? items[idx % items.length] : null;
          return {
            id: idx + 1,
            projectId: parsedProjectId,
            order: idx,
            duration: tplScene.durationMs,
            mediaUrl: media?.objectUrl ?? null,
            mediaType: media?.type ?? "image",
          };
        });
      }

      return items.map((item, idx) => ({
        id: idx + 1,
        projectId: parsedProjectId,
        order: idx,
        duration: item.durationMs ?? DEFAULT_SCENE_MS,
        mediaUrl: item.objectUrl,
        mediaType: item.type,
      }));
    },
    [loadedTemplate, projectId],
  );

  useEffect(() => {
    if (editorType !== "video") return;
    if (!loadedTemplate && mediaItems.length === 0) return;
    const nextScenes = buildVideoScenesFromMedia(mediaItems, loadedTemplate);
    setScenes(nextScenes);
    setSelectedSceneIndex((idx) => Math.min(idx, Math.max(0, nextScenes.length - 1)));
  }, [editorType, mediaItems, loadedTemplate, buildVideoScenesFromMedia]);

  const handleMediaFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const newItems: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) continue;

        const objectUrl = URL.createObjectURL(file);
        newItems.push({
          id: uid(),
          type: isVideo ? "video" : "image",
          fileName: file.name,
          objectUrl,
        });
      }

      if (newItems.length === 0) {
        toast.error("No se encontraron archivos de imagen o video válidos");
        return;
      }

      setMediaItems((prev) => {
        const updated = [...prev, ...newItems];
        setSelectedMediaIndex(prev.length);
        return updated;
      });

      toast.success(
        newItems.length === 1 ? "1 archivo añadido" : `${newItems.length} archivos añadidos`,
      );
    } catch {
      toast.error("Error al cargar los archivos. Intenta de nuevo.");
    }
  }, []);

  const handleMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMediaFiles(e.target.files);
    e.target.value = "";
  };

  const requireRegistration = (action: () => void) => {
    if (isRegistered()) {
      action();
    } else {
      setPendingAction(() => action);
      setShowRegistrationModal(true);
    }
  };

  const handleRemoveMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      setSelectedMediaIndex((idx) => Math.min(idx, Math.max(0, updated.length - 1)));
      return updated;
    });
  };

  const handleDuplicateSelected = async () => {
    if (!selectedMedia) return;
    try {
      const response = await fetch(selectedMedia.objectUrl);
      const blob = await response.blob();
      const duplicatedUrl = URL.createObjectURL(blob);
      const duplicated: MediaItem = {
        ...selectedMedia,
        id: uid(),
        objectUrl: duplicatedUrl,
        fileName: `copia-${selectedMedia.fileName}`,
      };
      setMediaItems((prev) => {
        const next = [...prev, duplicated];
        setSelectedMediaIndex(next.length - 1);
        return next;
      });
      toast.success("Clip duplicado");
    } catch {
      toast.error("No se pudo duplicar el clip");
    }
  };

  const openFilePicker = () => mediaFileInputRef.current?.click();

  const handlePlayPause = () => {
    const vid = videoRef.current;
    if (editorType === "photo" || !vid) {
      setIsVideoPaused((prev) => !prev);
      return;
    }
    if (vid.paused) {
      vid.play().then(() => setIsVideoPaused(false)).catch(() => toast.error("No se pudo reproducir el video"));
    } else {
      vid.pause();
      setIsVideoPaused(true);
    }
  };

  const handlePrev = () => {
    if (mediaItems.length === 0) return;
    setSelectedMediaIndex((idx) => (idx > 0 ? idx - 1 : mediaItems.length - 1));
    setSelectedSceneIndex((idx) => (idx > 0 ? idx - 1 : Math.max(0, scenes.length - 1)));
    setIsVideoPaused(true);
  };

  const handleNext = () => {
    if (mediaItems.length === 0) return;
    setSelectedMediaIndex((idx) => (idx < mediaItems.length - 1 ? idx + 1 : 0));
    setSelectedSceneIndex((idx) => (idx < scenes.length - 1 ? idx + 1 : 0));
    setIsVideoPaused(true);
  };

  const handleAddSticker = (stickerId: string) => {
    const newSticker: StickerItem = {
      id: uid(),
      stickerId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const buildProject = (): PeraCutProject => ({
    version: "1.0",
    type: editorType,
    name: projectName,
    savedAt: new Date().toISOString(),
    photo:
      editorType === "photo"
        ? {
            imageDataUrl: currentImage ?? undefined,
            brightness,
            contrast,
            saturation,
            rotation,
            filter: selectedFilter,
            stickers,
          }
        : undefined,
    video:
      editorType === "video"
        ? {
            scenes: scenes.map((sc) => ({
              id: String(sc.id),
              duration: sc.duration,
              mediaUrl: sc.mediaUrl ?? undefined,
              transition: transitionType,
              transitionDuration,
              stickers: [],
            })),
            transitionType,
            transitionDuration,
            slowMotionSpeed,
          }
        : undefined,
  });

  const handleProjectLoaded = (loaded: PeraCutProject) => {
    setEditorType(loaded.type);
    setProjectName(loaded.name);

    if (loaded.type === "photo" && loaded.photo) {
      const p = loaded.photo;
      if (p.imageDataUrl) {
        setMediaItems([{
          id: uid(),
          type: "image",
          fileName: "proyecto-guardado.png",
          objectUrl: p.imageDataUrl,
        }]);
        setSelectedMediaIndex(0);
      }
      setBrightness(p.brightness ?? 100);
      setContrast(p.contrast ?? 100);
      setSaturation(p.saturation ?? 100);
      setRotation(p.rotation ?? 0);
      setSelectedFilter(p.filter ?? "none");
      setStickers(p.stickers ?? []);
    }

    if (loaded.type === "video" && loaded.video) {
      const v = loaded.video;
      setTransitionType(v.transitionType ?? "fade");
      setTransitionDuration(v.transitionDuration ?? 500);
      setSlowMotionSpeed(v.slowMotionSpeed ?? 1);

      const loadedItems: MediaItem[] = (v.scenes ?? [])
        .filter((scene) => !!scene.mediaUrl)
        .map((scene) => ({
          id: uid(),
          type: "image",
          fileName: `scene-${scene.id}.png`,
          objectUrl: scene.mediaUrl!,
        }));

      if (loadedItems.length > 0) {
        setMediaItems(loadedItems);
        setSelectedMediaIndex(0);
      }

      const parsedProjectId = parseInt(projectId || "0");
      const loadedScenes: Scene[] = (v.scenes ?? []).map((scene, idx) => ({
        id: Number(scene.id) || idx + 1,
        projectId: parsedProjectId,
        order: idx,
        duration: scene.duration,
        mediaUrl: scene.mediaUrl ?? null,
        mediaType: "image",
      }));
      setScenes(loadedScenes);
      setSelectedSceneIndex(0);
    }

    setShowTypeSelector(false);
  };

  const handleDownloadPhoto = () => {
    requireRegistration(() => {
      if (canvasRef.current) {
        const link = document.createElement("a");
        link.href = canvasRef.current.toDataURL("image/png");
        link.download = `photo-${Date.now()}.png`;
        link.click();
        toast.success("Foto descargada correctamente");
      }
    });
  };

  const handleSelectType = (type: EditorType) => {
    setEditorType(type);
    setShowTypeSelector(false);
  };

  const aspectToClass: Record<typeof previewAspectRatio, string> = {
    "9:16": "aspect-[9/16]",
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "4:5": "aspect-[4/5]",
  };

  const compactButtonClass = "w-full h-8 justify-start text-xs px-2";

  const exportDialogButtonGuard = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isRegistered()) return;
    event.preventDefault();
    event.stopPropagation();
    requireRegistration(() => {});
  };

  const fileInputNode = (
    <input
      ref={mediaFileInputRef}
      type="file"
      accept="image/*,video/*"
      multiple
      className="hidden"
      onChange={handleMediaInputChange}
      aria-label="Seleccionar archivos de imagen o video"
    />
  );

  const warningBannerNode = showDurationWarning ? (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2 text-yellow-800 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
      {EXPORT_LIMIT_WARNING_ES}
    </div>
  ) : undefined;

  const leftSidebarNode = (
    <div className="p-2 space-y-2">
      <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1" onClick={openFilePicker}>
        <Plus className="w-3.5 h-3.5" /> Importar
      </Button>

      <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
        {mediaItems.length === 0 ? (
          <button
            onClick={openFilePicker}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-500 hover:border-purple-400"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Añade clips</span>
          </button>
        ) : (
          mediaItems.map((item, idx) => {
            const isSelected = idx === selectedMediaIndex;
            const sceneDuration = scenes[idx]?.duration;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedMediaIndex(idx);
                  setSelectedSceneIndex(Math.min(idx, Math.max(0, scenes.length - 1)));
                  setIsVideoPaused(true);
                }}
                className={`w-full text-left p-1.5 rounded-lg border ${
                  isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="relative rounded overflow-hidden bg-black h-20">
                  {item.type === "image" ? (
                    <img src={item.objectUrl} alt={item.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.objectUrl} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                  )}
                  <span className="absolute top-1 left-1 text-[10px] bg-black/70 text-white px-1 rounded">
                    {idx + 1}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-700 truncate">{item.fileName}</p>
                {sceneDuration ? <p className="text-[10px] text-gray-500">{Math.round(sceneDuration / 1000)}s</p> : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const centerContentNode = (
    <div className="h-full flex items-center justify-center">
      {!selectedMedia ? (
        <button
          onClick={openFilePicker}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500 hover:border-purple-400"
        >
          <Image className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Haz clic para cargar imágenes o videos</p>
        </button>
      ) : editorType === "photo" ? (
        <div className={`relative w-full max-w-3xl mx-auto ${aspectToClass[previewAspectRatio]}`}>
          <div className="absolute inset-0 bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
            {stickers.map((s) => {
              const def = STICKERS.find((st) => st.id === s.stickerId);
              if (!def) return null;
              return (
                <div
                  key={s.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                  }}
                >
                  <img src={stickerToDataUrl(def)} alt={def.name} className="w-16 h-16 pointer-events-none" />
                  <button
                    onClick={() => handleRemoveSticker(s.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    title="Eliminar sticker"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedMedia.type === "video" ? (
        <video
          ref={videoRef}
          src={selectedMedia.objectUrl}
          className="w-full max-h-[68vh] object-contain rounded-xl bg-black"
          controls
        />
      ) : (
        <img
          src={selectedMedia.objectUrl}
          alt={selectedMedia.fileName}
          className="w-full max-h-[68vh] object-contain rounded-xl bg-black"
        />
      )}
    </div>
  );

  const saveDialogProps = {
    editorType,
    canvasRef,
    imageFilters: { brightness, contrast, saturation, rotation, filter: selectedFilter },
    currentImageSrc: currentImage,
    videoScenes: scenes.map((sc) => ({
      id: String(sc.id),
      imageUrl: sc.mediaUrl ?? undefined,
      duration: sc.duration,
    })),
    projectName,
    project: buildProject(),
    onProjectLoaded: handleProjectLoaded,
  } as const;

  const rightSidebarNode = (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {[
          { id: "neon", label: "Neon", filter: "cool" },
          { id: "light", label: "Light", filter: "vintage" },
          { id: "dusk", label: "Dusk", filter: "warm" },
        ].map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={selectedFilter === item.filter ? "default" : "outline"}
            className="h-8 text-[11px] px-1"
            onClick={() => setSelectedFilter(item.filter)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {(["9:16", "1:1", "16:9", "4:5"] as const).map((ar) => (
          <Button
            key={ar}
            size="sm"
            variant={previewAspectRatio === ar ? "default" : "outline"}
            className="h-8 text-[10px] px-1"
            onClick={() => setPreviewAspectRatio(ar)}
          >
            {ar}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1">
        {([
          { key: "media", label: "Media" },
          { key: "clip", label: "Clip" },
          { key: "project", label: "Proyecto" },
        ] as const).map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={rightTab === tab.key ? "default" : "outline"}
            className="h-8 text-[10px] px-1"
            onClick={() => setRightTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Button size="sm" variant="outline" className={compactButtonClass} onClick={openFilePicker}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Importar
      </Button>

      <Button
        size="sm"
        variant="outline"
        className={compactButtonClass}
        onClick={() => setRightTab("clip")}
        disabled={editorType !== "video"}
      >
        <Volume2 className="w-3.5 h-3.5 mr-1" /> Sonido
      </Button>

      <Button
        size="sm"
        variant="outline"
        className={compactButtonClass}
        disabled={!selectedMedia}
        onClick={() => selectedMedia && handleRemoveMediaItem(selectedMedia.id)}
      >
        <X className="w-3.5 h-3.5 mr-1" /> Borrar
      </Button>

      <Button
        size="sm"
        variant="outline"
        className={compactButtonClass}
        disabled={!selectedMedia}
        onClick={handleDuplicateSelected}
      >
        <Copy className="w-3.5 h-3.5 mr-1" /> Duplicar
      </Button>

      {editorType === "video" && (
        <Button size="sm" variant="outline" className={compactButtonClass} onClick={() => setShowTemplateDialog(true)}>
          <LayoutTemplate className="w-3.5 h-3.5 mr-1" /> Plantilla
        </Button>
      )}

      <ExportSaveDialog {...saveDialogProps}>
        <Button size="sm" className={`${compactButtonClass} bg-purple-600 hover:bg-purple-700`} onClick={exportDialogButtonGuard}>
          <Save className="w-3.5 h-3.5 mr-1" /> Guardar
        </Button>
      </ExportSaveDialog>

      <ExportSaveDialog {...saveDialogProps}>
        <Button size="sm" variant="outline" className={compactButtonClass} onClick={exportDialogButtonGuard}>
          <FolderOpen className="w-3.5 h-3.5 mr-1" /> Cargar
        </Button>
      </ExportSaveDialog>

      {editorType === "photo" ? (
        <Button size="sm" className={`${compactButtonClass} bg-blue-600 hover:bg-blue-700`} onClick={handleDownloadPhoto}>
          <Download className="w-3.5 h-3.5 mr-1" /> Descargar
        </Button>
      ) : (
        <ExportSaveDialog {...saveDialogProps}>
          <Button
            size="sm"
            className={`${compactButtonClass} bg-purple-600 hover:bg-purple-700 disabled:opacity-50`}
            disabled={renderBlocked}
            onClick={exportDialogButtonGuard}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Descargar
          </Button>
        </ExportSaveDialog>
      )}

      <Button size="sm" variant="outline" className={compactButtonClass} onClick={() => requireRegistration(() => setShowShareDialog(true))}>
        <Share2 className="w-3.5 h-3.5 mr-1" /> Compartir
      </Button>

      {rightTab === "media" && editorType === "photo" && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Brillo {brightness}%</p>
            <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} min={0} max={200} step={1} />
          </div>
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Contraste {contrast}%</p>
            <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} min={0} max={200} step={1} />
          </div>
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Saturación {saturation}%</p>
            <Slider value={[saturation]} onValueChange={(v) => setSaturation(v[0])} min={0} max={200} step={1} />
          </div>
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Rotación {rotation}°</p>
            <Slider value={[rotation]} onValueChange={(v) => setRotation(v[0])} min={0} max={360} step={1} />
          </div>
        </div>
      )}

      {rightTab === "clip" && editorType === "video" && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Velocidad {slowMotionSpeed.toFixed(2)}x</p>
            <Slider value={[slowMotionSpeed]} onValueChange={(v) => setSlowMotionSpeed(v[0])} min={0.25} max={2} step={0.25} />
          </div>
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Transición</p>
            <Select value={transitionType} onValueChange={setTransitionType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fundido</SelectItem>
                <SelectItem value="slide">Barrido</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="wipeLeft">Barrido Izq</SelectItem>
                <SelectItem value="wipeRight">Barrido Der</SelectItem>
                <SelectItem value="none">Ninguno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[11px] text-gray-600 mb-1">Duración transición {transitionDuration}ms</p>
            <Slider value={[transitionDuration]} onValueChange={(v) => setTransitionDuration(v[0])} min={100} max={2000} step={100} />
          </div>
          <MusicPanel />
        </div>
      )}

      {rightTab === "project" && (
        <div className="pt-2 border-t border-gray-200 space-y-2 text-[11px] text-gray-600">
          <p className="font-semibold text-gray-800">{projectName}</p>
          <p>{editorType === "photo" ? "Proyecto de foto" : "Proyecto de video"}</p>
          {loadedTemplate && (
            <p className="text-green-700">
              Plantilla: {loadedTemplate.styleName} · {loadedTemplate.durationMs / 1000}s · {loadedTemplate.aspectRatio}
            </p>
          )}
          <Button size="sm" variant="outline" className={compactButtonClass} onClick={() => setShowStickerPanel((v) => !v)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Stickers
          </Button>
          {showStickerPanel && (
            <div className="grid grid-cols-4 gap-1">
              {STICKERS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleAddSticker(st.id)}
                  title={st.name}
                  className="aspect-square rounded border border-gray-200 hover:border-purple-400 flex items-center justify-center"
                >
                  <img src={stickerToDataUrl(st)} alt={st.name} className="w-6 h-6" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const timelineControlsNode = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrev} disabled={mediaItems.length <= 1}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handlePlayPause}>
          {isVideoPaused ? "Reproducir" : "Pausar"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={mediaItems.length <= 1}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      <span className="text-xs text-gray-500">
        {mediaItems.length > 0 ? `${selectedMediaIndex + 1}/${mediaItems.length}` : "Sin clips"}
      </span>
    </div>
  );

  const timelineMediaTrackNode = (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {scenes.length > 0
        ? scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => {
                setSelectedSceneIndex(idx);
                setSelectedMediaIndex(Math.min(idx, Math.max(0, mediaItems.length - 1)));
              }}
              className={`min-w-[120px] rounded-md border px-2 py-1.5 text-left ${
                idx === selectedSceneIndex ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
            >
              <p className="text-[11px] font-medium text-gray-800">Clip {idx + 1}</p>
              <p className="text-[10px] text-gray-500">{Math.round(scene.duration / 1000)}s</p>
            </button>
          ))
        : mediaItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedMediaIndex(idx)}
              className={`min-w-[120px] rounded-md border px-2 py-1.5 text-left ${
                idx === selectedMediaIndex ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
            >
              <p className="text-[11px] font-medium text-gray-800">Clip {idx + 1}</p>
              <p className="text-[10px] text-gray-500 truncate">{item.fileName}</p>
            </button>
          ))}
    </div>
  );

  const timelineAudioTrackNode = (
    <div className="min-h-9 rounded-md border border-dashed border-gray-300 px-2 py-2 text-xs text-gray-500">
      {editorType === "video" ? "Audio principal · usa Sonido para gestionar música" : "Sin pista de audio"}
    </div>
  );

  if (showTypeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-gray-600 hover:text-gray-900">
              <Home className="w-4 h-4" /> Inicio
            </Button>
          </div>

          <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">¿Qué deseas crear?</h1>
          <p className="text-center text-gray-600 mb-12">Elige entre editar fotos o crear videos</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleSelectType("photo")}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400"
            >
              <Image className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Editar Foto</h2>
            </button>

            <button
              onClick={() => handleSelectType("video")}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-400"
            >
              <Video className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Crear Video</h2>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <EditorShellLayout
        title={editorType === "photo" ? "Editor de Fotos" : "Editor de Videos"}
        projectName={projectName}
        onBack={() => navigate("/")}
        isPaused={isVideoPaused}
        onTogglePause={handlePlayPause}
        warningBanner={warningBannerNode}
        fileInput={fileInputNode}
        leftSidebar={leftSidebarNode}
        centerContent={centerContentNode}
        rightSidebar={rightSidebarNode}
        timelineControls={timelineControlsNode}
        timelineMediaTrack={timelineMediaTrackNode}
        timelineAudioTrack={timelineAudioTrackNode}
      />

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>Plantillas</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 h-full min-h-0">
            <TemplateSelector
              onSelectTemplate={(template) => {
                navigate(`/editor?type=video&template=${template.id}`);
                setShowTemplateDialog(false);
              }}
              onClose={() => setShowTemplateDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {showShareDialog && currentImage && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartir</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Descarga o comparte tu contenido.</p>
              <ExportSaveDialog {...saveDialogProps}>
                <Button variant="outline" size="sm">Exportar</Button>
              </ExportSaveDialog>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showRenderDialog && (
        <Dialog open={showRenderDialog} onOpenChange={setShowRenderDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Renderizar Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Tu video se está renderizando. Esto puede tomar algunos minutos.</p>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <RegistrationModal
        open={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setShowRegistrationModal(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </>
  );
}
