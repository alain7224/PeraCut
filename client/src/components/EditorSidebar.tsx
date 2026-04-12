import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Wand2, Type, ChevronDown } from "lucide-react";

interface EditorSidebarProps {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  filter: string;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onRotationChange: (value: number) => void;
  onFilterChange: (filter: string) => void;
  onGenerateImage: (prompt: string) => void;
  onAddText: (text: any) => void;
  isGenerating?: boolean;
}

export function EditorSidebar({
  brightness,
  contrast,
  saturation,
  rotation,
  filter,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onRotationChange,
  onFilterChange,
  onGenerateImage,
  onAddText,
  isGenerating = false,
}: EditorSidebarProps) {
  const [promptText, setPromptText] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("filters");

  const CollapsibleSection = ({
    title,
    icon: Icon,
    id,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    id: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            expandedSection === id ? "rotate-180" : ""
          }`}
        />
      </button>
      {expandedSection === id && (
        <div className="px-4 pb-4 space-y-4 bg-muted/30">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background border-l border-border overflow-hidden">
      <Tabs defaultValue="tools" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b border-border">
          <TabsTrigger value="tools" className="flex-1">
            Herramientas
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="tools"
          className="flex-1 overflow-y-auto m-0 p-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          <div className="divide-y divide-border">
            {/* Filtros */}
            <CollapsibleSection
              title="Filtros"
              icon={<Palette className="w-4 h-4 text-primary" />}
              id="filters"
            >
              <div className="space-y-2">
                {["none", "grayscale", "sepia", "blur", "vintage"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => onFilterChange(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </CollapsibleSection>

            {/* Brillo */}
            <CollapsibleSection
              title="Brillo"
              icon={<div className="w-4 h-4 rounded-full bg-yellow-400" />}
              id="brightness"
            >
              <div className="space-y-2">
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => onBrightnessChange(value[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{brightness}%</span>
              </div>
            </CollapsibleSection>

            {/* Contraste */}
            <CollapsibleSection
              title="Contraste"
              icon={<div className="w-4 h-4 bg-gradient-to-r from-black to-white rounded" />}
              id="contrast"
            >
              <div className="space-y-2">
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => onContrastChange(value[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{contrast}%</span>
              </div>
            </CollapsibleSection>

            {/* Saturación */}
            <CollapsibleSection
              title="Saturación"
              icon={<div className="w-4 h-4 rounded-full bg-red-500" />}
              id="saturation"
            >
              <div className="space-y-2">
                <Slider
                  value={[saturation]}
                  onValueChange={(value) => onSaturationChange(value[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{saturation}%</span>
              </div>
            </CollapsibleSection>

            {/* Rotación */}
            <CollapsibleSection
              title="Rotación"
              icon={<div className="w-4 h-4 border-2 border-primary rounded transform rotate-45" />}
              id="rotation"
            >
              <div className="space-y-2">
                <Slider
                  value={[rotation]}
                  onValueChange={(value) => onRotationChange(value[0])}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{rotation}°</span>
              </div>
            </CollapsibleSection>
          </div>
        </TabsContent>

        <TabsContent
          value="ai"
          className="flex-1 overflow-y-auto m-0 p-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          <div className="divide-y divide-border">
            {/* Generar/Modificar con IA */}
            <CollapsibleSection
              title="Generar con IA"
              icon={<Wand2 className="w-4 h-4 text-primary" />}
              id="ai-generate"
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ai-prompt" className="text-xs sm:text-sm">
                    Describe qué deseas
                  </Label>
                  <Input
                    id="ai-prompt"
                    placeholder="Ej: Agregar un atardecer rojo..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="mt-2 text-xs sm:text-sm"
                  />
                </div>
                <Button
                  className="w-full text-xs sm:text-sm"
                  onClick={() => {
                    if (promptText.trim()) {
                      onGenerateImage(promptText);
                      setPromptText("");
                    }
                  }}
                  disabled={isGenerating || !promptText.trim()}
                >
                  {isGenerating ? "Generando..." : "Generar"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  💡 La IA analizará tu foto actual y aplicará los cambios manteniendo el contexto
                </p>
              </div>
            </CollapsibleSection>

            {/* Texto */}
            <CollapsibleSection
              title="Agregar Texto"
              icon={<Type className="w-4 h-4 text-primary" />}
              id="text"
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor="text-input" className="text-xs sm:text-sm">
                    Texto
                  </Label>
                  <Input
                    id="text-input"
                    placeholder="Tu texto aquí..."
                    className="mt-2 text-xs sm:text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm"
                  onClick={() => {
                    const textInput = document.getElementById(
                      "text-input"
                    ) as HTMLInputElement;
                    if (textInput?.value) {
                      onAddText({
                        id: Math.random().toString(36),
                        text: textInput.value,
                        x: 50,
                        y: 50,
                        fontSize: 24,
                        fontFamily: "Arial",
                        fillStyle: "#000000",
                        fontWeight: "normal",
                      });
                      textInput.value = "";
                    }
                  }}
                >
                  Agregar
                </Button>
              </div>
            </CollapsibleSection>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
