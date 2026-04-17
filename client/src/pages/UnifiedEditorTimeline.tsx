import { SkipBack, SkipForward, Play, Pause, Plus, Music2, Sparkles } from "lucide-react";
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
  const hasScenes = scenes.length > 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[var(--shell-ink)]">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={mediaItems.length <= 1} className="rounded-full border-white/30">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onTogglePause} className="rounded-full border-white/30 gap-2">
          {isVideoPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isVideoPaused ? "Reproducir" : "Pausar"}
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={mediaItems.length <= 1} className="rounded-full border-white/30">
          <SkipForward className="w-4 h-4" />
        </Button>
        {editorType === "video" && (
          <>
            <Button variant="outline" size="sm" onClick={() => onMoveClip(-1)} disabled={selectedSceneIndex <= 0} className="rounded-full border-white/30">
              Ordenar ↑
            </Button>
            <Button variant="outline" size="sm" onClick={() => onMoveClip(1)} disabled={selectedSceneIndex >= Math.max(0, scenes.length - 1)} className="rounded-full border-white/30">
              Ordenar ↓
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--shell-ink-muted)]">
        <Sparkles className="w-4 h-4 opacity-80" />
        {hasScenes
          ? `Timeline cronológico · Clip ${Math.min(selectedSceneIndex + 1, Math.max(scenes.length, 1))}/${Math.max(scenes.length, 1)}`
          : mediaItems.length > 0
            ? `Clips ${selectedMediaIndex + 1}/${mediaItems.length}`
            : "Añade archivos para iniciar la línea de tiempo"}
      </div>
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
  const usingScenes = scenes.length > 0;
  const clips = usingScenes ? scenes : mediaItems;

  const handleSelect = (index: number) => {
    if (usingScenes) onSelectScene(index);
    else onSelectMedia(index);
  };

  const renderLabel = (index: number, clip: Scene | MediaItem) => {
    if (usingScenes) return `Clip ${index + 1}`;
    return (clip as MediaItem).fileName;
  };

  return (
    <div className="timeline-track overflow-x-auto no-scrollbar rounded-2xl border border-white/10 px-2 py-3">
      {clips.length === 0 ? (
        <div className="px-3 py-4 text-xs text-[var(--shell-ink-muted)]">Arrastra media aquí para crear la línea de tiempo.</div>
      ) : (
        <div className="flex items-stretch gap-0 min-w-full">
          {clips.map((clip, index) => {
            const isSelected = usingScenes ? index === selectedSceneIndex : index === selectedMediaIndex;
            const duration = usingScenes ? Math.round((clip as Scene).duration / 1000) : undefined;
            const mediaIndex = usingScenes ? sceneToMediaIndex(index) : index;

            return (
              <div key={usingScenes ? (clip as Scene).id : (clip as MediaItem).id} className="relative flex">
                <button
                  onClick={() => handleSelect(index)}
                  className={`clip-card min-w-[170px] shrink-0 rounded-none first:rounded-l-2xl last:rounded-r-2xl text-left ${
                    isSelected ? "clip-card-active" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/50 overflow-hidden">
                      {usingScenes ? (
                        <div className="w-full h-full flex items-center justify-center text-[11px] text-white/70">
                          {mediaIndex + 1}
                        </div>
                      ) : (clip as MediaItem).type === "image" ? (
                        <img src={(clip as MediaItem).objectUrl} alt={(clip as MediaItem).fileName} className="w-full h-full object-cover" />
                      ) : (
                        <video src={(clip as MediaItem).objectUrl} className="w-full h-full object-cover opacity-75" muted preload="metadata" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[12px] font-semibold leading-tight text-[var(--shell-ink)] truncate">
                        {renderLabel(index, clip)}
                      </p>
                      <p className="text-[11px] text-[var(--shell-ink-muted)]">
                        {duration ? `${duration}s` : `Clip ${index + 1}`}
                      </p>
                    </div>
                  </div>
                </button>

                {index < clips.length - 1 && (
                  <button
                    aria-label="Insertar transición"
                    onClick={() => handleSelect(index + 1)}
                    className="add-chip absolute -right-4 top-1/2 -translate-y-1/2"
                    title="Transición"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function UnifiedEditorTimelineAudioTrack({ editorType }: { editorType: EditorType }) {
  return (
    <div className="timeline-track rounded-2xl border border-dashed border-white/15 px-3 py-3 flex items-center gap-3 text-sm text-[var(--shell-ink-soft)]">
      {editorType === "video" ? (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 shadow-inner">
            <Music2 className="w-4 h-4 opacity-80" />
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-[var(--shell-ink)]">Pista principal</span>
              <span className="text-[11px] text-[var(--shell-ink-muted)]">Drop o selecciona desde Sonido</span>
            </div>
          </div>
          <button className="add-chip h-10 px-3 rounded-full border border-white/15" type="button">
            <Plus className="w-4 h-4" />
            <span className="text-[11px] ml-1">Añadir SFX</span>
          </button>
        </>
      ) : (
        "Sin pista de audio"
      )}
    </div>
  );
}
