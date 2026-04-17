import type { ReactNode } from "react";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useState } from "react";

interface CapCutEditorLayoutProps {
  title: string;
  projectName: string;
  onBack: () => void;
  warningBanner?: ReactNode;
  fileInput?: ReactNode;
  leftSidebar: ReactNode;
  centerContent: ReactNode;
  rightSidebar: ReactNode;
  timelineSection: ReactNode;
  headerActions?: ReactNode;
}

/**
 * CapCut-style fixed viewport editor layout (2026)
 *
 * Layout structure:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Header (fixed, glass) - with theme switcher                 │
 * ├──────────┬────────────────────────────┬─────────────────────┤
 * │  Left    │     Center Preview         │      Right          │
 * │ Sidebar  │     (large, fullscreen)    │     Sidebar         │
 * │ (scroll) │                            │     (scroll)        │
 * ├──────────┴────────────────────────────┴─────────────────────┤
 * │ Timeline Section (fixed height, no scroll)                  │
 * │  - Media timeline (seamless clips)                          │
 * │  - Audio timeline                                           │
 * └─────────────────────────────────────────────────────────────┘
 */
export default function CapCutEditorLayout({
  title,
  projectName,
  onBack,
  warningBanner,
  fileInput,
  leftSidebar,
  centerContent,
  rightSidebar,
  timelineSection,
  headerActions,
}: CapCutEditorLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {fileInput}

      {/* Fixed Header with glass effect */}
      <header className="glass-header flex-shrink-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-foreground truncate text-sm sm:text-base">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-2"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span className="hidden md:inline">
                {isFullscreen ? "Minimizar" : "Fullscreen"}
              </span>
            </Button>
            <ThemeSwitcher />
            {headerActions}
          </div>
        </div>
      </header>

      {/* Warning banner */}
      {warningBanner}

      {/* Main content area - fixed to remaining viewport */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_280px] gap-0 overflow-hidden">
        {/* Left Sidebar - scrollable only */}
        <aside className="hidden lg:block glass-sidebar overflow-y-auto overflow-x-hidden border-r border-sidebar-border">
          <div className="p-3">
            {leftSidebar}
          </div>
        </aside>

        {/* Center Preview - large, no scroll */}
        <main className="flex flex-col items-center justify-center p-4 overflow-hidden bg-background/50">
          {centerContent}
        </main>

        {/* Right Sidebar - scrollable only */}
        <aside className="hidden lg:block glass-sidebar overflow-y-auto overflow-x-hidden border-l border-sidebar-border">
          <div className="p-3">
            {rightSidebar}
          </div>
        </aside>
      </div>

      {/* Timeline section - fixed height, no scroll */}
      <section className="flex-shrink-0 glass-panel border-t border-border">
        <div className="p-3 h-[200px] overflow-hidden">
          {timelineSection}
        </div>
      </section>
    </div>
  );
}
