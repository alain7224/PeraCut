import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Save, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PresetManagerProps {
  currentSettings: Record<string, any>;
  onApplyPreset: (settings: Record<string, any>) => void;
}

export default function PresetManager({ currentSettings, onApplyPreset }: PresetManagerProps) {
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: presets, isLoading } = trpc.presets.list.useQuery();
  const createMutation = trpc.presets.create.useMutation();
  const deleteMutation = trpc.presets.delete.useMutation();
  const applyMutation = trpc.presets.applyPreset.useQuery;

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error("Por favor ingresa un nombre para el preset");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: presetName,
        description: presetDescription,
        settings: currentSettings,
        category: "custom",
      });

      toast.success(`Preset "${presetName}" guardado exitosamente`);
      setPresetName("");
      setPresetDescription("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Error al guardar el preset");
    }
  };

  const handleDeletePreset = async (presetId: number) => {
    try {
      await deleteMutation.mutateAsync({ id: presetId });
      toast.success("Preset eliminado");
    } catch (error) {
      toast.error("Error al eliminar el preset");
    }
  };

  const handleApplyPreset = (preset: any) => {
    try {
      const settings = typeof preset.settings === "string" ? JSON.parse(preset.settings) : preset.settings;
      onApplyPreset(settings);
      toast.success(`Preset "${preset.name}" aplicado`);
    } catch (error) {
      toast.error("Error al aplicar el preset");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Mis Presets</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Guardar Preset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guardar Nuevo Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del Preset</label>
                <Input
                  placeholder="Ej: Vintage Retro"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción (opcional)</label>
                <Input
                  placeholder="Describe este preset..."
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSavePreset} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Guardar Preset"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Cargando presets...</div>
      ) : presets && presets.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {presets.map((preset: any) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <button
                onClick={() => handleApplyPreset(preset)}
                className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
              >
                {preset.name}
              </button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeletePreset(preset.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4">
          No tienes presets guardados aún. ¡Crea uno!
        </div>
      )}
    </div>
  );
}
