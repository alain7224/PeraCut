import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoRenderDialog from "@/components/VideoRenderDialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Plus, Trash2, Play, Pause } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface VideoEditorProps {
  params: { projectId: string };
}

interface Scene {
  id: number;
  order: number;
  duration: number;
  mediaUrl?: string;
  mediaType: "image" | "video";
}

export default function VideoEditor({ params }: VideoEditorProps) {
  const projectId = params.projectId;
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectQuery = trpc.projects.get.useQuery(
    { id: parseInt(projectId) },
    { enabled: isAuthenticated && !!projectId }
  );

  const scenesQuery = trpc.scenes.list.useQuery(
    { projectId: parseInt(projectId) },
    { enabled: isAuthenticated && !!projectId }
  );

  const createSceneMutation = trpc.scenes.create.useMutation({
    onSuccess: () => {
      scenesQuery.refetch();
      toast.success("Escena agregada");
    },
    onError: () => {
      toast.error("Error al agregar la escena");
    },
  });

  const deleteSceneMutation = trpc.scenes.delete.useMutation({
    onSuccess: () => {
      scenesQuery.refetch();
      toast.success("Escena eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar la escena");
    },
  });

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Proyecto guardado");
    },
    onError: () => {
      toast.error("Error al guardar el proyecto");
    },
  });

  const handleAddScene = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar número máximo de escenas (8)
    if (scenesQuery.data && scenesQuery.data.length >= 8) {
      toast.error("Máximo 8 escenas por video");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const order = (scenesQuery.data?.length || 0) + 1;
      
      createSceneMutation.mutate({
        projectId: parseInt(projectId),
        order,
        duration: 3000, // 3 segundos por defecto
        mediaType: file.type.startsWith("video") ? "video" : "image",
        mediaUrl: url,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!scenesQuery.data || scenesQuery.data.length === 0) {
      toast.error("Agrega al menos una escena");
      return;
    }

    // TODO: Implementar exportación de video
    toast.info("Exportación de video próximamente");
  };

  const handleSave = () => {
    if (!projectQuery.data) return;

    // Calcular duración total
    const total = (scenesQuery.data || []).reduce((sum, scene) => sum + scene.duration, 0);
    
    if (total > 15000) { // 15 segundos máximo
      toast.error("La duración total no puede exceder 15 segundos");
      return;
    }

    updateProjectMutation.mutate({
      id: parseInt(projectId),
      data: JSON.stringify({ scenes: scenesQuery.data }),
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

  const totalDurationMs = (scenesQuery.data || []).reduce((sum, scene) => sum + scene.duration, 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-50 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {projectQuery.data?.name || "Editor de Video"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              Guardar
            </Button>
            <VideoRenderDialog
              scenes={(scenesQuery.data || []).map((scene) => ({
                id: scene.id.toString(),
                imageUrl: scene.mediaUrl || undefined,
                duration: scene.duration,
              }))}
              projectName={projectQuery.data?.name || "video"}
            />
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Preview Principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted rounded-lg overflow-auto flex items-center justify-center" style={{ height: "600px" }}>
                  {scenesQuery.data && scenesQuery.data.length > 0 ? (
                    <div className="text-center">
                      <div className="mb-4 text-sm text-muted-foreground">
                        Escena {currentSceneIndex + 1} de {scenesQuery.data.length}
                      </div>
                      {scenesQuery.data[currentSceneIndex]?.mediaUrl && (
                        <img
                          src={scenesQuery.data[currentSceneIndex].mediaUrl}
                          alt={`Escena ${currentSceneIndex + 1}`}
                          className="max-w-full max-h-96 rounded-lg"
                        />
                      )}
                      <div className="mt-6 flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                          disabled={currentSceneIndex === 0}
                        >
                          Anterior
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentSceneIndex(Math.min(scenesQuery.data!.length - 1, currentSceneIndex + 1))}
                          disabled={currentSceneIndex === scenesQuery.data.length - 1}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleAddScene}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        size="lg"
                      >
                        Agregar Primera Escena
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Timeline ({scenesQuery.data?.length || 0}/8 escenas - {totalDurationSec}s/15s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scenesQuery.data && scenesQuery.data.length > 0 ? (
                    scenesQuery.data.map((scene, index) => (
                      <div
                        key={scene.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          index === currentSceneIndex
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setCurrentSceneIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">Escena {index + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {(scene.duration / 1000).toFixed(1)}s
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSceneMutation.mutate({ id: scene.id });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay escenas aún
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Herramientas */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Escenas</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleAddScene}
                  className="hidden"
                />
                <Button
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={(scenesQuery.data?.length || 0) >= 8}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Escena
                </Button>
              </CardContent>
            </Card>

            {scenesQuery.data && scenesQuery.data.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Duración de Escena</CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={[scenesQuery.data[currentSceneIndex]?.duration || 3000]}
                    onValueChange={(value) => {
                      // TODO: Actualizar duración de escena
                    }}
                    min={500}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    {((scenesQuery.data[currentSceneIndex]?.duration || 3000) / 1000).toFixed(1)}s
                  </span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
