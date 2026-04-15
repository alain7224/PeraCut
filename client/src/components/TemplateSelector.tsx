import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ALL_TEMPLATE_PRESETS,
  TEMPLATE_ASPECT_RATIOS,
  TEMPLATE_DURATIONS,
  type TemplatePreset,
  type TemplateAspectRatio,
} from '@/lib/templateRegistry';
import { X } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: TemplatePreset) => void;
  onClose: () => void;
}

const getDurationLabel = (durationMs: number) => `${Math.round(durationMs / 1000)}s`;

const STYLE_COLORS: Record<string, string> = {
  cutout: 'from-gray-800 to-gray-900',
  split: 'from-blue-700 to-indigo-800',
  flash: 'from-yellow-400 to-orange-500',
  glitch: 'from-purple-700 to-pink-800',
  bars: 'from-stone-700 to-stone-900',
  zoom: 'from-teal-600 to-cyan-700',
};

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<TemplateAspectRatio>('9:16');
  const [selectedDuration, setSelectedDuration] = useState<number>(15000);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset | null>(null);

  const visibleTemplates = ALL_TEMPLATE_PRESETS.filter(
    (t) => t.aspectRatio === selectedAspectRatio && t.durationMs === selectedDuration
  );

  const handleApply = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Elegir Plantilla</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Formato</p>
        <div className="flex gap-3">
          {TEMPLATE_ASPECT_RATIOS.map((ar) => {
            const isPortrait = ar === '9:16';
            const active = selectedAspectRatio === ar;
            return (
              <button
                key={ar}
                onClick={() => {
                  setSelectedAspectRatio(ar);
                  setSelectedTemplate(null);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                  active
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Visual aspect ratio indicator */}
                <div
                  className={`bg-gray-300 rounded-sm ${active ? 'bg-purple-300' : ''}`}
                  style={
                    isPortrait
                      ? { width: 18, height: 32 }
                      : { width: 32, height: 18 }
                  }
                />
                <span className="text-xs font-semibold text-gray-700">{ar}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration Tabs */}
      <Tabs
        value={String(selectedDuration)}
        onValueChange={(v) => {
          setSelectedDuration(Number(v));
          setSelectedTemplate(null);
        }}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="mb-4">
          {TEMPLATE_DURATIONS.map((d) => (
              <TabsTrigger key={d} value={String(d)}>
              {getDurationLabel(d)}
            </TabsTrigger>
          ))}
        </TabsList>

        {TEMPLATE_DURATIONS.map((d) => (
          <TabsContent key={d} value={String(d)} className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-3 pb-4">
              {visibleTemplates.map((template) => {
                const gradientClass = STYLE_COLORS[template.styleId] ?? 'from-gray-600 to-gray-800';
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <Card
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg border-2 ${
                      isSelected ? 'border-purple-500 ring-2 ring-purple-300' : 'border-transparent'
                    }`}
                  >
                    {/* Preview area */}
                    <div
                      className={`bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
                      style={{
                        aspectRatio: template.aspectRatio === '9:16' ? '9/16' : '16/9',
                        maxHeight: 120,
                      }}
                    >
                      <span className="text-white text-xs font-bold opacity-70 uppercase tracking-widest">
                        {template.styleId}
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-900">{template.styleName}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {getDurationLabel(template.durationMs)}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2">{template.styleDescription}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Apply button */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={!selectedTemplate}
          onClick={handleApply}
        >
          Aplicar Plantilla
        </Button>
      </div>
    </div>
  );
}
