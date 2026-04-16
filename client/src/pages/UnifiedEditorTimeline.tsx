import { SkipBack, SkipForward } from "lucide-react";
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
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={mediaItems.length <= 1}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onTogglePause}>
          {isVideoPaused ? "Reproducir" : "Pausar"}
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={mediaItems.length <= 1}>
          <SkipForward className="w-4 h-4" />
        </Button>
        {editorType === "video" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onMoveClip(-1)} disabled={selectedSceneIndex <= 0}>
              Mover ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => onMoveClip(1)} disabled={selectedSceneIndex >= Math.max(0, scenes.length - 1)}>
              Mover →
            </Button>
          </>
        )}
      </div>
      <span className="text-xs text-gray-500">
        {mediaItems.length > 0 ? `${selectedMediaIndex + 1}/${mediaItems.length}` : "Sin clips"}
      </span>
    </div>
  );
}

export function UnifiedEditorTimelineMediaTrack({
  mediaItems,
  scenes,
  selectedMediaIndex,
  selectedSceneIndex,
  onSelectScene,
  onSelectMedia,
  sceneToMediaIndex,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {scenes.length > 0
        ? scenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => onSelectScene(index)}
              className={`min-w-[120px] rounded-md border px-2 py-1.5 text-left ${
                index === selectedSceneIndex ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
            >
              <p className="text-[11px] font-medium text-gray-800">Clip {index + 1}</p>
              <p className="text-[10px] text-gray-500">{Math.round(scene.duration / 1000)}s</p>
            </button>
          ))
        : mediaItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSelectMedia(index)}
              className={`min-w-[120px] rounded-md border px-2 py-1.5 text-left ${
                index === selectedMediaIndex ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
            >
              <p className="text-[11px] font-medium text-gray-800">Clip {index + 1}</p>
              <p className="text-[10px] text-gray-500 truncate">{item.fileName}</p>
            </button>
          ))}
    </div>
  );
}

export function UnifiedEditorTimelineAudioTrack({ editorType }: { editorType: EditorType }) {
  return (
    <div className="min-h-9 rounded-md border border-dashed border-gray-300 px-2 py-2 text-xs text-gray-500">
      {editorType === "video" ? "Audio principal · usa Sonido para gestionar música" : "Sin pista de audio"}
    </div>
  );
}
