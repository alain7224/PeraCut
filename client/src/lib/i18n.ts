/**
 * Sistema de internacionalización para PeraCut
 * Soporta: Español, Inglés, Francés, Rumano, Portugués
 */

export type Language = 'es' | 'en' | 'fr' | 'ro' | 'pt';

export const LANGUAGES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  ro: 'Română',
  pt: 'Português',
};

export const translations: Record<Language, Record<string, string>> = {
  es: {
    // Header
    'app.title': 'PeraCut',
    'app.subtitle': 'Editor de Fotos y Videos con IA',
    'header.logout': 'Cerrar sesión',
    'header.settings': 'Ajustes',
    'header.language': 'Idioma',

    // Home
    'home.welcome': '¿Qué deseas crear?',
    'home.subtitle': 'Elige el tipo de contenido que deseas editar',
    'home.newProject': '+ Nuevo Proyecto',
    'home.myProjects': 'Mis Proyectos',
    'home.noProjects': 'No hay proyectos aún',
    'home.createFirst': 'Crea tu primer proyecto',

    // Project Types
    'project.photo': 'Editar Foto',
    'project.photoDesc': 'Crea imágenes hasta 4000x4000px con IA',
    'project.video': 'Editar Video',
    'project.videoDesc': 'Crea videos de 15 segundos con 5-8 escenas',
    'project.record': 'Grabar Ahora',
    'project.recordDesc': 'Graba video o audio directamente',

    // Editor
    'editor.title': 'Editor',
    'editor.tools': 'Herramientas',
    'editor.ai': 'IA',
    'editor.save': 'Guardar',
    'editor.export': 'Exportar',
    'editor.undo': 'Deshacer',
    'editor.redo': 'Rehacer',
    'editor.reset': 'Reiniciar',

    // Filters
    'filter.none': 'Ninguno',
    'filter.blackwhite': 'Blanco y Negro',
    'filter.sepia': 'Sepia',
    'filter.vintage': 'Vintage',
    'filter.cool': 'Frío',
    'filter.warm': 'Cálido',
    'filter.saturated': 'Saturado',

    // Effects
    'effect.blur': 'Desenfoque',
    'effect.sharpen': 'Nitidez',
    'effect.vignette': 'Viñeta',
    'effect.grain': 'Grano',
    'effect.chromatic': 'Aberración Cromática',

    // Transitions
    'transition.fade': 'Desvanecimiento',
    'transition.slide': 'Deslizar',
    'transition.zoom': 'Zoom',
    'transition.wipeLeft': 'Barrido Izq',
    'transition.wipeRight': 'Barrido Der',
    'transition.none': 'Ninguno',

    // Controls
    'control.brightness': 'Brillo',
    'control.contrast': 'Contraste',
    'control.saturation': 'Saturación',
    'control.rotation': 'Rotación',
    'control.opacity': 'Opacidad',
    'control.scale': 'Escala',

    // Text
    'text.addText': 'Agregar Texto',
    'text.fontSize': 'Tamaño de Fuente',
    'text.color': 'Color',
    'text.alignment': 'Alineación',
    'text.bold': 'Negrita',
    'text.italic': 'Cursiva',

    // Audio
    'audio.addAudio': 'Agregar Audio',
    'audio.removeAudio': 'Quitar Audio',
    'audio.volume': 'Volumen',
    'audio.mute': 'Silenciar',

    // Templates
    'template.intro': 'Intro',
    'template.carousel': 'Carrusel',
    'template.montage': 'Montaje',
    'template.presentation': 'Presentación',
    'template.travel': 'Viaje',
    'template.event': 'Evento',

    // Social
    'social.share': 'Compartir',
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.download': 'Descargar',

    // Settings
    'settings.title': 'Ajustes',
    'settings.theme': 'Tema',
    'settings.background': 'Fondo',
    'settings.language': 'Idioma',
    'settings.quality': 'Calidad',
    'settings.storage': 'Almacenamiento',
    'settings.about': 'Acerca de',

    // Messages
    'message.success': 'Éxito',
    'message.error': 'Error',
    'message.loading': 'Cargando...',
    'message.saved': 'Guardado correctamente',
    'message.exported': 'Exportado correctamente',
    'message.deleted': 'Eliminado correctamente',
  },

  en: {
    // Header
    'app.title': 'PeraCut',
    'app.subtitle': 'AI-Powered Photo & Video Editor',
    'header.logout': 'Logout',
    'header.settings': 'Settings',
    'header.language': 'Language',

    // Home
    'home.welcome': 'What do you want to create?',
    'home.subtitle': 'Choose the type of content you want to edit',
    'home.newProject': '+ New Project',
    'home.myProjects': 'My Projects',
    'home.noProjects': 'No projects yet',
    'home.createFirst': 'Create your first project',

    // Project Types
    'project.photo': 'Edit Photo',
    'project.photoDesc': 'Create images up to 4000x4000px with AI',
    'project.video': 'Edit Video',
    'project.videoDesc': 'Create 15-second videos with 5-8 scenes',
    'project.record': 'Record Now',
    'project.recordDesc': 'Record video or audio directly',

    // Editor
    'editor.title': 'Editor',
    'editor.tools': 'Tools',
    'editor.ai': 'AI',
    'editor.save': 'Save',
    'editor.export': 'Export',
    'editor.undo': 'Undo',
    'editor.redo': 'Redo',
    'editor.reset': 'Reset',

    // Filters
    'filter.none': 'None',
    'filter.blackwhite': 'Black & White',
    'filter.sepia': 'Sepia',
    'filter.vintage': 'Vintage',
    'filter.cool': 'Cool',
    'filter.warm': 'Warm',
    'filter.saturated': 'Saturated',

    // Effects
    'effect.blur': 'Blur',
    'effect.sharpen': 'Sharpen',
    'effect.vignette': 'Vignette',
    'effect.grain': 'Grain',
    'effect.chromatic': 'Chromatic Aberration',

    // Transitions
    'transition.fade': 'Fade',
    'transition.slide': 'Slide',
    'transition.zoom': 'Zoom',
    'transition.wipeLeft': 'Wipe Left',
    'transition.wipeRight': 'Wipe Right',
    'transition.none': 'None',

    // Controls
    'control.brightness': 'Brightness',
    'control.contrast': 'Contrast',
    'control.saturation': 'Saturation',
    'control.rotation': 'Rotation',
    'control.opacity': 'Opacity',
    'control.scale': 'Scale',

    // Text
    'text.addText': 'Add Text',
    'text.fontSize': 'Font Size',
    'text.color': 'Color',
    'text.alignment': 'Alignment',
    'text.bold': 'Bold',
    'text.italic': 'Italic',

    // Audio
    'audio.addAudio': 'Add Audio',
    'audio.removeAudio': 'Remove Audio',
    'audio.volume': 'Volume',
    'audio.mute': 'Mute',

    // Templates
    'template.intro': 'Intro',
    'template.carousel': 'Carousel',
    'template.montage': 'Montage',
    'template.presentation': 'Presentation',
    'template.travel': 'Travel',
    'template.event': 'Event',

    // Social
    'social.share': 'Share',
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.download': 'Download',

    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.background': 'Background',
    'settings.language': 'Language',
    'settings.quality': 'Quality',
    'settings.storage': 'Storage',
    'settings.about': 'About',

    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.loading': 'Loading...',
    'message.saved': 'Saved successfully',
    'message.exported': 'Exported successfully',
    'message.deleted': 'Deleted successfully',
  },

  fr: {
    // Header
    'app.title': 'PeraCut',
    'app.subtitle': 'Éditeur de Photos et Vidéos avec IA',
    'header.logout': 'Déconnexion',
    'header.settings': 'Paramètres',
    'header.language': 'Langue',

    // Home
    'home.welcome': 'Que voulez-vous créer?',
    'home.subtitle': 'Choisissez le type de contenu que vous souhaitez éditer',
    'home.newProject': '+ Nouveau Projet',
    'home.myProjects': 'Mes Projets',
    'home.noProjects': 'Pas de projets encore',
    'home.createFirst': 'Créez votre premier projet',

    // Project Types
    'project.photo': 'Éditer Photo',
    'project.photoDesc': 'Créez des images jusqu\'à 4000x4000px avec IA',
    'project.video': 'Éditer Vidéo',
    'project.videoDesc': 'Créez des vidéos de 15 secondes avec 5-8 scènes',
    'project.record': 'Enregistrer Maintenant',
    'project.recordDesc': 'Enregistrez une vidéo ou un audio directement',

    // Editor
    'editor.title': 'Éditeur',
    'editor.tools': 'Outils',
    'editor.ai': 'IA',
    'editor.save': 'Enregistrer',
    'editor.export': 'Exporter',
    'editor.undo': 'Annuler',
    'editor.redo': 'Rétablir',
    'editor.reset': 'Réinitialiser',

    // Filters
    'filter.none': 'Aucun',
    'filter.blackwhite': 'Noir et Blanc',
    'filter.sepia': 'Sépia',
    'filter.vintage': 'Vintage',
    'filter.cool': 'Froid',
    'filter.warm': 'Chaud',
    'filter.saturated': 'Saturé',

    // Effects
    'effect.blur': 'Flou',
    'effect.sharpen': 'Netteté',
    'effect.vignette': 'Vignetage',
    'effect.grain': 'Grain',
    'effect.chromatic': 'Aberration Chromatique',

    // Transitions
    'transition.fade': 'Fondu',
    'transition.slide': 'Glissement',
    'transition.zoom': 'Zoom',
    'transition.wipeLeft': 'Balayage Gauche',
    'transition.wipeRight': 'Balayage Droite',
    'transition.none': 'Aucun',

    // Controls
    'control.brightness': 'Luminosité',
    'control.contrast': 'Contraste',
    'control.saturation': 'Saturation',
    'control.rotation': 'Rotation',
    'control.opacity': 'Opacité',
    'control.scale': 'Échelle',

    // Text
    'text.addText': 'Ajouter du Texte',
    'text.fontSize': 'Taille de Police',
    'text.color': 'Couleur',
    'text.alignment': 'Alignement',
    'text.bold': 'Gras',
    'text.italic': 'Italique',

    // Audio
    'audio.addAudio': 'Ajouter Audio',
    'audio.removeAudio': 'Supprimer Audio',
    'audio.volume': 'Volume',
    'audio.mute': 'Muet',

    // Templates
    'template.intro': 'Intro',
    'template.carousel': 'Carrousel',
    'template.montage': 'Montage',
    'template.presentation': 'Présentation',
    'template.travel': 'Voyage',
    'template.event': 'Événement',

    // Social
    'social.share': 'Partager',
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.download': 'Télécharger',

    // Settings
    'settings.title': 'Paramètres',
    'settings.theme': 'Thème',
    'settings.background': 'Arrière-plan',
    'settings.language': 'Langue',
    'settings.quality': 'Qualité',
    'settings.storage': 'Stockage',
    'settings.about': 'À propos',

    // Messages
    'message.success': 'Succès',
    'message.error': 'Erreur',
    'message.loading': 'Chargement...',
    'message.saved': 'Enregistré avec succès',
    'message.exported': 'Exporté avec succès',
    'message.deleted': 'Supprimé avec succès',
  },

  ro: {
    // Header
    'app.title': 'PeraCut',
    'app.subtitle': 'Editor de Fotografii și Videoclipuri cu IA',
    'header.logout': 'Deconectare',
    'header.settings': 'Setări',
    'header.language': 'Limba',

    // Home
    'home.welcome': 'Ce doriți să creați?',
    'home.subtitle': 'Alegeți tipul de conținut pe care doriți să-l editați',
    'home.newProject': '+ Proiect Nou',
    'home.myProjects': 'Proiectele Mele',
    'home.noProjects': 'Niciun proiect încă',
    'home.createFirst': 'Creați-vă primul proiect',

    // Project Types
    'project.photo': 'Editare Fotografie',
    'project.photoDesc': 'Creați imagini până la 4000x4000px cu IA',
    'project.video': 'Editare Video',
    'project.videoDesc': 'Creați videoclipuri de 15 secunde cu 5-8 scene',
    'project.record': 'Înregistrare Acum',
    'project.recordDesc': 'Înregistrați video sau audio direct',

    // Editor
    'editor.title': 'Editor',
    'editor.tools': 'Instrumente',
    'editor.ai': 'IA',
    'editor.save': 'Salvare',
    'editor.export': 'Export',
    'editor.undo': 'Anulare',
    'editor.redo': 'Refacere',
    'editor.reset': 'Reinitializare',

    // Filters
    'filter.none': 'Niciunul',
    'filter.blackwhite': 'Alb și Negru',
    'filter.sepia': 'Sepia',
    'filter.vintage': 'Vintage',
    'filter.cool': 'Rece',
    'filter.warm': 'Cald',
    'filter.saturated': 'Saturat',

    // Effects
    'effect.blur': 'Estompare',
    'effect.sharpen': 'Ascuțire',
    'effect.vignette': 'Vignetă',
    'effect.grain': 'Granulă',
    'effect.chromatic': 'Aberație Cromatică',

    // Transitions
    'transition.fade': 'Atenuare',
    'transition.slide': 'Glisare',
    'transition.zoom': 'Zoom',
    'transition.wipeLeft': 'Ștergere Stânga',
    'transition.wipeRight': 'Ștergere Dreapta',
    'transition.none': 'Niciunul',

    // Controls
    'control.brightness': 'Luminozitate',
    'control.contrast': 'Contrast',
    'control.saturation': 'Saturație',
    'control.rotation': 'Rotație',
    'control.opacity': 'Opacitate',
    'control.scale': 'Scară',

    // Text
    'text.addText': 'Adăugare Text',
    'text.fontSize': 'Dimensiune Font',
    'text.color': 'Culoare',
    'text.alignment': 'Aliniere',
    'text.bold': 'Gras',
    'text.italic': 'Italic',

    // Audio
    'audio.addAudio': 'Adăugare Audio',
    'audio.removeAudio': 'Eliminare Audio',
    'audio.volume': 'Volum',
    'audio.mute': 'Mut',

    // Templates
    'template.intro': 'Intro',
    'template.carousel': 'Carusel',
    'template.montage': 'Montaj',
    'template.presentation': 'Prezentare',
    'template.travel': 'Călătorie',
    'template.event': 'Eveniment',

    // Social
    'social.share': 'Partajare',
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.download': 'Descărcare',

    // Settings
    'settings.title': 'Setări',
    'settings.theme': 'Temă',
    'settings.background': 'Fundal',
    'settings.language': 'Limba',
    'settings.quality': 'Calitate',
    'settings.storage': 'Stocare',
    'settings.about': 'Despre',

    // Messages
    'message.success': 'Succes',
    'message.error': 'Eroare',
    'message.loading': 'Se încarcă...',
    'message.saved': 'Salvat cu succes',
    'message.exported': 'Exportat cu succes',
    'message.deleted': 'Șters cu succes',
  },

  pt: {
    // Header
    'app.title': 'PeraCut',
    'app.subtitle': 'Editor de Fotos e Vídeos com IA',
    'header.logout': 'Sair',
    'header.settings': 'Configurações',
    'header.language': 'Idioma',

    // Home
    'home.welcome': 'O que você quer criar?',
    'home.subtitle': 'Escolha o tipo de conteúdo que deseja editar',
    'home.newProject': '+ Novo Projeto',
    'home.myProjects': 'Meus Projetos',
    'home.noProjects': 'Nenhum projeto ainda',
    'home.createFirst': 'Crie seu primeiro projeto',

    // Project Types
    'project.photo': 'Editar Foto',
    'project.photoDesc': 'Crie imagens até 4000x4000px com IA',
    'project.video': 'Editar Vídeo',
    'project.videoDesc': 'Crie vídeos de 15 segundos com 5-8 cenas',
    'project.record': 'Gravar Agora',
    'project.recordDesc': 'Grave vídeo ou áudio diretamente',

    // Editor
    'editor.title': 'Editor',
    'editor.tools': 'Ferramentas',
    'editor.ai': 'IA',
    'editor.save': 'Salvar',
    'editor.export': 'Exportar',
    'editor.undo': 'Desfazer',
    'editor.redo': 'Refazer',
    'editor.reset': 'Reiniciar',

    // Filters
    'filter.none': 'Nenhum',
    'filter.blackwhite': 'Preto e Branco',
    'filter.sepia': 'Sépia',
    'filter.vintage': 'Vintage',
    'filter.cool': 'Frio',
    'filter.warm': 'Quente',
    'filter.saturated': 'Saturado',

    // Effects
    'effect.blur': 'Desfoque',
    'effect.sharpen': 'Nitidez',
    'effect.vignette': 'Vinheta',
    'effect.grain': 'Grão',
    'effect.chromatic': 'Aberração Cromática',

    // Transitions
    'transition.fade': 'Desvanecimento',
    'transition.slide': 'Deslizar',
    'transition.zoom': 'Zoom',
    'transition.wipeLeft': 'Varredura Esq',
    'transition.wipeRight': 'Varredura Dir',
    'transition.none': 'Nenhum',

    // Controls
    'control.brightness': 'Brilho',
    'control.contrast': 'Contraste',
    'control.saturation': 'Saturação',
    'control.rotation': 'Rotação',
    'control.opacity': 'Opacidade',
    'control.scale': 'Escala',

    // Text
    'text.addText': 'Adicionar Texto',
    'text.fontSize': 'Tamanho da Fonte',
    'text.color': 'Cor',
    'text.alignment': 'Alinhamento',
    'text.bold': 'Negrito',
    'text.italic': 'Itálico',

    // Audio
    'audio.addAudio': 'Adicionar Áudio',
    'audio.removeAudio': 'Remover Áudio',
    'audio.volume': 'Volume',
    'audio.mute': 'Mudo',

    // Templates
    'template.intro': 'Intro',
    'template.carousel': 'Carrossel',
    'template.montage': 'Montagem',
    'template.presentation': 'Apresentação',
    'template.travel': 'Viagem',
    'template.event': 'Evento',

    // Social
    'social.share': 'Compartilhar',
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    'social.facebook': 'Facebook',
    'social.instagram': 'Instagram',
    'social.download': 'Baixar',

    // Settings
    'settings.title': 'Configurações',
    'settings.theme': 'Tema',
    'settings.background': 'Fundo',
    'settings.language': 'Idioma',
    'settings.quality': 'Qualidade',
    'settings.storage': 'Armazenamento',
    'settings.about': 'Sobre',

    // Messages
    'message.success': 'Sucesso',
    'message.error': 'Erro',
    'message.loading': 'Carregando...',
    'message.saved': 'Salvo com sucesso',
    'message.exported': 'Exportado com sucesso',
    'message.deleted': 'Deletado com sucesso',
  },
};

/**
 * Hook para obtener traducción
 */
export function useTranslation(language: Language) {
  return (key: string, defaultValue?: string): string => {
    return translations[language]?.[key] || defaultValue || key;
  };
}

/**
 * Obtener idioma del navegador
 */
export function getBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'es';

  const lang = navigator.language.split('-')[0].toLowerCase();

  if (lang === 'es') return 'es';
  if (lang === 'en') return 'en';
  if (lang === 'fr') return 'fr';
  if (lang === 'ro') return 'ro';
  if (lang === 'pt') return 'pt';

  return 'es'; // Default to Spanish
}

/**
 * Guardar idioma en localStorage
 */
export function setLanguage(language: Language): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('peracut-language', language);
  }
}

/**
 * Obtener idioma guardado o del navegador
 */
export function getLanguage(): Language {
  if (typeof localStorage === 'undefined') return getBrowserLanguage();

  const saved = localStorage.getItem('peracut-language') as Language | null;
  return saved || getBrowserLanguage();
}
