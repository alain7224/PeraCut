import { useRef } from "react";
import { X, Image, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaItem {
  id: string;
  type: "image" | "video";
  fileName: string;
  objectUrl: string;
  durationMs?: number;
}

interface MediaStripProps {
  items: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export default function MediaStrip({
  items,
  selectedIndex,
  onSelect,
  onRemove,
  onAdd,
}: MediaStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-xl shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">
          {items.length === 0
            ? "Sin archivos"
            : `${items.length} elemento${items.length !== 1 ? "s" : ""}`}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-xs h-7"
          onClick={onAdd}
        >
          <Plus className="w-3 h-3" />
          Agregar archivos
        </Button>
      </div>

      {items.length === 0 ? (
        <button
          onClick={onAdd}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 hover:border-blue-400 transition-colors text-gray-500 hover:text-blue-500"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm">Haz clic para añadir fotos o videos</span>
        </button>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                idx === selectedIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              onClick={() => onSelect(idx)}
            >
              {item.type === "image" ? (
                <img
                  src={item.objectUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center">
                  <video
                    src={item.objectUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                    muted
                    preload="metadata"
                  />
                  <Video className="w-6 h-6 text-white relative z-10 drop-shadow" />
                </div>
              )}

              {/* Type badge */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 flex items-center justify-center gap-0.5">
                {item.type === "image" ? (
                  <Image className="w-3 h-3 text-white" />
                ) : (
                  <Video className="w-3 h-3 text-white" />
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center transition-colors z-20"
                title="Eliminar"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
