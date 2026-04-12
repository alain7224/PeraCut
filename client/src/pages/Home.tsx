import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LANGUAGES, translations, type Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Video, Mic, Settings, LogOut, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663287789737/MuedJEETeftFMeBGAmYga5/peracut-logo-7jjx5QyvZTJ9KfbBdzD8sv.webp';
const FAVICON_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663287789737/MuedJEETeftFMeBGAmYga5/peracut-favicon-6drN6G6m9pueZU3eU27mS7.webp';

export default function Home() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [language, setLanguageState] = useState<Language>('es');
  const [backgroundType, setBackgroundType] = useState<'color' | 'video'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#f5f5f5');
  const [backgroundColorOklch, setBackgroundColorOklch] = useState('oklch(0.96 0.002 286)');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Cargar idioma guardado
    const savedLang = localStorage.getItem('peracut-language') as Language | null;
    if (savedLang && Object.keys(LANGUAGES).includes(savedLang)) {
      setLanguageState(savedLang);
    }
    // Cargar proyectos del usuario
    // TODO: Implementar carga de proyectos desde API
  }, []);

  const t = (key: string, defaultValue?: string): string => {
    return translations[language]?.[key] || defaultValue || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('peracut-language', lang);
  };

  // Convertir hex a oklch para CSS
  const hexToOklch = (hex: string): string => {
    // Para este MVP, retornamos oklch por defecto
    // En producción, usar una librería como color-convert
    return backgroundColorOklch;
  };

  const handleNewProject = (type: 'photo' | 'video' | 'record') => {
    navigate(`/editor?type=${type}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: backgroundType === 'color' ? backgroundColor : '#f5f5f5',
        backgroundImage: backgroundType === 'video' ? 'linear-gradient(135deg, rgba(101, 84, 192, 0.1) 0%, rgba(255, 154, 158, 0.1) 100%)' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <img
              src={FAVICON_URL}
              alt="PeraCut"
              className="h-8 w-8 rounded-lg shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">PeraCut</h1>
              <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Selector de Idioma */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">{LANGUAGES[language]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={language === lang ? 'bg-accent' : ''}
                  >
                    {LANGUAGES[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ajustes */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('settings.background')}</label>
                    <Select value={backgroundType} onValueChange={(v) => setBackgroundType(v as 'color' | 'video')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">{t('settings.theme')}</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {backgroundType === 'color' && (
                    <div>
                      <label className="text-sm font-medium">{t('settings.theme')}</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          // Guardar también en oklch para CSS
                          setBackgroundColorOklch(`oklch(0.96 0.002 ${Math.random() * 360})`);
                        }}
                        className="h-10 w-full rounded border"
                      />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Logout */}
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Bienvenida */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{t('home.welcome')}</h2>
          <p className="mt-2 text-muted-foreground">{t('home.subtitle')}</p>
        </div>

        {/* Opciones de Proyecto */}
        <div className="grid gap-4 sm:grid-cols-3 w-full max-w-4xl mb-12">
          {/* Editar Foto */}
          <Card
            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
            onClick={() => handleNewProject('photo')}
          >
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{t('project.photo')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('project.photoDesc')}</p>
            </div>
          </Card>

          {/* Editar Video */}
          <Card
            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800"
            onClick={() => handleNewProject('video')}
          >
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-purple-500/20 p-3">
                  <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{t('project.video')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('project.videoDesc')}</p>
            </div>
          </Card>

          {/* Grabar Ahora */}
          <Card
            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800"
            onClick={() => handleNewProject('record')}
          >
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-red-500/20 p-3">
                  <Mic className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{t('project.record')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('project.recordDesc')}</p>
            </div>
          </Card>
        </div>

        {/* Mis Proyectos */}
        {projects.length > 0 && (
          <div className="w-full max-w-4xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">{t('home.myProjects')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                  onClick={() => navigate(`/editor/${project.id}`)}
                >
                  <div className="aspect-video bg-muted" />
                  <div className="p-4">
                    <h4 className="font-medium text-foreground">{project.name}</h4>
                    <p className="text-xs text-muted-foreground">{project.type}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">{t('home.noProjects')}</p>
            <p className="text-sm text-muted-foreground">{t('home.createFirst')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
