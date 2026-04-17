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
    <div className="h-full flex flex-col gap-3 text-[var(--shell-ink)]">
      <div className="flex items-center justify-between">
        <div className="space-y-0">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--shell-ink-muted)]">Biblioteca</p>
          <p className="text-xs text-[var(--shell-ink-soft)]">Arrastra y suelta tus clips</p>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 rounded-full" onClick={onOpenFilePicker}>
          <Plus className="w-3.5 h-3.5" /> Importar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scroll">
        {mediaItems.length === 0 ? (
          <button
            onClick={onOpenFilePicker}
            className="w-full border border-dashed border-white/20 bg-white/5 hover:border-[var(--shell-accent)] hover:bg-white/10 transition-colors rounded-2xl py-8 px-3 flex flex-col items-center gap-2 text-[var(--shell-ink-soft)]"
          >
            <Plus className="w-5 h-5 opacity-80" />
            <span className="text-xs font-medium">Añade clips</span>
          </button>
        ) : (
          mediaItems.map((item, index) => {
            const isSelected = index === selectedMediaIndex;
            const sceneDuration = scenes[index]?.duration;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(index)}
                className={`w-full text-left rounded-2xl border backdrop-blur-sm transition shadow-sm clip-card ${
                  isSelected ? "clip-card-active" : ""
                }`}
              >
                <div className="relative rounded-xl overflow-hidden bg-black h-24">
                  {item.type === "image" ? (
                    <img src={item.objectUrl} alt={item.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.objectUrl} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                  )}
                  <span className="absolute top-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full">
                    {index + 1}
                  </span>
                </div>
                <div className="px-2.5 py-2 space-y-0.5">
                  <p className="text-[12px] font-semibold text-[var(--shell-ink)] truncate">{item.fileName}</p>
                  {sceneDuration ? (
                    <p className="text-[11px] text-[var(--shell-ink-muted)]">{Math.round(sceneDuration / 1000)}s</p>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
