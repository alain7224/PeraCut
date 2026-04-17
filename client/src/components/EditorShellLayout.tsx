import { useState, type ReactNode } from "react";
import { ArrowLeft, Pause, Play, Maximize2, Minimize2, Sun, Layers, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EditorSkin = "light" | "graphite" | "midnight";

interface EditorShellLayoutProps {
  title: string;
  projectName: string;
  onBack: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  warningBanner?: ReactNode;
  fileInput?: ReactNode;
  leftSidebar: ReactNode;
  centerContent: ReactNode;
  rightSidebar: ReactNode;
  timelineMediaTrack: ReactNode;
  timelineAudioTrack: ReactNode;
  timelineControls: ReactNode;
  skin?: EditorSkin;
  onSkinChange?: (skin: EditorSkin) => void;
}

const SKIN_CYCLE: EditorSkin[] = ["light", "graphite", "midnight"];

const SKIN_LABELS: Record<EditorSkin, string> = {
  light: "Claro",
  graphite: "Grafito",
  midnight: "Medianoche",
};

function SkinIcon({ skin }: { skin: EditorSkin }) {
  if (skin === "graphite") return <Layers className="w-3.5 h-3.5" />;
  if (skin === "midnight") return <Moon className="w-3.5 h-3.5" />;
  return <Sun className="w-3.5 h-3.5" />;
}

export default function EditorShellLayout({
  title,
  projectName,
  onBack,
  isPaused,
  onTogglePause,
  warningBanner,
  fileInput,
  leftSidebar,
  centerContent,
  rightSidebar,
  timelineMediaTrack,
  timelineAudioTrack,
  timelineControls,
  skin = "light",
  onSkinChange,
}: EditorShellLayoutProps) {
  const [centerFull, setCenterFull] = useState(false);

  const nextSkin = SKIN_CYCLE[(SKIN_CYCLE.indexOf(skin) + 1) % SKIN_CYCLE.length];

  return (
    <div
      data-editor-skin={skin}
      className="h-[100dvh] overflow-hidden flex flex-col"
      style={{ background: "var(--sk-shell-bg)" }}
    >
      {fileInput}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 z-30 backdrop-blur-md"
        style={{
          background: "var(--sk-header-bg)",
          borderBottom: "1px solid var(--sk-header-border)",
        }}
      >
        <div className="px-3 h-12 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--sk-header-text)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="min-w-0 hidden sm:block">
              <p
                className="text-sm font-semibold truncate leading-tight"
                style={{ color: "var(--sk-header-text)" }}
              >
                {title}
              </p>
              <p
                className="text-xs truncate leading-tight"
                style={{ color: "var(--sk-header-subtext)" }}
              >
                {projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onTogglePause}
              className="gap-1.5 h-8 text-xs hover:opacity-80"
              style={{
                color: "var(--sk-header-text)",
                border: "1px solid var(--sk-header-border)",
              }}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPaused ? "Reproducir" : "Pausar"}</span>
            </Button>

            {/* Skin switcher — cycles through light → graphite → midnight */}
            <button
              onClick={() => onSkinChange?.(nextSkin)}
              title={`Skin: ${SKIN_LABELS[skin]} → ${SKIN_LABELS[nextSkin]}`}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-opacity hover:opacity-70"
              style={{
                color: "var(--sk-header-subtext)",
                border: "1px solid var(--sk-header-border)",
              }}
            >
              <SkinIcon skin={skin} />
              <span className="hidden md:inline">{SKIN_LABELS[skin]}</span>
            </button>
          </div>
        </div>
      </header>

      {warningBanner}

      {/* ── Main body ────────────────────────────────────────────────────── */}
      <div
        className={`flex-1 min-h-0 p-2 gap-2 ${
          centerFull
            ? "flex"
            : "grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_280px]"
        }`}
      >
        {/* Left sidebar – scrolls internally */}
        {!centerFull && (
          <aside
            className="rounded-xl overflow-y-auto min-h-0 backdrop-blur-sm hidden lg:block"
            style={{
              background: "var(--sk-panel-bg)",
              border: "1px solid var(--sk-panel-border)",
              color: "var(--sk-panel-text)",
            }}
          >
            {leftSidebar}
          </aside>
        )}

        {/* Center preview – no internal scroll */}
        <main
          className={`rounded-xl overflow-hidden relative flex flex-col min-h-0 ${centerFull ? "flex-1" : ""}`}
          style={{
            background: "var(--sk-panel-bg)",
            border: "1px solid var(--sk-panel-border)",
          }}
        >
          {/* Fullscreen / minimize toggle */}
          <button
            onClick={() => setCenterFull((v) => !v)}
            title={centerFull ? "Minimizar" : "Pantalla completa"}
            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-md flex items-center justify-center transition-opacity opacity-50 hover:opacity-100"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff" }}
          >
            {centerFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {centerContent}
        </main>

        {/* Right sidebar – scrolls internally */}
        {!centerFull && (
          <aside
            className="rounded-xl overflow-y-auto min-h-0 p-2 backdrop-blur-sm hidden lg:block"
            style={{
              background: "var(--sk-panel-bg)",
              border: "1px solid var(--sk-panel-border)",
              color: "var(--sk-panel-text)",
            }}
          >
            {rightSidebar}
          </aside>
        )}
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      {!centerFull && (
        <section
          className="shrink-0 px-3 pt-2 pb-3 space-y-2"
          style={{
            background: "var(--sk-timeline-bg)",
            borderTop: "1px solid var(--sk-timeline-border)",
          }}
        >
          {timelineControls}

          <div className="space-y-1">
            <p
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "var(--sk-label-text)" }}
            >
              Pista Media
            </p>
            {timelineMediaTrack}
          </div>

          <div className="space-y-1">
            <p
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "var(--sk-label-text)" }}
            >
              Pista Audio
            </p>
            {timelineAudioTrack}
          </div>
        </section>
      )}
    </div>
  );
}
