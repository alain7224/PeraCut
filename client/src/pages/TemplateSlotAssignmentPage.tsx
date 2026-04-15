import { useMemo, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { ArrowLeft, Film, ImageIcon, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTemplateById } from '@/lib/templateRegistry';
import {
  autoFillTemplateSlots,
  createDefaultKeyframe,
  saveTemplateAssignment,
  type TemplateAssignedSlot,
} from '@/lib/templateAssignment';

export default function TemplateSlotAssignmentPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const templateId = params.get('template') ?? '';
  const template = useMemo(() => getTemplateById(templateId), [templateId]);

  const [slots, setSlots] = useState<Array<TemplateAssignedSlot | null>>(
    Array.from({ length: template?.scenes.length ?? 0 }, () => null),
  );
  const [autoFillBanner, setAutoFillBanner] = useState<string | null>(null);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border rounded-xl p-6 text-center space-y-3">
          <p className="font-semibold text-gray-900">Plantilla no encontrada</p>
          <Button onClick={() => navigate('/templates')}>Volver a plantillas</Button>
        </div>
      </div>
    );
  }

  const handleSelectFile = (index: number, file: File | null) => {
    if (!file) return;
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    if (mediaType !== 'video' && mediaType !== 'image') return;

    const objectUrl = URL.createObjectURL(file);
    setSlots((prev) => {
      const next = [...prev];
      next[index] = {
        slotIndex: index,
        mediaType,
        objectUrl,
        fileName: file.name,
        keyframes: createDefaultKeyframe(index),
        autoFilled: false,
      };
      return next;
    });
  };

  const handleContinue = () => {
    const payload = autoFillTemplateSlots(template, slots);
    saveTemplateAssignment(payload);

    if (payload.autoFilledCount > 0) {
      setAutoFillBanner(`Se rellenaron ${payload.autoFilledCount} escenas automáticamente.`);
    }

    navigate(`/editor?type=video&template=${template.id}&fromTemplates=1`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/templates')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-bold text-gray-900">Asignar archivos a la plantilla</h1>
            <p className="text-xs text-gray-600">{template.styleName} · {template.durationMs / 1000}s · {template.scenes.length} escenas</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {autoFillBanner && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {autoFillBanner}
          </div>
        )}

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-600">
            Cada ranura acepta <strong>foto o video</strong>. Si dejas ranuras vacías, PeraCut las rellenará alternando medios y variando zoom/pan.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {template.scenes.map((scene, index) => {
            const slot = slots[index];
            return (
              <label key={scene.index} className="rounded-xl border bg-white p-3 flex gap-3 cursor-pointer hover:border-purple-300 transition">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  {slot?.mediaType === 'video' ? <Film className="w-6 h-6 text-purple-600" /> : <ImageIcon className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">Escena {index + 1}</p>
                  <p className="text-xs text-gray-500">{(scene.durationMs / 1000).toFixed(2)}s</p>
                  <p className="text-xs text-gray-700 truncate mt-1">{slot?.fileName ?? 'Toca para elegir archivo'}</p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleSelectFile(index, e.target.files?.[0] ?? null)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-end">
          <Button
            onClick={handleContinue}
            className="btn-boom-b1 h-12 px-8 text-base font-bold bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-5 h-5" /> Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
