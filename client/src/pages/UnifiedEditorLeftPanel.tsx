import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/components/MediaStrip";
import type { Scene } from "./unifiedEditorTypes";

interface Props {
  mediaItems: MediaItem[];
  scenes: Scene[];
  selectedMediaIndex: number;
  onOpenFilePicker: () => void;
  onSelectItem: (index: number) => void;
}

export default function UnifiedEditorLeftPanel({
  mediaItems,
  scenes,
  selectedMediaIndex,
  onOpenFilePicker,
  onSelectItem,
}: Props) {
  return (
    <div className="p-2 space-y-2">
      <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1" onClick={onOpenFilePicker}>
        <Plus className="w-3.5 h-3.5" /> Importar
      </Button>

      <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
        {mediaItems.length === 0 ? (
          <button
            onClick={onOpenFilePicker}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-500 hover:border-purple-400"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Añade clips</span>
          </button>
        ) : (
          mediaItems.map((item, index) => {
            const isSelected = index === selectedMediaIndex;
            const sceneDuration = scenes[index]?.duration;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(index)}
                className={`w-full text-left p-1.5 rounded-lg border ${
                  isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="relative rounded overflow-hidden bg-black h-20">
                  {item.type === "image" ? (
                    <img src={item.objectUrl} alt={item.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.objectUrl} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                  )}
                  <span className="absolute top-1 left-1 text-[10px] bg-black/70 text-white px-1 rounded">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-700 truncate">{item.fileName}</p>
                {sceneDuration ? <p className="text-[10px] text-gray-500">{Math.round(sceneDuration / 1000)}s</p> : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
