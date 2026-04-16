import { Image, X } from "lucide-react";
import { STICKERS, stickerToDataUrl } from "@/lib/stickers";
import type { StickerItem } from "@/lib/projectSchema";
import type { MediaItem } from "@/components/MediaStrip";

interface Props {
  editorType: "photo" | "video";
  selectedMedia: MediaItem | null;
  currentImage: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewAspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  stickers: StickerItem[];
  onOpenFilePicker: () => void;
  onRemoveSticker: (id: string) => void;
}

const aspectToClass: Record<Props["previewAspectRatio"], string> = {
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:5": "aspect-[4/5]",
};

export default function UnifiedEditorCenterPanel({
  editorType,
  selectedMedia,
  currentImage,
  canvasRef,
  videoRef,
  previewAspectRatio,
  stickers,
  onOpenFilePicker,
  onRemoveSticker,
}: Props) {
  return (
    <div className="h-full flex items-center justify-center">
      {!selectedMedia ? (
        <button
          onClick={onOpenFilePicker}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500 hover:border-purple-400"
        >
          <Image className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Haz clic para cargar imágenes o videos</p>
        </button>
      ) : editorType === "photo" ? (
        currentImage ? (
          <div className={`relative w-full max-w-3xl mx-auto ${aspectToClass[previewAspectRatio]}`}>
            <div className="absolute inset-0 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
              {stickers.map((sticker) => {
                const definition = STICKERS.find((item) => item.id === sticker.stickerId);
                if (!definition) return null;
                return (
                  <div
                    key={sticker.id}
                    className="absolute cursor-move select-none"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                    }}
                  >
                    <img src={stickerToDataUrl(definition)} alt={definition.name} className="w-16 h-16 pointer-events-none" />
                    <button
                      onClick={() => onRemoveSticker(sticker.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">Selecciona una imagen para editar en modo foto.</div>
        )
      ) : selectedMedia.type === "video" ? (
        <video
          ref={videoRef}
          src={selectedMedia.objectUrl}
          className="w-full max-h-[68vh] object-contain rounded-xl bg-black"
          controls
        />
      ) : (
        <img src={selectedMedia.objectUrl} alt={selectedMedia.fileName} className="w-full max-h-[68vh] object-contain rounded-xl bg-black" />
      )}
    </div>
  );
}
