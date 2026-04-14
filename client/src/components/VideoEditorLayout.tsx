import { useState, useCallback, useRef, type RefObject } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { MediaItem } from "@/components/MediaStrip";
import SortableMediaThumb from "@/components/SortableMediaThumb";
import MusicPanel from "@/components/MusicPanel";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Video,
  Plus,
  ArrowLeft,
  Home,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Save,
  AlertTriangle,
  LayoutTemplate,
  GripVertical,
} from "lucide-react";
import type { TemplatePreset } from "@/lib/templateRegistry";

export interface VideoEditorLayoutProps {
  /* Media items & selection */
  items: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onReorder: (items: MediaItem[]) => void;

  /* Video preview */
  videoRef: RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;

  /* Sidebar controls */
  slowMotionSpeed: number;
  onSlowMotionChange: (v: number) => void;
  transitionType: string;
  onTransitionTypeChange: (v: string) => void;
  transitionDuration: number;
  onTransitionDurationChange: (v: number) => void;

  /* Template */
  loadedTemplate: TemplatePreset | null;
  onChangeTemplate: () => void;

  /* Export / save */
  renderBlocked: boolean;
  exportWarning: string | null;
  onSaveVideo: () => void;
  onNavigateHome: () => void;

  /* Save / export children (ExportSaveDialog wrapper) */
  saveButton?: React.ReactNode;

  /* Hidden file input — the parent owns this */
  fileInput?: React.ReactNode;
}

/**
 * Full-page 3-panel video editor layout:
 *  ┌──────────┬──────────────────────────────┐
 *  │  Sidebar  │      Video Preview           │
 *  │  (tools)  │                              │
 *  │           │                              │
 *  ├──────────┴──────────────────────────────┤
 *  │      Timeline (drag-and-drop strip)      │
 *  └──────────────────────────────────────────┘
 */
export default function VideoEditorLayout({
  items,
  selectedIndex,
  onSelect,
  onRemove,
  onAdd,
  onReorder,
  videoRef,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  slowMotionSpeed,
  onSlowMotionChange,
  transitionType,
  onTransitionTypeChange,
  transitionDuration,
  onTransitionDurationChange,
  loadedTemplate,
  onChangeTemplate,
  renderBlocked,
  exportWarning,
  onSaveVideo,
  onNavigateHome,
  saveButton,
  fileInput,
}: VideoEditorLayoutProps) {
  /* ── Drag-and-drop state ─────────────────────────────────────────────── */
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(items, oldIndex, newIndex);
      onReorder(reordered);

      if (selectedIndex === oldIndex) {
        onSelect(newIndex);
      } else if (
        selectedIndex > Math.min(oldIndex, newIndex) &&
        selectedIndex <= Math.max(oldIndex, newIndex)
      ) {
        onSelect(
          oldIndex < newIndex ? selectedIndex - 1 : selectedIndex + 1,
        );
      }
    },
    [items, selectedIndex, onReorder, onSelect],
  );

  const activeItem = items.find((i) => i.id === activeId) ?? null;
  const selectedMedia = items[selectedIndex] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col">
      {/* Hidden file input owned by parent */}
      {fileInput}

      {/* ── Top header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="gap-2 text-gray-600 hover:text-gray-900 font-medium"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <h1 className="text-xl font-bold ml-1">Editor de Videos</h1>
            {items.length > 0 && (
              <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                {items.length} elemento{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={onAdd}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar archivos</span>
            </Button>

            {exportWarning && (
              <div className="hidden md:flex items-center gap-1 text-amber-600 text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>{exportWarning}</span>
              </div>
            )}

            <Button
              onClick={onSaveVideo}
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              disabled={renderBlocked}
              title={renderBlocked ? "Duración excedida" : "Guardar video"}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar Video</span>
            </Button>

            {saveButton}
          </div>
        </div>
      </div>

      {/* ── Export warning banner ──────────────────────────────── */}
      {exportWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2 text-yellow-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
          {exportWarning}
        </div>
      )}

      {/* ── Main content: sidebar + preview ─────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* LEFT SIDEBAR — tools */}
        <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 order-2 lg:order-1">
          <div className="p-4 space-y-5">
            {/* Speed */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm">Velocidad</h3>
              <label className="text-xs font-medium text-gray-600">
                {slowMotionSpeed.toFixed(2)}x
              </label>
              <Slider
                value={[slowMotionSpeed]}
                onValueChange={(val) => onSlowMotionChange(val[0])}
                min={0.25}
                max={2}
                step={0.25}
                className="w-full"
              />
            </div>

            {/* Transition */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm">Transición</h3>
              <Select value={transitionType} onValueChange={onTransitionTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fundido</SelectItem>
                  <SelectItem value="slide">Barrido</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="wipeLeft">Barrido Izq</SelectItem>
                  <SelectItem value="wipeRight">Barrido Der</SelectItem>
                  <SelectItem value="none">Ninguno</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-xs font-medium text-gray-600">
                Duración: {transitionDuration}ms
              </label>
              <Slider
                value={[transitionDuration]}
                onValueChange={(val) => onTransitionDurationChange(val[0])}
                min={100}
                max={2000}
                step={100}
                className="w-full"
              />
            </div>

            {/* Template */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4 text-green-600" />
                Plantilla
              </h3>
              {loadedTemplate ? (
                <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                  <p className="text-xs font-semibold text-green-800 mb-1">
                    {loadedTemplate.styleName}
                  </p>
                  <p className="text-xs text-green-700">
                    {loadedTemplate.durationMs / 1000}s · {loadedTemplate.aspectRatio}
                  </p>
                  <button
                    className="mt-2 text-xs text-green-600 underline underline-offset-2 hover:text-green-800"
                    onClick={onChangeTemplate}
                  >
                    Cambiar plantilla
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={onChangeTemplate}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  Elegir plantilla
                </Button>
              )}
            </div>

            {/* Music */}
            <MusicPanel />
          </div>
        </aside>

        {/* CENTER — preview area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 order-1 lg:order-2 min-h-[300px]">
          {selectedMedia?.type === "video" ? (
            <div className="w-full max-w-3xl space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={videoRef}
                  src={selectedMedia.objectUrl}
                  className="w-full max-h-[60vh] object-contain"
                  controls
                />
              </div>

              {/* Transport */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={onPrev} disabled={items.length <= 1} title="Anterior">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onPlayPause} title={isPlaying ? "Pausar" : "Reproducir"}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={onNext} disabled={items.length <= 1} title="Siguiente">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  {selectedIndex + 1} / {items.length}
                </span>
              </div>
            </div>
          ) : selectedMedia?.type === "image" ? (
            <div className="w-full max-w-3xl">
              <div className="bg-black rounded-xl overflow-hidden shadow-lg flex justify-center">
                <img
                  src={selectedMedia.objectUrl}
                  alt={selectedMedia.fileName}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={onPrev} disabled={items.length <= 1}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onNext} disabled={items.length <= 1}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  {selectedIndex + 1} / {items.length}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer max-w-lg"
              onClick={onAdd}
            >
              <div className="flex flex-col items-center gap-3">
                <Video className="w-12 h-12 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">
                  Añade fotos y videos para empezar
                </p>
                <p className="text-sm text-gray-500">
                  Selecciona varios archivos a la vez (JPG, PNG, MP4, MOV…)
                </p>
              </div>
            </div>
          )}

          {renderBlocked && (
            <div className="flex items-center justify-center gap-2 text-amber-600 text-sm mt-3">
              <AlertTriangle className="w-4 h-4" />
              <span>La duración total excede el límite de exportación</span>
            </div>
          )}
        </main>
      </div>

      {/* ── BOTTOM — drag-and-drop timeline ──────────────────── */}
      <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-700">
              {items.length === 0
                ? "Timeline vacío — añade archivos"
                : `${items.length} clip${items.length !== 1 ? "s" : ""} · arrastra para reordenar`}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs h-7"
            onClick={onAdd}
          >
            <Plus className="w-3 h-3" />
            Agregar
          </Button>
        </div>

        {items.length === 0 ? (
          <button
            onClick={onAdd}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 hover:border-purple-400 transition-colors text-gray-500 hover:text-purple-500"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">Haz clic para añadir fotos o videos al timeline</span>
          </button>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {items.map((item, idx) => (
                  <SortableMediaThumb
                    key={item.id}
                    item={item}
                    index={idx}
                    isSelected={idx === selectedIndex}
                    onSelect={onSelect}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeItem ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-500 shadow-xl opacity-90">
                  {activeItem.type === "image" ? (
                    <img
                      src={activeItem.objectUrl}
                      alt={activeItem.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
