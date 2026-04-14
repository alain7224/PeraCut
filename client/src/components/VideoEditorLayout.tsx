import { useState, useCallback } from "react";
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
import { Image, Video, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoEditorLayoutProps {
  items: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onReorder: (items: MediaItem[]) => void;
}

/**
 * VideoEditorLayout wraps the horizontal media strip with @dnd-kit
 * drag-and-drop support so users can reorder clips by dragging thumbnails.
 */
export default function VideoEditorLayout({
  items,
  selectedIndex,
  onSelect,
  onRemove,
  onAdd,
  onReorder,
}: VideoEditorLayoutProps) {
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

      // Keep selection following the item the user was viewing
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">
          {items.length === 0
            ? "Sin archivos"
            : `${items.length} elemento${items.length !== 1 ? "s" : ""} · arrastra para reordenar`}
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

          {/* Drag overlay — floating thumbnail that follows the cursor */}
          <DragOverlay>
            {activeItem ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl opacity-90">
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
  );
}
