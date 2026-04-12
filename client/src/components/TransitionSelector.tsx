import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransitionType, TRANSITION_DESCRIPTIONS, RECOMMENDED_TRANSITION_DURATION } from "@/lib/transitions";
import { Sparkles } from "lucide-react";

interface TransitionSelectorProps {
  onTransitionChange: (type: TransitionType, duration: number) => void;
  defaultType?: TransitionType;
  defaultDuration?: number;
}

export default function TransitionSelector({
  onTransitionChange,
  defaultType = "fade",
  defaultDuration = RECOMMENDED_TRANSITION_DURATION,
}: TransitionSelectorProps) {
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>(defaultType);
  const [duration, setDuration] = useState(defaultDuration);

  const transitionOptions: TransitionType[] = ["fade", "slide", "zoom", "wipeLeft", "wipeRight", "none"];

  const handleTransitionChange = (value: string) => {
    const transition = value as TransitionType;
    setSelectedTransition(transition);
    onTransitionChange(transition, duration);
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setDuration(newDuration);
    onTransitionChange(selectedTransition, newDuration);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          Transiciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de tipo de transición */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Transición</label>
          <Select value={selectedTransition} onValueChange={handleTransitionChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transitionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  <div className="flex flex-col">
                    <span className="font-medium capitalize">{option}</span>
                    <span className="text-xs text-muted-foreground">
                      {TRANSITION_DESCRIPTIONS[option]}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción de la transición seleccionada */}
        <div className="bg-muted p-3 rounded-lg text-sm">
          <p className="font-medium capitalize mb-1">{selectedTransition}</p>
          <p className="text-muted-foreground">{TRANSITION_DESCRIPTIONS[selectedTransition]}</p>
        </div>

        {/* Control de duración */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Duración</label>
            <span className="text-sm text-muted-foreground">{duration}ms</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={handleDurationChange}
            min={100}
            max={2000}
            step={100}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Rango: 100ms - 2000ms (recomendado: 500ms)
          </p>
        </div>

        {/* Vista previa de parámetros */}
        <div className="bg-muted p-3 rounded-lg space-y-1 text-xs">
          <p>
            <span className="font-medium">Tipo:</span> {selectedTransition}
          </p>
          <p>
            <span className="font-medium">Duración:</span> {duration}ms ({(duration / 1000).toFixed(2)}s)
          </p>
          <p>
            <span className="font-medium">Velocidad:</span>{" "}
            {duration < 300 ? "Rápida" : duration < 700 ? "Normal" : "Lenta"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
