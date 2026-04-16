import { Home, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EditorType } from "./unifiedEditorTypes";

interface Props {
  onBack: () => void;
  onSelectType: (type: EditorType) => void;
}

export default function UnifiedEditorTypeSelector({ onBack, onSelectType }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-gray-600 hover:text-gray-900">
            <Home className="w-4 h-4" /> Inicio
          </Button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">¿Qué deseas crear?</h1>
        <p className="text-center text-gray-600 mb-12">Elige entre editar fotos o crear videos</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectType("photo")}
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-400"
          >
            <Image className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Editar Foto</h2>
          </button>

          <button
            onClick={() => onSelectType("video")}
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
