import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareDialog } from "@/components/ShareDialog";
import { EditorSidebar } from "@/components/EditorSidebar";
import PresetManager from "@/components/PresetManager";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Download } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface PhotoEditorProps {
  params: { projectId: string };
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fillStyle: string;
  fontWeight: "normal" | "bold" | "900";
}

export default function PhotoEditor({ params }: PhotoEditorProps) {
  const projectId = params.projectId;
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState<string>("none");
  const [textElements, setTextElements] = useState<TextElement[]>([]);

  const projectQuery = trpc.projects.get.useQuery(
    { id: parseInt(projectId) },
    { enabled: !!projectId }
  );

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Proyecto guardado");
    },
    onError: () => {
      toast.error("Error al guardar el proyecto");
    },
  });

  // Dibujar la imagen en el canvas con los filtros aplicados
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // Aplicar transformaciones
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Aplicar filtros CSS
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Aplicar filtro seleccionado
    if (filter === "grayscale") {
      ctx.filter += " grayscale(100%)";
    } else if (filter === "sepia") {
      ctx.filter += " sepia(100%)";
    } else if (filter === "blur") {
      ctx.filter += " blur(5px)";
    } else if (filter === "vintage") {
      ctx.filter += " sepia(50%) saturate(50%)";
    }

    ctx.drawImage(image, 0, 0);
    ctx.restore();

    // Dibujar elementos de texto
    textElements.forEach((textEl) => {
      ctx.font = `${textEl.fontWeight === "bold" ? "bold " : ""}${textEl.fontSize}px ${textEl.fontFamily}`;
      ctx.fillStyle = textEl.fillStyle;
      ctx.fillText(textEl.text, textEl.x, textEl.y);
    });
  }, [image, brightness, contrast, saturation, rotation, filter, textElements]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo (4000x4000)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > 4000 || img.height > 4000) {
          toast.error("La imagen no puede exceder 4000x4000 píxeles");
          return;
        }
        setImage(img);
        toast.success("Imagen cargada");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `${projectQuery.data?.name || "imagen"}.png`;
    link.click();
    toast.success("Imagen descargada");
  };

  const handleSave = () => {
    if (!canvasRef.current || !projectQuery.data) return;

    const thumbnail = canvasRef.current.toDataURL("image/jpeg", 0.5);
    const data = canvasRef.current.toDataURL("image/png");

    updateProjectMutation.mutate({
      id: parseInt(projectId),
      thumbnail,
      data,
    });
  };

  const generateImageMutation = trpc.imageGeneration.analyzeAndModify.useMutation({
    onSuccess: (result) => {
      // Cargar la imagen generada
      const img = new Image();
      img.onload = () => {
        setImage(img);
        toast.success("Imagen modificada exitosamente");
        if (result.analysis) {
          toast.message(`Análisis: ${result.analysis.imageAnalysis?.substring(0, 100)}...`);
        }
      };
      if (result.url) {
        img.src = result.url;
      }
    },
    onError: () => {
      toast.error("Error al generar la imagen");
    },
  });

  const handleGenerateImage = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error("Por favor ingresa un prompt");
      return;
    }

    if (!canvasRef.current || !image) {
      toast.error("Por favor carga una imagen primero");
      return;
    }

    // Convertir canvas a data URL para enviar a la IA
    const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");

    generateImageMutation.mutate({
      imageUrl: imageDataUrl,
      userPrompt: prompt,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (projectQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
              {projectQuery.data?.name || "Editor de Foto"}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleSave}>
              Guardar
            </Button>
            <ShareDialog
              projectName={projectQuery.data?.name || "imagen"}
              canvasRef={canvasRef}
            />
            <Button size="sm" onClick={handleDownload} disabled={!image}>
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Descargar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
          <div className="flex-1 bg-muted rounded-lg overflow-auto flex items-center justify-center">
            {image ? (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
              />
            ) : (
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                >
                  Cargar Imagen
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80 border-l border-border overflow-y-auto">
          <div className="p-4 space-y-6">
            <EditorSidebar
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              rotation={rotation}
              filter={filter}
              onBrightnessChange={setBrightness}
              onContrastChange={setContrast}
              onSaturationChange={setSaturation}
              onRotationChange={setRotation}
              onFilterChange={setFilter}
              onGenerateImage={handleGenerateImage}
              onAddText={(textEl) => setTextElements([...textElements, textEl])}
              isGenerating={generateImageMutation.isPending}
            />
            <div className="border-t border-border pt-4">
              <PresetManager
                currentSettings={{
                  brightness,
                  contrast,
                  saturation,
                  rotation,
                  filter,
                }}
                onApplyPreset={(settings) => {
                  if (settings.brightness) setBrightness(settings.brightness);
                  if (settings.contrast) setContrast(settings.contrast);
                  if (settings.saturation) setSaturation(settings.saturation);
                  if (settings.rotation) setRotation(settings.rotation);
                  if (settings.filter) setFilter(settings.filter);
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - Collapsible */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border max-h-[50vh] overflow-y-auto">
          <EditorSidebar
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            rotation={rotation}
            filter={filter}
            onBrightnessChange={setBrightness}
            onContrastChange={setContrast}
            onSaturationChange={setSaturation}
            onRotationChange={setRotation}
            onFilterChange={setFilter}
            onGenerateImage={handleGenerateImage}
            onAddText={(textEl) => setTextElements([...textElements, textEl])}
            isGenerating={generateImageMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
