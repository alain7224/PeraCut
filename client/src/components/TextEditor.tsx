import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Type } from "lucide-react";
import { useState } from "react";

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fillStyle: string;
  fontWeight: "normal" | "bold" | "900";
}

interface TextEditorProps {
  onAddText: (text: TextElement) => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Trebuchet MS",
];

export function TextEditor({ onAddText }: TextEditorProps) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState<"normal" | "bold" | "900">("normal");
  const [fillStyle, setFillStyle] = useState("#000000");

  const handleAddText = () => {
    if (!text.trim()) return;

    onAddText({
      id: Date.now().toString(),
      text,
      x: 50,
      y: 50,
      fontSize,
      fontFamily,
      fillStyle,
      fontWeight,
    });

    setText("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Type className="w-4 h-4" />
          Agregar Texto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="text-input" className="text-sm">
            Texto
          </Label>
          <Input
            id="text-input"
            placeholder="Escribe tu texto aquí"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="font-family" className="text-sm">
            Fuente
          </Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger id="font-family" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="font-size" className="text-sm">
            Tamaño: {fontSize}px
          </Label>
          <Slider
            id="font-size"
            value={[fontSize]}
            onValueChange={(value) => setFontSize(value[0])}
            min={12}
            max={120}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="font-weight" className="text-sm">
            Grosor
          </Label>
          <Select value={fontWeight} onValueChange={(value) => setFontWeight(value as any)}>
            <SelectTrigger id="font-weight" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="900">Extra Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color" className="text-sm">
            Color
          </Label>
          <div className="flex gap-2 mt-2">
            <input
              id="color"
              type="color"
              value={fillStyle}
              onChange={(e) => setFillStyle(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <Input
              type="text"
              value={fillStyle}
              onChange={(e) => setFillStyle(e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        </div>

        <Button onClick={handleAddText} className="w-full">
          Agregar Texto
        </Button>
      </CardContent>
    </Card>
  );
}
