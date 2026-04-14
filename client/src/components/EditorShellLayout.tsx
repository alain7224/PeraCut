import type { ReactNode } from "react";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: EditorShellLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col">
      {fileInput}

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-gray-700">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 truncate">{title}</h1>
              <p className="text-xs text-gray-500 truncate">{projectName}</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onTogglePause} className="gap-2">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            PAUSA
          </Button>
        </div>
      </div>

      {warningBanner}

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_280px] gap-3 p-3 overflow-hidden">
        <aside className="bg-white rounded-xl border border-gray-200 overflow-y-auto min-h-[220px]">
          {leftSidebar}
        </aside>

        <main className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 overflow-auto min-h-[320px]">
          {centerContent}
        </main>

        <aside className="bg-white rounded-xl border border-gray-200 overflow-y-auto p-3">
          {rightSidebar}
        </aside>
      </div>

      <section className="bg-white border-t border-gray-200 p-3 space-y-3">
        {timelineControls}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">PISTA MEDIA</p>
          {timelineMediaTrack}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">PISTA AUDIO</p>
          {timelineAudioTrack}
        </div>
      </section>
    </div>
  );
}
