import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutTemplate } from 'lucide-react';
import TemplateSelector from '@/components/TemplateSelector';
import type { TemplatePreset } from '@/lib/templateRegistry';

export default function TemplatesPage() {
  const [, navigate] = useLocation();

  const handleSelectTemplate = (template: TemplatePreset) => {
    navigate(`/editor?template=${template.id}`);
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Plantillas</h1>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">¿Qué son las plantillas?</h2>
          <p className="text-sm text-gray-600">
            Las plantillas son estructuras de video predefinidas con estilos visuales, transiciones y
            efectos listos para usar. Elige una y añade tus clips — la estructura ya está diseñada.
            Si prefieres control total, crea un video desde cero en{' '}
            <button
              className="text-purple-600 underline underline-offset-2 hover:text-purple-800"
              onClick={() => navigate('/editor?type=video')}
            >
              Edición libre
            </button>
            .
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <TemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
