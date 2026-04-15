import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, LayoutTemplate, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_TEMPLATE_PRESETS } from '@/lib/templateRegistry';

export default function TemplatesPage() {
  const [, navigate] = useLocation();

  const templates = useMemo(() => ALL_TEMPLATE_PRESETS, []);

  const openTemplate = (templateId: string) => {
    navigate(`/templates/assign?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 pb-8">
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Plantillas PeraCut</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-5">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const templateId = e.dataTransfer.getData('text/template-id');
            if (templateId) openTemplate(templateId);
          }}
          className="mb-5 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/60 px-4 py-3 text-sm text-purple-800"
        >
          Arrastra una plantilla aquí o haz click en cualquier tarjeta para empezar.
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <button
              key={template.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/template-id', template.id)}
              onClick={() => openTemplate(template.id)}
              className="group rounded-2xl overflow-hidden border bg-white text-left hover:shadow-xl hover:-translate-y-0.5 transition"
            >
              <div className="h-24 bg-gradient-to-br from-slate-800 via-purple-700 to-pink-600 p-3 flex items-start justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white tracking-wide">PeraCut</span>
                {template.isNew ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/90 text-white">Nuevo</span> : null}
              </div>
              <div className="p-3 space-y-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{template.styleName}</h2>
                <p className="text-xs text-gray-600 line-clamp-2">{template.styleDescription}</p>
                <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                  <span>{template.durationMs / 1000}s</span>
                  <span>{template.scenes.length} escenas</span>
                  <span>{template.aspectRatio}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border bg-white p-4 text-sm text-gray-700">
          <p className="flex items-center gap-2 font-semibold text-gray-900"><Sparkles className="w-4 h-4 text-purple-600" /> Flujo CapCut-like</p>
          <p className="mt-1">Seleccionas plantilla, asignas archivos por escena y al pulsar <strong>Siguiente</strong> se monta automático en el editor.</p>
        </div>
      </div>
    </div>
  );
}
