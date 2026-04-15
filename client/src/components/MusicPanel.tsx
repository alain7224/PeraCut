import { useMemo, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Music, ExternalLink, Volume2, VolumeX, Play } from 'lucide-react';
import { playSfx, type SfxType } from '@/lib/sfxGenerator';
import { toast } from 'sonner';

interface MusicPanelProps {
  onAudioFileChange?: (file: File | null) => void;
  onMusicVolumeChange?: (volume: number) => void;
  onOriginalVolumeChange?: (volume: number) => void;
  defaultMusicTrack?: string;
  templateDurationMs?: number;
}

const FREE_MUSIC_SOURCES = [
  {
    label: 'YouTube Audio Library',
    url: 'https://studio.youtube.com/channel/UC/music',
  },
  {
    label: 'Pixabay Music',
    url: 'https://pixabay.com/music/',
  },
  {
    label: 'Free Music Archive',
    url: 'https://freemusicarchive.org/',
  },
  {
    label: 'ccMixter',
    url: 'https://ccmixter.org/',
  },
];

const SFX_LIST: { type: SfxType; label: string; description: string }[] = [
  { type: 'beep', label: 'Beep', description: 'Tono agudo corto de 440Hz' },
  { type: 'whoosh', label: 'Whoosh', description: 'Barrido de frecuencia ascendente' },
  { type: 'clap', label: 'Clap', description: 'Golpe percusivo de ruido' },
  { type: 'riser', label: 'Riser', description: 'Tono ascendente de 1 segundo' },
  { type: 'pop', label: 'Pop', description: 'Transiente corto tipo pop' },
];

export default function MusicPanel({
  onAudioFileChange,
  onMusicVolumeChange,
  onOriginalVolumeChange,
  defaultMusicTrack,
  templateDurationMs,
}: MusicPanelProps) {
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(80);
  const [originalVolume, setOriginalVolume] = useState(100);
  const [muteOriginal, setMuteOriginal] = useState(false);
  const [playingSfx, setPlayingSfx] = useState<SfxType | null>(null);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [manualBpm, setManualBpm] = useState(120);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const beatMarkers = useMemo(() => {
    const duration = templateDurationMs ?? 15000;
    const beatMs = Math.max(250, Math.round((60_000 / Math.max(40, manualBpm))));
    const markers: number[] = [];
    for (let t = 0; t < duration; t += beatMs) {
      markers.push(t);
    }
    return markers;
  }, [manualBpm, templateDurationMs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAudioFileName(file?.name ?? null);
    onAudioFileChange?.(file);
  };

  const handleMusicVolume = (val: number[]) => {
    setMusicVolume(val[0]);
    onMusicVolumeChange?.(val[0]);
  };

  const handleOriginalVolume = (val: number[]) => {
    setOriginalVolume(val[0]);
    onOriginalVolumeChange?.(val[0]);
  };

  const handlePlaySfx = async (type: SfxType) => {
    try {
      setPlayingSfx(type);
      await playSfx(type);
    } catch {
      toast.error('No se pudo reproducir el SFX');
    } finally {
      setPlayingSfx(null);
    }
  };

  const handleTapTempo = () => {
    const now = Date.now();
    setTapTimes((prev) => {
      const next = [...prev.slice(-5), now];
      if (next.length >= 2) {
        const intervals = next.slice(1).map((t, idx) => t - next[idx]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60_000 / avg);
        if (bpm >= 40 && bpm <= 240) {
          setManualBpm(bpm);
        }
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Music className="h-4 w-4 text-purple-600" />
        <h3 className="font-bold text-gray-900 text-sm">Música y Audio</h3>
      </div>
      {defaultMusicTrack && (
        <p className="text-[11px] text-purple-700 mb-2">Música por defecto: {defaultMusicTrack.split('/').pop()}</p>
      )}

      <Tabs defaultValue="upload">
        <TabsList className="w-full mb-3">
          <TabsTrigger value="upload" className="flex-1 text-xs">Subir música</TabsTrigger>
          <TabsTrigger value="free" className="flex-1 text-xs">Música libre</TabsTrigger>
          <TabsTrigger value="sfx" className="flex-1 text-xs">SFX</TabsTrigger>
        </TabsList>

        {/* Upload tab */}
        <TabsContent value="upload" className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
              className="hidden"
              aria-label="Seleccionar archivo de audio"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              aria-label="Elegir archivo de audio (mp3, m4a, wav)"
              onClick={() => fileInputRef.current?.click()}
            >
              Elegir archivo de audio
            </Button>
            {audioFileName && (
              <p className="mt-1 text-xs text-gray-500 truncate">{audioFileName}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700 flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> Volumen música: {musicVolume}%
            </Label>
            <Slider
              value={[musicVolume]}
              onValueChange={handleMusicVolume}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-700 flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> Volumen original: {muteOriginal ? 0 : originalVolume}%
            </Label>
            <Slider
              value={[muteOriginal ? 0 : originalVolume]}
              onValueChange={handleOriginalVolume}
              min={0}
              max={100}
              step={1}
              disabled={muteOriginal}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-700 flex items-center gap-1">
              <VolumeX className="h-3 w-3" /> Silenciar original
            </Label>
            <Switch checked={muteOriginal} onCheckedChange={setMuteOriginal} />
          </div>
        </TabsContent>

        {/* Free music tab */}
        <TabsContent value="free" className="space-y-3">
          <p className="text-xs text-gray-600">
            Descarga música libre de derechos de estas fuentes y súbela desde la pestaña "Subir música".
          </p>
          <div className="space-y-2">
            {FREE_MUSIC_SOURCES.map((src) => (
              <a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-xs font-medium text-gray-700 hover:text-purple-700"
              >
                {src.label}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ))}
          </div>
          <p className="text-[10px] text-amber-600 leading-relaxed">
            Debes tener derechos o usar música libre. Las plataformas pueden bloquear videos con música sin licencia.
          </p>
        </TabsContent>

        {/* SFX tab */}
        <TabsContent value="sfx" className="space-y-2">
          {SFX_LIST.map(({ type, label, description }) => (
            <div
              key={type}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:bg-gray-50"
            >
              <div>
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-500">{description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handlePlaySfx(type)}
                disabled={playingSfx !== null}
              >
                <Play className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-2">
        <p className="text-[11px] font-semibold text-purple-900 mb-1">Beat Sync local</p>
        <div className="flex gap-2 items-center mb-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleTapTempo}>
            Tap tempo
          </Button>
          <span className="text-xs text-purple-700">BPM: {manualBpm}</span>
        </div>
        <div className="h-8 rounded bg-white border border-purple-100 px-1 flex items-end gap-[2px] overflow-hidden">
          {beatMarkers.slice(0, 60).map((marker) => (
            <span
              key={marker}
              className="w-[2px] bg-purple-500/80 rounded-t"
              style={{ height: marker % 2000 === 0 ? '100%' : '55%' }}
              title={`${(marker / 1000).toFixed(2)}s`}
            />
          ))}
        </div>
        <p className="text-[10px] text-purple-700 mt-1">Boom/zoom/shake se sincronizan en beats sin cambiar la duración total.</p>
      </div>
    </div>
  );
}
