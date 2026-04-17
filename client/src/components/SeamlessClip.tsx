import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SeamlessClipProps {
  id: string;
  type: "image" | "video";
  thumbnailUrl: string;
  fileName: string;
  durationMs?: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  className?: string;
}

/**
 * CapCut-style seamless clip for timeline
 * - No visible gaps between clips
 * - Displays thumbnail
 * - Shows duration for videos
 * - Remove button on hover
 */
export function SeamlessClip({
  id,
  type,
  thumbnailUrl,
  fileName,
  durationMs,
  isSelected,
  onSelect,
  onRemove,
  className,
}: SeamlessClipProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative h-16 min-w-[80px] flex-shrink-0 cursor-pointer transition-all group",
        "hover:ring-2 hover:ring-primary/50 hover:z-10",
        isSelected && "ring-2 ring-primary z-10",
        className
      )}
    >
      {/* Thumbnail */}
      {type === "image" ? (
        <img
          src={thumbnailUrl}
          alt={fileName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <video
            src={thumbnailUrl}
            className="w-full h-full object-cover"
            muted
          />
        </div>
      )}

      {/* Duration badge */}
      {durationMs && (
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
          {(durationMs / 1000).toFixed(1)}s
        </div>
      )}

      {/* Remove button on hover */}
      <Button
        size="sm"
        variant="destructive"
        className="absolute -top-2 -right-2 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="w-3 h-3" />
      </Button>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
      )}
    </div>
  );
}

interface TransitionButtonProps {
  onAddTransition: () => void;
}

/**
 * Translucent + button between clips for adding transitions
 */
export function TransitionButton({ onAddTransition }: TransitionButtonProps) {
  return (
    <button
      onClick={onAddTransition}
      className={cn(
        "flex-shrink-0 w-8 h-16 flex items-center justify-center",
        "bg-primary/10 hover:bg-primary/20 backdrop-blur-sm",
        "border-x border-primary/30 hover:border-primary/50",
        "transition-all group"
      )}
      title="Añadir transición"
    >
      <div className="w-6 h-6 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center">
        <span className="text-primary text-lg font-bold">+</span>
      </div>
    </button>
  );
}
