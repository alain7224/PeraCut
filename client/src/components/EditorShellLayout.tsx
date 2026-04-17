import type { ReactNode } from "react";
import { ArrowLeft, Pause, Play, Maximize2, Minimize2, SunMedium, MoonStar, Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorSkin = "light" | "graphite" | "midnight";

interface FlowState {
  hasTemplate: boolean;
  hasMedia: boolean;
  hasTimeline: boolean;
}

interface EditorShellLayoutProps {
  title: string;
  projectName: string;
  onBack: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  skin: EditorSkin;
  onSkinChange: (skin: EditorSkin) => void;
  flowState: FlowState;
  isPreviewExpanded: boolean;
  onTogglePreviewExpanded: () => void;
  warningBanner?: ReactNode;
  fileInput?: ReactNode;
  leftSidebar: ReactNode;
  centerContent: ReactNode;
  rightSidebar: ReactNode;
  timelineMediaTrack: ReactNode;
  timelineAudioTrack: ReactNode;
  timelineControls: ReactNode;
}

export default function EditorShellLayout({
  title,
  projectName,
  onBack,
  isPaused,
  onTogglePause,
  skin,
  onSkinChange,
  flowState,
  isPreviewExpanded,
  onTogglePreviewExpanded,
  warningBanner,
  fileInput,
  leftSidebar,
  centerContent,
  rightSidebar,
  timelineMediaTrack,
  timelineAudioTrack,
  timelineControls,
}: EditorShellLayoutProps) {
  const flowSteps = [
    { key: "template", label: "Plantilla", done: flowState.hasTemplate },
    { key: "media", label: "Media", done: flowState.hasMedia },
    { key: "timeline", label: "Timeline", done: flowState.hasTimeline },
  ] as const;

  const activeStep = !flowState.hasTemplate
    ? "template"
    : !flowState.hasMedia
      ? "media"
      : "timeline";

  const skinOptions: { id: EditorSkin; label: string; icon: ReactNode }[] = [
    { id: "light", label: "Light", icon: <SunMedium className="w-3.5 h-3.5" /> },
    { id: "graphite", label: "Graphite", icon: <Contrast className="w-3.5 h-3.5" /> },
    { id: "midnight", label: "Midnight", icon: <MoonStar className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className={cn("editor-shell h-screen overflow-hidden flex flex-col relative", `skin-${skin}`)}>
      {fileInput}

      <div className="absolute inset-0 pointer-events-none">
        <div className="shell-glow shell-glow-1" />
        <div className="shell-glow shell-glow-2" />
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col gap-3">
        <header className="px-4 pt-4">
          <div className="glass-panel rounded-3xl border border-white/15 shadow-xl flex items-center gap-4 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-[var(--shell-ink)] rounded-full hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
              <div className="min-w-0">
                <h1 className="font-semibold text-[var(--shell-ink)] truncate">{title}</h1>
                <p className="text-xs text-[var(--shell-ink-muted)] truncate">{projectName}</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-1">
              {flowSteps.map((step) => (
                <div
                  key={step.key}
                  className={cn(
                    "flow-chip",
                    step.done ? "flow-chip-done" : "",
                    activeStep === step.key ? "flow-chip-active" : ""
                  )}
                >
                  <span className="text-[11px] font-semibold">{step.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                {skinOptions.map((option) => (
                  <button
                    key={option.id}
                    className={cn(
                      "h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition",
                      skin === option.id ? "bg-white/90 text-slate-900 shadow-sm" : "text-[var(--shell-ink-soft)] hover:text-[var(--shell-ink)]"
                    )}
                    onClick={() => onSkinChange(option.id)}
                    type="button"
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={onTogglePause} className="gap-2 rounded-full border-white/30">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Reproducir" : "Pausar"}
              </Button>
            </div>
          </div>
          {warningBanner ? <div className="mt-2 glass-panel rounded-2xl border border-amber-200/40 shadow-sm">{warningBanner}</div> : null}
        </header>

        <div className="flex-1 min-h-0 px-4 pb-4 grid grid-rows-[1fr_auto] gap-3">
          <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-3">
            <aside className="glass-panel rounded-3xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scroll px-3 py-3">{leftSidebar}</div>
            </aside>

            <main className="glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTogglePreviewExpanded}
                  className="rounded-full border-white/30 bg-white/10 backdrop-blur"
                >
                  {isPreviewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden md:inline text-xs">{isPreviewExpanded ? "Minimizar" : "Fullscreen"}</span>
                </Button>
              </div>

              <div className="flex-1 px-3 md:px-6 pb-4 pt-6 overflow-hidden">
                <div className="preview-surface h-full rounded-3xl border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                  {centerContent}
                </div>
              </div>
            </main>

            <aside className="glass-panel rounded-3xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scroll px-3 py-3">{rightSidebar}</div>
            </aside>
          </div>

          <section className="glass-panel timeline-surface rounded-3xl border border-white/10 shadow-2xl px-4 py-4 space-y-3">
            {timelineControls}

            <div className="space-y-2">
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--shell-ink-muted)]">Pista media</p>
              {timelineMediaTrack}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--shell-ink-muted)]">Pista audio</p>
              {timelineAudioTrack}
            </div>
          </section>
        </div>
      </div>

      {isPreviewExpanded && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-6xl h-full max-h-[90vh] relative">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePreviewExpanded}
              className="absolute right-4 top-4 z-10 rounded-full border-white/30 bg-white/10 backdrop-blur"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="text-xs">Cerrar</span>
            </Button>
            <div className="preview-surface h-full rounded-[28px] border border-white/15 shadow-2xl flex items-center justify-center overflow-hidden">
              {centerContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
