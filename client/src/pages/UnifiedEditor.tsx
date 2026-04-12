import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Share2, ArrowLeft, Image, Video } from "lucide-react";
import { toast } from "sonner";
import { EditorSidebar } from "@/components/EditorSidebar";
import PresetManager from "@/components/PresetManager";
import RegistrationModal, { isRegistered } from "@/components/RegistrationModal";


type EditorType = "photo" | "video";

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
  const [isLoading, setIsLoading] = useState(false);

  // Estado de edición de fotos
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");

  // Estado de edición de videos
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [slowMotionSpeed, setSlowMotionSpeed] = useState(1);
  const [transitionType, setTransitionType] = useState("fade");
  const [transitionDuration, setTransitionDuration] = useState(500);

  // Diálogos
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRenderDialog, setShowRenderDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
        ctx.drawImage(img, 0, 0);

        // Aplicar filtros CSS
        const filterValue = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${rotation}deg)`;
        canvas.style.filter = filterValue;
      };
      img.src = currentImage;
    }
  }, [currentImage, brightness, contrast, saturation, rotation, selectedFilter, editorType]);

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

  const handleDownload = () => {
    requireRegistration(() => {
      if (editorType === "photo" && canvasRef.current) {
        const link = document.createElement("a");
        link.href = canvasRef.current.toDataURL("image/png");
        link.download = `photo-${Date.now()}.png`;
        link.click();
        toast.success("Foto descargada correctamente");
      }
    });
  };

  /** Gate any save/download action behind registration */
  const requireRegistration = (action: () => void) => {
    if (isRegistered()) {
      action();
    } else {
      setPendingAction(() => action);
      setShowRegistrationModal(true);
    }
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
              <>
                <Button
                  onClick={() => requireRegistration(() => setShowShareDialog(true))}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Guardar
                </Button>
              </>
            )}

            {editorType === "video" && (
              <Button
                onClick={() => requireRegistration(() => setShowRenderDialog(true))}
                size="sm"
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                Guardar Video
              </Button>
            )}
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
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-96 rounded-lg shadow-md"
                    />
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

      {/* Diálogos */}
      {showShareDialog && currentImage && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartir Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Descarga o comparte tu foto en redes sociales</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  Descargar
                </Button>
              </div>
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
              <p className="text-sm text-gray-600">
                Tu video se está renderizando. Esto puede tomar algunos minutos.
              </p>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Registration Modal — shown before save/download if not yet registered */}
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
    </div>
  );
}
