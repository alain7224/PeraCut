import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeamlessClip, TransitionButton } from "./SeamlessClip";
import type { MediaItem } from "./MediaStrip";

interface CapCutTimelineProps {
  mediaItems: MediaItem[];
  selectedIndex: number;
  onSelectItem: (index: number) => void;
  onRemoveItem: (id: string) => void;
  onAddMedia: () => void;
  onAddTransition?: (afterIndex: number) => void;
}

/**
 * CapCut-style media timeline at bottom
 * - Seamless clips (no visible gaps)
 * - Translucent + button between clips for transitions
 * - Horizontal scrollable
 */
export function CapCutMediaTimeline({
  mediaItems,
  selectedIndex,
  onSelectItem,
  onRemoveItem,
  onAddMedia,
  onAddTransition,
}: CapCutTimelineProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
          Media Timeline
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={onAddMedia}
        >
          <Plus className="w-3 h-3" />
          Agregar
        </Button>
      </div>

      {mediaItems.length === 0 ? (
        <button
          onClick={onAddMedia}
          className="w-full h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-accent/5 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Añadir archivos al timeline</span>
        </button>
      ) : (
        <div className="relative">
          <div
            className="flex gap-0 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {mediaItems.map((item, index) => (
              <div key={item.id} className="flex">
                <SeamlessClip
                  id={item.id}
                  type={item.type}
                  thumbnailUrl={item.objectUrl}
                  fileName={item.fileName}
                  durationMs={item.durationMs}
                  isSelected={index === selectedIndex}
                  onSelect={() => onSelectItem(index)}
                  onRemove={() => onRemoveItem(item.id)}
                />
                {/* Add transition button between clips */}
                {index < mediaItems.length - 1 && onAddTransition && (
                  <TransitionButton
                    onAddTransition={() => onAddTransition(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CapCutAudioTimelineProps {
  audioTrack?: string;
  onAddAudio?: () => void;
}

/**
 * CapCut-style audio timeline below media timeline
 */
export function CapCutAudioTimeline({
  audioTrack,
  onAddAudio,
}: CapCutAudioTimelineProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
          Audio Timeline
        </h3>
        {onAddAudio && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={onAddAudio}
          >
            <Plus className="w-3 h-3" />
            Audio
          </Button>
        )}
      </div>

      {audioTrack ? (
        <div className="h-12 bg-accent/10 rounded-lg border border-border flex items-center px-3 gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-xs">🎵</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Pista de audio</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {audioTrack}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-12 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground">
          Sin audio - añade música o efectos de sonido
        </div>
      )}
    </div>
  );
}
