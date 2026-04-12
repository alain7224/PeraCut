/**
 * Sistema de plantillas de video predefinidas
 * Permite a usuarios crear videos rápidamente sin empezar de cero
 */

export type TemplateType = 'intro' | 'carousel' | 'montage' | 'presentation' | 'journey' | 'event';

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  thumbnail?: string;
  scenes: TemplateScene[];
  duration: number; // en ms
  aspectRatio: '16:9' | '9:16' | '1:1';
  recommendedMusic?: string;
  tags: string[];
}

export interface TemplateScene {
  index: number;
  duration: number; // en ms
  transition: {
    type: string;
    duration: number;
  };
  layout: {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  effects?: string[];
}

/**
 * Plantillas predefinidas
 */
export const PREDEFINED_TEMPLATES: Record<TemplateType, VideoTemplate> = {
  intro: {
    id: 'template-intro',
    name: 'Introducción',
    description: 'Plantilla de introducción con título y subtítulo',
    type: 'intro',
    scenes: [
      {
        index: 0,
        duration: 3000,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Tu Título Aquí',
          subtitle: 'Subtítulo',
          backgroundColor: '#1a1a2e',
          textColor: '#ffffff',
        },
        effects: ['sepia'],
      },
      {
        index: 1,
        duration: 2000,
        transition: { type: 'slide', duration: 500 },
        layout: {
          title: 'Contenido Principal',
          backgroundColor: '#16213e',
          textColor: '#ffffff',
        },
      },
    ],
    duration: 5500,
    aspectRatio: '16:9',
    recommendedMusic: 'upbeat',
    tags: ['intro', 'presentation', 'professional'],
  },

  carousel: {
    id: 'template-carousel',
    name: 'Carrusel',
    description: 'Plantilla de carrusel para mostrar múltiples imágenes',
    type: 'carousel',
    scenes: [
      {
        index: 0,
        duration: 2000,
        transition: { type: 'slide', duration: 400 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 1,
        duration: 2000,
        transition: { type: 'slide', duration: 400 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 2,
        duration: 2000,
        transition: { type: 'slide', duration: 400 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 3,
        duration: 2000,
        transition: { type: 'fade', duration: 500 },
        layout: { backgroundColor: '#ffffff' },
      },
    ],
    duration: 8400,
    aspectRatio: '9:16',
    recommendedMusic: 'upbeat',
    tags: ['carousel', 'social', 'instagram'],
  },

  montage: {
    id: 'template-montage',
    name: 'Montaje',
    description: 'Plantilla de montaje rápido con transiciones dinámicas',
    type: 'montage',
    scenes: [
      {
        index: 0,
        duration: 1500,
        transition: { type: 'zoom', duration: 300 },
        layout: { backgroundColor: '#000000' },
        effects: ['grain'],
      },
      {
        index: 1,
        duration: 1500,
        transition: { type: 'wipeLeft', duration: 300 },
        layout: { backgroundColor: '#000000' },
        effects: ['grain'],
      },
      {
        index: 2,
        duration: 1500,
        transition: { type: 'zoom', duration: 300 },
        layout: { backgroundColor: '#000000' },
        effects: ['grain'],
      },
      {
        index: 3,
        duration: 1500,
        transition: { type: 'fade', duration: 500 },
        layout: { backgroundColor: '#000000' },
        effects: ['grain'],
      },
      {
        index: 4,
        duration: 2000,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Fin',
          backgroundColor: '#000000',
          textColor: '#ffffff',
        },
      },
    ],
    duration: 8300,
    aspectRatio: '16:9',
    recommendedMusic: 'energetic',
    tags: ['montage', 'fast-paced', 'action'],
  },

  presentation: {
    id: 'template-presentation',
    name: 'Presentación',
    description: 'Plantilla profesional para presentaciones',
    type: 'presentation',
    scenes: [
      {
        index: 0,
        duration: 3000,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Título de Presentación',
          subtitle: 'Subtítulo',
          backgroundColor: '#0f3460',
          textColor: '#ffffff',
        },
      },
      {
        index: 1,
        duration: 3000,
        transition: { type: 'slide', duration: 500 },
        layout: {
          title: 'Punto 1',
          backgroundColor: '#16213e',
          textColor: '#ffffff',
        },
      },
      {
        index: 2,
        duration: 3000,
        transition: { type: 'slide', duration: 500 },
        layout: {
          title: 'Punto 2',
          backgroundColor: '#0f3460',
          textColor: '#ffffff',
        },
      },
      {
        index: 3,
        duration: 3000,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Gracias',
          backgroundColor: '#16213e',
          textColor: '#ffffff',
        },
      },
    ],
    duration: 12500,
    aspectRatio: '16:9',
    recommendedMusic: 'corporate',
    tags: ['presentation', 'business', 'professional'],
  },

  journey: {
    id: 'template-journey',
    name: 'Viaje',
    description: 'Plantilla para documentar un viaje o aventura',
    type: 'journey',
    scenes: [
      {
        index: 0,
        duration: 2500,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Mi Viaje',
          backgroundColor: '#1a1a2e',
          textColor: '#ffffff',
        },
      },
      {
        index: 1,
        duration: 2000,
        transition: { type: 'zoom', duration: 400 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 2,
        duration: 2000,
        transition: { type: 'slide', duration: 400 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 3,
        duration: 2000,
        transition: { type: 'zoom', duration: 400 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 4,
        duration: 2500,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Fin del Viaje',
          backgroundColor: '#1a1a2e',
          textColor: '#ffffff',
        },
      },
    ],
    duration: 11000,
    aspectRatio: '9:16',
    recommendedMusic: 'inspirational',
    tags: ['journey', 'travel', 'adventure'],
  },

  event: {
    id: 'template-event',
    name: 'Evento',
    description: 'Plantilla para capturar momentos de un evento',
    type: 'event',
    scenes: [
      {
        index: 0,
        duration: 2000,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: 'Evento',
          backgroundColor: '#ff6b6b',
          textColor: '#ffffff',
        },
      },
      {
        index: 1,
        duration: 1800,
        transition: { type: 'slide', duration: 300 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 2,
        duration: 1800,
        transition: { type: 'slide', duration: 300 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 3,
        duration: 1800,
        transition: { type: 'slide', duration: 300 },
        layout: { backgroundColor: '#ffffff' },
      },
      {
        index: 4,
        duration: 2000,
        transition: { type: 'fade', duration: 500 },
        layout: {
          title: '¡Gracias por venir!',
          backgroundColor: '#ff6b6b',
          textColor: '#ffffff',
        },
      },
    ],
    duration: 9400,
    aspectRatio: '9:16',
    recommendedMusic: 'celebratory',
    tags: ['event', 'celebration', 'party'],
  },
};

/**
 * Obtiene todas las plantillas disponibles
 */
export function getAllTemplates(): VideoTemplate[] {
  return Object.values(PREDEFINED_TEMPLATES);
}

/**
 * Obtiene una plantilla por tipo
 */
export function getTemplateByType(type: TemplateType): VideoTemplate {
  return PREDEFINED_TEMPLATES[type];
}

/**
 * Busca plantillas por etiqueta
 */
export function searchTemplatesByTag(tag: string): VideoTemplate[] {
  return getAllTemplates().filter((template) =>
    template.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

/**
 * Personaliza una plantilla
 */
export function customizeTemplate(
  template: VideoTemplate,
  customizations: {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    duration?: number;
  }
): VideoTemplate {
  const customized = { ...template };

  if (customizations.title || customizations.subtitle) {
    customized.scenes[0].layout = {
      ...customized.scenes[0].layout,
      title: customizations.title || customized.scenes[0].layout.title,
      subtitle: customizations.subtitle || customized.scenes[0].layout.subtitle,
    };
  }

  if (customizations.backgroundColor || customizations.textColor) {
    customized.scenes = customized.scenes.map((scene) => ({
      ...scene,
      layout: {
        ...scene.layout,
        backgroundColor: customizations.backgroundColor || scene.layout.backgroundColor,
        textColor: customizations.textColor || scene.layout.textColor,
      },
    }));
  }

  if (customizations.duration) {
    customized.duration = customizations.duration;
  }

  return customized;
}

/**
 * Valida plantilla
 */
export function validateTemplate(template: VideoTemplate): boolean {
  if (!template.id || !template.name || !template.type) {
    return false;
  }

  if (template.scenes.length === 0) {
    return false;
  }

  if (template.duration < 1000) {
    return false;
  }

  return true;
}

/**
 * Obtiene plantillas recomendadas por aspecto
 */
export function getTemplatesByAspectRatio(
  aspectRatio: '16:9' | '9:16' | '1:1'
): VideoTemplate[] {
  return getAllTemplates().filter((template) => template.aspectRatio === aspectRatio);
}
