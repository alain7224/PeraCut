import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Image, Video, X } from "lucide-react";
import type { MediaItem } from "@/components/MediaStrip";

interface SortableMediaThumbProps {
  item: MediaItem;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
}

export default function SortableMediaThumb({
  item,
  index,
  isSelected,
  onSelect,
  onRemove,
}: SortableMediaThumbProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
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
      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-colors ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-gray-200 hover:border-gray-400"
      }`}
      onClick={() => onSelect(index)}
    >
      {item.type === "image" ? (
        <img
          src={item.objectUrl}
          alt={item.fileName}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center">
          <video
            src={item.objectUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
            muted
            preload="metadata"
          />
          <Video className="w-6 h-6 text-white relative z-10 drop-shadow pointer-events-none" />
        </div>
      )}

      {/* Type badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 flex items-center justify-center gap-0.5 pointer-events-none">
        {item.type === "image" ? (
          <Image className="w-3 h-3 text-white" />
        ) : (
          <Video className="w-3 h-3 text-white" />
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center transition-colors z-20"
        title="Eliminar"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}
