import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, ArrowLeft, Image, Video, Save, X, Plus } from "lucide-react";
import { EditorSidebar } from "@/components/EditorSidebar";
import PresetManager from "@/components/PresetManager";
import ExportSaveDialog from "@/components/ExportSaveDialog";
import { STICKERS, stickerToDataUrl } from "@/lib/stickers";
import type { StickerItem } from "@/lib/projectSchema";
import type { PeraCutProject } from "@/lib/projectSchema";


type EditorType = "photo" | "video";

/** Small helper to generate unique ids without importing nanoid */
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

export default function UnifiedEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Estado del editor
  const [editorType, setEditorType] = useState<EditorType>("photo");
  const [showTypeSelector, setShowTypeSelector] = useState(!projectId);
  const [projectName, setProjectName] = useState("Mi Proyecto");

  // Estado de edición de fotos
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");

  // Stickers overlaid on the photo canvas
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);

  // Estado de edición de videos
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [slowMotionSpeed, setSlowMotionSpeed] = useState(1);
  const [transitionType, setTransitionType] = useState("fade");
  const [transitionDuration, setTransitionDuration] = useState(500);

  // Diálogos
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Queries
  const projectQuery = trpc.projects.get.useQuery(
    { id: parseInt(projectId || "0") },
    { enabled: !!projectId }
  );

  const scenesQuery = trpc.scenes.list.useQuery(
    { projectId: parseInt(projectId || "0") },
    { enabled: !!projectId && editorType === "video" }
  ) as any;

  // Efecto: cargar proyecto y determinar tipo
  useEffect(() => {
    if (projectQuery.data) {
      setEditorType(projectQuery.data.type as EditorType);
      setShowTypeSelector(false);
    }
  }, [projectQuery.data]);

  // Efecto: cargar escenas de video
  useEffect(() => {
    if (scenesQuery.data) {
      setScenes(scenesQuery.data as Scene[]);
    }
  }, [scenesQuery.data]);

  // Efecto: aplicar efectos a la imagen
  useEffect(() => {
    if (editorType === "photo" && currentImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new (window as any).Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Build the filter string and bake it into the canvas context so that
        // toDataURL() captures the filters (CSS style.filter is NOT captured).
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

        // Apply rotation around canvas centre
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        // Draw sticker overlays
        stickers.forEach((s) => {
          const stickerDef = STICKERS.find((st) => st.id === s.stickerId);
          if (!stickerDef) return;
          const stickerImg = new (window as any).Image();
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

        // Remove CSS filter (we use ctx.filter now)
        canvas.style.filter = "none";
      };
      img.src = currentImage;
    }
  }, [currentImage, brightness, contrast, saturation, rotation, selectedFilter, stickers, editorType]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new (window as any).FileReader();
      reader.onload = (event: any) => {
        setCurrentImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Sticker helpers ────────────────────────────────────────────────────────

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

  // ── Project snapshot (for ExportSaveDialog) ────────────────────────────────

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

  // ── Load project ───────────────────────────────────────────────────────────

  const handleProjectLoaded = (loaded: PeraCutProject) => {
    setEditorType(loaded.type);
    setProjectName(loaded.name);
    if (loaded.type === "photo" && loaded.photo) {
      const p = loaded.photo;
      if (p.imageDataUrl) setCurrentImage(p.imageDataUrl);
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
    }
    setShowTypeSelector(false);
  };

  const handleSelectType = (type: EditorType) => {
    setEditorType(type);
    setShowTypeSelector(false);
  };

  if (showTypeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
            ¿Qué deseas crear?
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Elige entre editar fotos o crear videos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción Foto */}
            <button
              onClick={() => handleSelectType("photo")}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Image className="w-16 h-16 mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Editar Foto</h2>
                <p className="text-gray-600 mb-6">
                  Crea imágenes hasta 4000x4000px con filtros y efectos con IA
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Filtros
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Texto
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    IA
                  </span>
                </div>
              </div>
            </button>

            {/* Opción Video */}
            <button
              onClick={() => handleSelectType("video")}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-400"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Video className="w-16 h-16 mx-auto mb-4 text-purple-500 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Crear Video</h2>
                <p className="text-gray-600 mb-6">
                  Crea videos de 15 segundos con 5-8 escenas y transiciones
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Timeline
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Transiciones
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Audio
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">
              {editorType === "photo" ? "Editor de Fotos" : "Editor de Videos"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {editorType === "photo" && (
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            )}

            {/* Unified Save / Export button */}
            <ExportSaveDialog
              editorType={editorType}
              canvasRef={canvasRef}
              imageFilters={{ brightness, contrast, saturation, rotation, filter: selectedFilter }}
              currentImageSrc={currentImage}
              videoScenes={scenes.map((sc) => ({
                id: String(sc.id),
                imageUrl: sc.mediaUrl ?? undefined,
                duration: sc.duration,
              }))}
              projectName={projectName}
              project={buildProject()}
              onProjectLoaded={handleProjectLoaded}
            >
              <Button
                size="sm"
                className={`gap-2 ${editorType === "photo" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                <Save className="w-4 h-4" />
                Guardar
              </Button>
            </ExportSaveDialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas/Editor Area */}
          <div className="lg:col-span-3">
            {editorType === "photo" ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {!currentImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <Image className="w-12 h-12 text-gray-400" />
                        <p className="text-lg font-medium text-gray-700">
                          Haz clic para cargar una imagen
                        </p>
                        <p className="text-sm text-gray-500">
                          Formatos soportados: JPG, PNG (máx 4000x4000px)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-96 rounded-lg shadow-md"
                    />
                    {/* Sticker overlays (visual only — baked on export) */}
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
                          <img
                            src={stickerToDataUrl(def)}
                            alt={def.name}
                            className="w-16 h-16 pointer-events-none"
                          />
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
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Editor de video con timeline y transiciones
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Usa el botón <strong>Guardar</strong> para renderizar y exportar el video MP4.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {editorType === "photo" && currentImage && (
                <>
                  <EditorSidebar
                    brightness={brightness}
                    contrast={contrast}
                    saturation={saturation}
                    rotation={rotation}
                    filter={selectedFilter}
                    onBrightnessChange={setBrightness}
                    onContrastChange={setContrast}
                    onSaturationChange={setSaturation}
                    onRotationChange={setRotation}
                    onFilterChange={setSelectedFilter}
                    onGenerateImage={() => {}}
                    onAddText={() => {}}
                  />

                  <PresetManager
                    currentSettings={{
                      brightness,
                      contrast,
                      saturation,
                      rotation,
                      filter: selectedFilter,
                    }}
                    onApplyPreset={(settings: any) => {
                      setBrightness(settings.brightness || 100);
                      setContrast(settings.contrast || 100);
                      setSaturation(settings.saturation || 100);
                      setRotation(settings.rotation || 0);
                      setSelectedFilter(settings.filter || "none");
                    }}
                  />

                  {/* Sticker panel */}
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <button
                      onClick={() => setShowStickerPanel((v) => !v)}
                      className="w-full flex items-center justify-between font-semibold text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        Stickers
                        {stickers.length > 0 && (
                          <span className="ml-1 bg-primary text-primary-foreground rounded-full text-xs px-1.5">
                            {stickers.length}
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {showStickerPanel ? "▲" : "▼"}
                      </span>
                    </button>

                    {showStickerPanel && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {STICKERS.map((st) => (
                          <button
                            key={st.id}
                            onClick={() => handleAddSticker(st.id)}
                            title={st.name}
                            className="aspect-square rounded-lg border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
                          >
                            <img
                              src={stickerToDataUrl(st)}
                              alt={st.name}
                              className="w-8 h-8"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {editorType === "video" && (
                <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
                  <h3 className="font-bold text-gray-900">Opciones de Video</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Velocidad: {slowMotionSpeed.toFixed(2)}x
                    </label>
                    <Slider
                      value={[slowMotionSpeed]}
                      onValueChange={(val) => setSlowMotionSpeed(val[0])}
                      min={0.25}
                      max={2}
                      step={0.25}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Transición
                    </label>
                    <Select value={transitionType} onValueChange={setTransitionType}>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Duración: {transitionDuration}ms
                    </label>
                    <Slider
                      value={[transitionDuration]}
                      onValueChange={(val) => setTransitionDuration(val[0])}
                      min={100}
                      max={2000}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share dialog */}
      {showShareDialog && currentImage && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartir Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Descarga o comparte tu foto en redes sociales
              </p>
              <div className="flex gap-2 flex-wrap">
                <ExportSaveDialog
                  editorType="photo"
                  imageFilters={{ brightness, contrast, saturation, rotation, filter: selectedFilter }}
                  currentImageSrc={currentImage}
                  projectName={projectName}
                  project={buildProject()}
                  onProjectLoaded={handleProjectLoaded}
                >
                  <Button variant="outline" size="sm">
                    Exportar imagen
                  </Button>
                </ExportSaveDialog>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
