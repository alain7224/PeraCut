import { Music2, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/components/MediaStrip";
import type { EditorType, Scene } from "./unifiedEditorTypes";

interface Props {
  editorType: EditorType;
  mediaItems: MediaItem[];
  scenes: Scene[];
  selectedMediaIndex: number;
  selectedSceneIndex: number;
  isVideoPaused: boolean;
  onPrev: () => void;
  onTogglePause: () => void;
  onNext: () => void;
  onMoveClip: (direction: -1 | 1) => void;
  onSelectScene: (index: number) => void;
  onSelectMedia: (index: number) => void;
  sceneToMediaIndex: (index: number) => number;
}

export function UnifiedEditorTimelineControls({
  editorType,
  mediaItems,
  scenes,
  selectedMediaIndex,
  selectedSceneIndex,
  isVideoPaused,
  onPrev,
  onTogglePause,
  onNext,
  onMoveClip,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={onPrev} disabled={mediaItems.length <= 1}>
          <SkipBack className="w-3.5 h-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onTogglePause}>
          {isVideoPaused ? "▶ Reproducir" : "⏸ Pausar"}
        </Button>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={onNext} disabled={mediaItems.length <= 1}>
          <SkipForward className="w-3.5 h-3.5" />
        </Button>
        {editorType === "video" && (
          <>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onMoveClip(-1)} disabled={selectedSceneIndex <= 0}>
              ← Mover
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onMoveClip(1)} disabled={selectedSceneIndex >= Math.max(0, scenes.length - 1)}>
              Mover →
            </Button>
          </>
        )}
      </div>
      <span className="text-[11px]" style={{ color: "var(--sk-label-text)" }}>
        {mediaItems.length > 0
          ? `${selectedMediaIndex + 1} / ${mediaItems.length} clips`
          : "Sin clips"}
      </span>
    </div>
  );
}

/* ── CapCut-style media film strip ──────────────────────────────────────── */
export function UnifiedEditorTimelineMediaTrack({
  scenes,
  mediaItems,
  selectedSceneIndex,
  selectedMediaIndex,
  onSelectScene,
  onSelectMedia,
  sceneToMediaIndex,
}: Props) {
  // Prefer scenes (video mode); fall back to raw media items (photo mode)
  const useScenes = scenes.length > 0;
  const count = useScenes ? scenes.length : mediaItems.length;

  if (count === 0) {
    return (
      <div
        className="flex items-center justify-center h-16 rounded-lg text-xs"
        style={{
          background: "var(--sk-clip-bg)",
          color: "var(--sk-clip-empty)",
          border: "1px dashed var(--sk-panel-border)",
        }}
      >
        Sin clips — importa media para empezar
      </div>
    );
  }

  return (
    <div className="flex items-stretch overflow-x-auto rounded-lg" style={{ minHeight: 64 }}>
      {Array.from({ length: count }).map((_, index) => {
        const scene = useScenes ? scenes[index] : null;
        const mediaIndex = useScenes ? sceneToMediaIndex(index) : index;
        const item = mediaItems[mediaIndex] ?? null;
        const isSelected = useScenes ? index === selectedSceneIndex : index === selectedMediaIndex;
        const durationSec = scene ? (scene.duration / 1000).toFixed(1) : null;
        const isFirst = index === 0;
        const isLast = index === count - 1;

        return (
          <div key={scene?.id ?? item?.id ?? index} className="flex items-stretch">
            {/* ── Clip cell ── */}
            <button
              onClick={() => {
                if (useScenes) {
                  onSelectScene(index);
                } else {
                  onSelectMedia(index);
                }
              }}
              className="relative flex-shrink-0 overflow-hidden transition-all"
              style={{
                width: 80,
                height: 64,
                background: "var(--sk-clip-bg)",
                borderRadius: isFirst && isLast
                  ? 8
                  : isFirst
                  ? "8px 0 0 8px"
                  : isLast
                  ? "0 8px 8px 0"
                  : 0,
                outline: isSelected ? "2px solid #7c3aed" : "none",
                outlineOffset: -2,
                zIndex: isSelected ? 5 : 1,
              }}
            >
              {/* Thumbnail */}
              {item?.objectUrl ? (
                item.type === "video" ? (
                  <video
                    src={item.objectUrl}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.objectUrl}
                    alt={item.fileName}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-[9px]"
                  style={{ color: "var(--sk-clip-empty)" }}
                >
                  Sin media
                </div>
              )}

              {/* Duration badge */}
              {durationSec && (
                <span
                  className="absolute bottom-0 left-0 right-0 text-center text-[9px] py-0.5"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  {durationSec}s
                </span>
              )}

              {/* Clip number badge */}
              <span
                className="absolute top-0.5 left-1 text-[8px] font-bold"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                {index + 1}
              </span>
            </button>

            {/* ── Transition button between clips (no space gap) ── */}
            {!isLast && (
              <div
                className="relative flex-shrink-0 overflow-visible"
                style={{ width: 0, zIndex: 10 }}
              >
                <button
                  className="timeline-trans-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                  style={{
                    background: "var(--sk-trans-btn-bg)",
                    border: "1px solid var(--sk-trans-btn-border)",
                    color: "var(--sk-trans-btn-text)",
                    backdropFilter: "blur(4px)",
                  }}
                  title="Transición"
                  onClick={(e) => e.stopPropagation()}
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Audio track ─────────────────────────────────────────────────────────── */
export function UnifiedEditorTimelineAudioTrack({ editorType }: { editorType: EditorType }) {
  return (
    <div
      className="flex items-center gap-2 h-9 rounded-lg px-3 text-xs"
      style={{
        background: "var(--sk-audio-bg)",
        border: "1px dashed var(--sk-audio-border)",
        color: "var(--sk-audio-text)",
      }}
    >
      <Music2 className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">
        {editorType === "video"
          ? "Audio principal · usa el panel Sonido para gestionar música"
          : "Sin pista de audio"}
      </span>
    </div>
  );
}
