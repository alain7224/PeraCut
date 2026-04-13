import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Play,
  Pause,
  Download,
  Save,
  Upload,
  Plus,
  Music,
  Layers,
  Video,
  Image,
  Trash2,
  ChevronDown,
  Settings,
  Volume2,
  FileVideo,
} from "lucide-react";
import { toast } from "sonner";
import { TransitionType, TRANSITION_DESCRIPTIONS } from "@/lib/transitions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaClip {
  id: string;
  mediaUrl: string | null;
  mediaType: "image" | "video";
  duration: number; // ms
  name: string;
  thumbnail?: string;
}

export interface ClipTransition {
  afterClipId: string; // transition is between this clip and the next
  type: TransitionType;
  duration: number; // ms
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string | null;
  duration: number; // ms
  startAt: number; // offset in ms
}

export interface VideoEditorState {
  templateName: string;
  clips: MediaClip[];
  transitions: ClipTransition[];
  audioTracks: AudioTrack[];
  isPlaying: boolean;
  currentClipIndex: number;
}

interface VideoEditorLayoutProps {
  onBack: () => void;
  state: VideoEditorState;
  onChange: (state: VideoEditorState) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_CLIPS = 15;

const AVAILABLE_TRANSITIONS: { type: TransitionType; label: string; icon: string }[] = [
  { type: "fade", label: "Fundido", icon: "🌫️" },
  { type: "slide", label: "Barrido", icon: "➡️" },
  { type: "zoom", label: "Zoom", icon: "🔍" },
  { type: "wipeLeft", label: "Cortinilla ←", icon: "◀️" },
  { type: "wipeRight", label: "Cortinilla →", icon: "▶️" },
  { type: "none", label: "Corte", icon: "✂️" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A single clip thumbnail in the left vertical strip */
function MediaStripThumb({
  clip,
  index,
  isSelected,
  onSelect,
  onRemove,
}: {
  clip: MediaClip;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`relative group cursor-pointer border-2 rounded overflow-hidden flex-shrink-0 transition-all ${
        isSelected ? "border-purple-500" : "border-transparent hover:border-purple-300"
      }`}
      style={{ width: 64, height: 48 }}
      onClick={onSelect}
    >
      {clip.mediaUrl ? (
        clip.mediaType === "image" ? (
          <img
            src={clip.mediaUrl}
            alt={clip.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={clip.mediaUrl}
            className="w-full h-full object-cover"
            muted
          />
        )
      ) : (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          {clip.mediaType === "image" ? (
            <Image className="w-4 h-4 text-gray-400" />
          ) : (
            <Video className="w-4 h-4 text-gray-400" />
          )}
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
        {index + 1}
      </div>
      <button
        className="absolute top-0.5 right-0.5 hidden group-hover:flex bg-red-600 rounded-full w-4 h-4 items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <Trash2 className="w-2 h-2 text-white" />
      </button>
    </div>
  );
}

/** Sortable clip thumbnail in the bottom timeline */
function SortableClipTile({
  clip,
  index,
  isSelected,
  onSelect,
}: {
  clip: MediaClip;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: clip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative cursor-grab active:cursor-grabbing border-2 rounded overflow-hidden flex-shrink-0 transition-all ${
        isSelected ? "border-purple-500" : "border-transparent hover:border-purple-300"
      }`}
      onClick={onSelect}
    >
      <div style={{ width: 80, height: 60 }}>
        {clip.mediaUrl ? (
          clip.mediaType === "image" ? (
            <img
              src={clip.mediaUrl}
              alt={clip.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <video
              src={clip.mediaUrl}
              className="w-full h-full object-cover"
              muted
              draggable={false}
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            {clip.mediaType === "image" ? (
              <Image className="w-5 h-5 text-gray-400" />
            ) : (
              <Video className="w-5 h-5 text-gray-400" />
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
        {(clip.duration / 1000).toFixed(1)}s
      </div>
      {isSelected && (
        <div className="absolute inset-0 border-2 border-purple-500 rounded" />
      )}
    </div>
  );
}

/** The "+" drop target between clips for transitions */
function TransitionSlot({
  afterClipId,
  transition,
  onDrop,
  onApplyAll,
}: {
  afterClipId: string;
  transition: ClipTransition | undefined;
  onDrop: (type: TransitionType) => void;
  onApplyAll: (type: TransitionType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `transition-slot-${afterClipId}`,
    data: { type: "transition-slot", afterClipId },
  });

  const currentLabel =
    transition && transition.type !== "none"
      ? AVAILABLE_TRANSITIONS.find((t) => t.type === transition.type)?.icon ?? "✂️"
      : "+";

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 flex items-center justify-center self-center rounded transition-all cursor-pointer select-none
        ${isOver ? "bg-purple-500/40 scale-110" : "bg-white/10 hover:bg-white/20"}
        ${transition && transition.type !== "none" ? "text-purple-300" : "text-gray-400"}
      `}
      style={{ width: 28, height: 40, borderRadius: 6, border: "1.5px dashed rgba(255,255,255,0.25)" }}
    >
      <span className="text-[11px] font-bold leading-none">{currentLabel}</span>
    </div>
  );
}

/** A draggable transition card in the transitions panel */
function TransitionCard({ type, label, icon }: { type: TransitionType; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: `tc-${type}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-grab active:cursor-grabbing border border-gray-600 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] text-gray-300 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export default function VideoEditorLayout({
  onBack,
  state,
  onChange,
}: VideoEditorLayoutProps) {
  const { templateName, clips, transitions, audioTracks, isPlaying, currentClipIndex } = state;

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeTransitionDrag, setActiveTransitionDrag] = useState<TransitionType | null>(null);
  const [hoveredTransitionSlot, setHoveredTransitionSlot] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Helpers ────────────────────────────────────────────────────────────

  const getTransitionForClip = useCallback(
    (clipId: string) => transitions.find((t) => t.afterClipId === clipId),
    [transitions]
  );

  const updateState = useCallback(
    (partial: Partial<VideoEditorState>) => onChange({ ...state, ...partial }),
    [state, onChange]
  );

  // ── Media upload ───────────────────────────────────────────────────────

  const handleMediaFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_CLIPS - clips.length;
    if (remaining <= 0) {
      toast.error(`Máximo ${MAX_CLIPS} clips por proyecto`);
      return;
    }
    const filesToAdd = Array.from(files).slice(0, remaining);
    const newClips: MediaClip[] = [];
    let loaded = 0;
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newClips.push({
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          mediaUrl: e.target?.result as string,
          mediaType: file.type.startsWith("video") ? "video" : "image",
          duration: 3000,
          name: file.name,
        });
        loaded++;
        if (loaded === filesToAdd.length) {
          updateState({ clips: [...clips, ...newClips] });
          toast.success(`${newClips.length} clip(s) agregado(s)`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveClip = (clipId: string) => {
    const newClips = clips.filter((c) => c.id !== clipId);
    const newTransitions = transitions.filter((t) => t.afterClipId !== clipId);
    const newIndex = Math.min(currentClipIndex, Math.max(0, newClips.length - 1));
    updateState({ clips: newClips, transitions: newTransitions, currentClipIndex: newIndex });
  };

  // ── Audio upload ───────────────────────────────────────────────────────

  const handleAudioFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newTrack: AudioTrack = {
        id: `audio-${Date.now()}`,
        name: file.name,
        url: e.target?.result as string,
        duration: 0,
        startAt: 0,
      };
      updateState({ audioTracks: [...audioTracks, newTrack] });
      toast.success("Pista de audio agregada");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAudio = (trackId: string) => {
    updateState({ audioTracks: audioTracks.filter((t) => t.id !== trackId) });
  };

  // ── Drag-and-drop clips ────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith("tc-")) {
      setActiveTransitionDrag(id.replace("tc-", "") as TransitionType);
    } else {
      setActiveDragId(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveTransitionDrag(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Transition card dropped on a slot
    if (activeId.startsWith("tc-") && overId.startsWith("transition-slot-")) {
      const transitionType = activeId.replace("tc-", "") as TransitionType;
      const afterClipId = overId.replace("transition-slot-", "");
      applyTransitionToSlot(afterClipId, transitionType);
      return;
    }

    // Clip reorder
    if (activeId !== overId) {
      const oldIndex = clips.findIndex((c) => c.id === activeId);
      const newIndex = clips.findIndex((c) => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        updateState({ clips: arrayMove(clips, oldIndex, newIndex) });
      }
    }
  };

  const applyTransitionToSlot = (afterClipId: string, type: TransitionType) => {
    const existing = transitions.find((t) => t.afterClipId === afterClipId);
    let newTransitions: ClipTransition[];
    if (existing) {
      newTransitions = transitions.map((t) =>
        t.afterClipId === afterClipId ? { ...t, type } : t
      );
    } else {
      newTransitions = [
        ...transitions,
        { afterClipId, type, duration: 500 },
      ];
    }
    updateState({ transitions: newTransitions });
    toast.success(`Transición "${TRANSITION_DESCRIPTIONS[type]}" aplicada`);
  };

  const applyTransitionToAll = (type: TransitionType) => {
    const newTransitions = clips.slice(0, -1).map((clip) => ({
      afterClipId: clip.id,
      type,
      duration: 500,
    }));
    updateState({ transitions: newTransitions });
    toast.success(`Transición "${TRANSITION_DESCRIPTIONS[type]}" aplicada a todos los clips`);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  const currentClip = clips[currentClipIndex] ?? null;
  const totalDurationSec = clips.reduce((s, c) => s + c.duration, 0) / 1000;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
        {/* ── HEADER ──────────────────────────────────────── */}
        <header className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-700 gap-1"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div className="h-5 w-px bg-gray-600" />
            <div>
              <p className="text-sm font-semibold leading-tight">{templateName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Editor visual</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => updateState({ isPlaying: !isPlaying })}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pausar" : "Previsualizar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
              onClick={() => toast.info("Guardado (TODO: conectar a backend)")}
            >
              <Save className="w-4 h-4" />
              Guardar
            </Button>
            <Button
              size="sm"
              className="gap-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => toast.info("Exportación próximamente")}
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </header>

        {/* ── MAIN AREA (3 columns) ────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT: vertical media strip */}
          <div className="flex flex-col w-20 shrink-0 bg-gray-800 border-r border-gray-700">
            <div className="px-1 py-2 text-[10px] text-gray-500 text-center font-medium uppercase tracking-wide">
              Clips
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-col items-center gap-1 px-1 pb-2">
                {clips.map((clip, index) => (
                  <MediaStripThumb
                    key={clip.id}
                    clip={clip}
                    index={index}
                    isSelected={index === currentClipIndex}
                    onSelect={() => updateState({ currentClipIndex: index })}
                    onRemove={() => handleRemoveClip(clip.id)}
                  />
                ))}
                {clips.length < MAX_CLIPS && (
                  <button
                    className="flex items-center justify-center w-16 h-12 border-2 border-dashed border-gray-600 rounded hover:border-purple-400 transition-colors"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    <Plus className="w-4 h-4 text-gray-500 hover:text-purple-400" />
                  </button>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* CENTER: preview */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              {currentClip && currentClip.mediaUrl ? (
                <div className="relative max-w-full max-h-full">
                  {currentClip.mediaType === "image" ? (
                    <img
                      src={currentClip.mediaUrl}
                      alt={currentClip.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      style={{ maxHeight: "calc(100vh - 280px)" }}
                    />
                  ) : (
                    <video
                      src={currentClip.mediaUrl}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      style={{ maxHeight: "calc(100vh - 280px)" }}
                      controls={false}
                      autoPlay={isPlaying}
                      loop={false}
                      muted
                    />
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 rounded px-2 py-0.5 text-xs text-gray-300">
                    {currentClipIndex + 1} / {clips.length} · {(currentClip.duration / 1000).toFixed(1)}s
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-700 rounded-xl p-12 cursor-pointer hover:border-purple-500 transition-colors"
                  style={{ minWidth: 320, minHeight: 200 }}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <FileVideo className="w-14 h-14 text-gray-600" />
                  <p className="text-lg font-medium text-gray-400">Vista previa</p>
                  <p className="text-sm text-gray-600 text-center max-w-xs">
                    Haz clic para cargar fotos o videos (máx {MAX_CLIPS} clips)
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-gray-600 text-gray-300 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      mediaInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Cargar medios
                  </Button>
                </div>
              )}
            </div>
            {/* Playback controls strip */}
            {clips.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-2 border-t border-gray-800 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  disabled={currentClipIndex === 0}
                  onClick={() => updateState({ currentClipIndex: currentClipIndex - 1 })}
                >
                  ⏮
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 px-4"
                  onClick={() => updateState({ isPlaying: !isPlaying })}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  disabled={currentClipIndex >= clips.length - 1}
                  onClick={() => updateState({ currentClipIndex: currentClipIndex + 1 })}
                >
                  ⏭
                </Button>
                <span className="text-xs text-gray-500 ml-2">
                  {totalDurationSec.toFixed(1)}s total
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: control panel */}
          <div className="w-64 shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Todos Botones Aquí
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {/* Media */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-gray-500 font-medium uppercase">Medios</p>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleMediaFiles(e.target.files)}
                  />
                  <Button
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                    onClick={() => mediaInputRef.current?.click()}
                    disabled={clips.length >= MAX_CLIPS}
                  >
                    <Upload className="w-4 h-4" />
                    Cargar medios
                  </Button>
                  <p className="text-[10px] text-gray-600 text-center">
                    {clips.length}/{MAX_CLIPS} clips
                  </p>
                </div>

                <div className="h-px bg-gray-700" />

                {/* Actions */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-gray-500 font-medium uppercase">Acciones</p>
                  <Button
                    className="w-full gap-2"
                    size="sm"
                    variant="outline"
                    onClick={() => updateState({ isPlaying: !isPlaying })}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Pausar" : "Reproducir"}
                  </Button>
                  <Button
                    className="w-full gap-2"
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Guardado (TODO)")}
                  >
                    <Save className="w-4 h-4" />
                    Guardar proyecto
                  </Button>
                  <Button
                    className="w-full gap-2 bg-green-700 hover:bg-green-600"
                    size="sm"
                    onClick={() => toast.info("Exportación de video próximamente")}
                  >
                    <Download className="w-4 h-4" />
                    Exportar video
                  </Button>
                </div>

                <div className="h-px bg-gray-700" />

                {/* Transitions panel */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-500 font-medium uppercase">Transiciones</p>
                    {clips.length > 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 px-1 text-[10px] text-gray-400 hover:text-white"
                          >
                            Aplicar a todos <ChevronDown className="w-3 h-3 ml-0.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          {AVAILABLE_TRANSITIONS.map((t) => (
                            <DropdownMenuItem
                              key={t.type}
                              className="text-gray-200 hover:bg-gray-700 cursor-pointer"
                              onClick={() => applyTransitionToAll(t.type)}
                            >
                              {t.icon} {t.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Arrastra una tarjeta al "+" entre clips
                  </p>
                  <SortableContext
                    items={AVAILABLE_TRANSITIONS.map((t) => `tc-${t.type}`)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="grid grid-cols-3 gap-1.5">
                      {AVAILABLE_TRANSITIONS.map((t) => (
                        <TransitionCard key={t.type} {...t} />
                      ))}
                    </div>
                  </SortableContext>
                </div>

                <div className="h-px bg-gray-700" />

                {/* Audio */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-gray-500 font-medium uppercase">Audio</p>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioFile(file);
                    }}
                  />
                  <Button
                    className="w-full gap-2"
                    size="sm"
                    variant="outline"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <Music className="w-4 h-4" />
                    Agregar audio
                  </Button>
                  {audioTracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 bg-gray-700 rounded px-2 py-1"
                    >
                      <Volume2 className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-[10px] text-gray-300 truncate flex-1">{track.name}</span>
                      <button
                        onClick={() => handleRemoveAudio(track.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* ── BOTTOM: Timeline + Audio ──────────────────────── */}
        <div className="shrink-0 bg-gray-850 border-t border-gray-700" style={{ background: "#1a1d23" }}>
          {/* Timeline */}
          <div className="border-b border-gray-700">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
                Timeline de video
              </span>
              <span className="ml-auto text-[10px] text-gray-600">
                {clips.length}/{MAX_CLIPS} clips · {totalDurationSec.toFixed(1)}s
              </span>
            </div>
            <div className="px-3 pb-3 overflow-x-auto">
              {clips.length === 0 ? (
                <div
                  className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg py-4 cursor-pointer hover:border-purple-500 transition-colors"
                  style={{ minHeight: 72 }}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <p className="text-xs text-gray-600">
                    Arrastra medios aquí o haz clic en "Cargar medios"
                  </p>
                </div>
              ) : (
                <SortableContext items={clips.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                  <div className="flex items-center gap-0" style={{ minWidth: "max-content" }}>
                    {clips.map((clip, index) => (
                      <div key={clip.id} className="flex items-center">
                        <SortableClipTile
                          clip={clip}
                          index={index}
                          isSelected={index === currentClipIndex}
                          onSelect={() => updateState({ currentClipIndex: index })}
                        />
                        {index < clips.length - 1 && (
                          <TransitionSlot
                            afterClipId={clip.id}
                            transition={getTransitionForClip(clip.id)}
                            onDrop={(type) => applyTransitionToSlot(clip.id, type)}
                            onApplyAll={applyTransitionToAll}
                          />
                        )}
                      </div>
                    ))}
                    {clips.length < MAX_CLIPS && (
                      <button
                        className="flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-700 rounded hover:border-purple-400 transition-colors ml-2"
                        style={{ width: 80, height: 60 }}
                        onClick={() => mediaInputRef.current?.click()}
                      >
                        <Plus className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>

          {/* Audio timeline */}
          <div>
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Music className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
                Timeline de audio
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-5 px-2 text-[10px] text-gray-500 hover:text-white"
                onClick={() => audioInputRef.current?.click()}
              >
                <Plus className="w-3 h-3 mr-0.5" /> Agregar
              </Button>
            </div>
            <div className="px-3 pb-3 overflow-x-auto">
              {audioTracks.length === 0 ? (
                <div
                  className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg py-3 cursor-pointer hover:border-green-500 transition-colors"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <p className="text-xs text-gray-600">Sin pistas de audio · haz clic para agregar</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {audioTracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 bg-green-900/40 border border-green-800/50 rounded px-2 py-1.5"
                      style={{ minWidth: 200 }}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-xs text-green-300 truncate flex-1">{track.name}</span>
                      <button
                        onClick={() => handleRemoveAudio(track.id)}
                        className="text-red-400 hover:text-red-300 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay (shows what is being dragged) */}
      <DragOverlay>
        {activeTransitionDrag && (
          <div className="bg-purple-600 rounded-lg px-3 py-2 text-white text-sm shadow-xl opacity-90">
            {AVAILABLE_TRANSITIONS.find((t) => t.type === activeTransitionDrag)?.icon}{" "}
            {AVAILABLE_TRANSITIONS.find((t) => t.type === activeTransitionDrag)?.label}
          </div>
        )}
        {activeDragId && !activeDragId.startsWith("tc-") && (() => {
          const clip = clips.find((c) => c.id === activeDragId);
          if (!clip) return null;
          return (
            <div
              className="border-2 border-purple-500 rounded overflow-hidden shadow-2xl opacity-90"
              style={{ width: 80, height: 60 }}
            >
              {clip.mediaUrl ? (
                clip.mediaType === "image" ? (
                  <img src={clip.mediaUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={clip.mediaUrl} className="w-full h-full object-cover" muted />
                )
              ) : (
                <div className="w-full h-full bg-gray-700" />
              )}
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}
