import { useState, useRef, useEffect, useMemo, useCallback, type ChangeEvent, type MouseEvent } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Download, Share2, Save, X, Plus, Volume2, FolderOpen, Copy, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import RegistrationModal, { isRegistered } from "@/components/RegistrationModal";
import ExportSaveDialog from "@/components/ExportSaveDialog";
import TemplateSelector from "@/components/TemplateSelector";
import MusicPanel from "@/components/MusicPanel";
import CapCutEditorLayout from "@/components/CapCutEditorLayout";
import { CapCutMediaTimeline, CapCutAudioTimeline } from "@/components/CapCutTimeline";
import { STICKERS, stickerToDataUrl } from "@/lib/stickers";
import type { StickerItem, PeraCutProject } from "@/lib/projectSchema";
import { exceedsExportLimit, EXPORT_LIMIT_WARNING_ES, MAX_EXPORT_DURATION_MS } from "@/lib/durationValidation";
import { getTemplateById, applyTemplateToMedia } from "@/lib/templateRegistry";
import type { MediaItem } from "@/components/MediaStrip";
import UnifiedEditorTypeSelector from "./UnifiedEditorTypeSelector";
import UnifiedEditorLeftPanel from "./UnifiedEditorLeftPanel";
import UnifiedEditorCenterPanel from "./UnifiedEditorCenterPanel";
import { type EditorType, type RightTab, type Scene, DEFAULT_SCENE_MS, uid } from "./unifiedEditorTypes";

export default function UnifiedEditorFixed() {
  const [, navigate] = useLocation();
  const search = new URLSearchParams(useSearch());
  const typeParam = search.get("type") as EditorType | null;
  const templateParam = search.get("template");

  const [editorType, setEditorType] = useState<EditorType>(typeParam ?? "photo");
  const [showTypeSelector, setShowTypeSelector] = useState(!typeParam && !templateParam);
  const [projectName, setProjectName] = useState("Mi Proyecto");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [previewAspectRatio, setPreviewAspectRatio] = useState<"9:16" | "1:1" | "16:9" | "4:5">("9:16");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [slowMotionSpeed, setSlowMotionSpeed] = useState(1);
  const [transitionType, setTransitionType] = useState("fade");
  const [transitionDuration, setTransitionDuration] = useState(500);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("media");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const loadedTemplate = useMemo(() => templateParam ? getTemplateById(templateParam) ?? null : null, [templateParam]);
  const selectedMedia = mediaItems[selectedMediaIndex] ?? null;
  const currentImage = selectedMedia?.type === "image" ? selectedMedia.objectUrl : null;
  const totalVideoDurationMs = useMemo(() => scenes.reduce((sum, s) => sum + (s.duration ?? 0), 0) || loadedTemplate?.durationMs || 0, [scenes, loadedTemplate]);
  const renderBlocked = editorType === "video" && (exceedsExportLimit(totalVideoDurationMs) || !scenes.some((s) => !!s.mediaUrl));

  useEffect(() => {
    if (templateParam) { setEditorType("video"); setShowTypeSelector(false); }
    else if (typeParam) { setEditorType(typeParam); setShowTypeSelector(false); }
  }, [typeParam, templateParam]);

  const buildScenes = useCallback((items: MediaItem[]) => {
    if (loadedTemplate) return applyTemplateToMedia(loadedTemplate).scenes.map((scene, index) => {
      const media = items.length ? items[index % items.length] : null;
      return { id: index + 1, projectId: 0, order: index, duration: scene.durationMs, mediaUrl: media?.objectUrl ?? null, mediaType: media?.type ?? "image" } as Scene;
    });
    return items.map((item, index) => ({ id: index + 1, projectId: 0, order: index, duration: item.durationMs ?? DEFAULT_SCENE_MS, mediaUrl: item.objectUrl, mediaType: item.type } as Scene));
  }, [loadedTemplate]);

  useEffect(() => {
    if (editorType === "video" && (loadedTemplate || mediaItems.length)) {
      const next = buildScenes(mediaItems);
      setScenes(next);
      setSelectedSceneIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      if (loadedTemplate) setProjectName(`Plantilla ${loadedTemplate.styleName}`);
    }
  }, [editorType, loadedTemplate, mediaItems, buildScenes]);

  useEffect(() => {
    if (editorType !== "photo" || !currentImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = document.createElement("img");
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height; ctx.clearRect(0, 0, canvas.width, canvas.height);
      const presetMap: Record<string, string> = { grayscale: "grayscale(100%)", sepia: "sepia(100%)", vintage: "sepia(50%) saturate(50%) brightness(110%)", cool: "hue-rotate(180deg) saturate(120%)", warm: "hue-rotate(10deg) saturate(130%)", noir: "grayscale(100%) contrast(150%)", none: "" };
      const preset = presetMap[selectedFilter] ?? "";
      const adj = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.filter = preset ? `${adj} ${preset}` : adj;
      ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate((rotation * Math.PI) / 180); ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
      stickers.forEach((s) => { const def = STICKERS.find((st) => st.id === s.stickerId); if (!def) return; const si = document.createElement("img"); si.onload = () => { const size = 80 * s.scale, x = (s.x / 100) * canvas.width - size / 2, y = (s.y / 100) * canvas.height - size / 2; ctx.save(); ctx.filter = "none"; ctx.translate(x + size / 2, y + size / 2); ctx.rotate((s.rotation * Math.PI) / 180); ctx.drawImage(si, -size / 2, -size / 2, size, size); ctx.restore(); }; si.src = stickerToDataUrl(def); });
    };
    img.src = currentImage;
  }, [editorType, currentImage, brightness, contrast, saturation, rotation, selectedFilter, stickers]);

  const requireRegistration = (action: () => void) => { if (isRegistered()) action(); else { setPendingAction(() => action); setShowRegistrationModal(true); } };
  const handleMediaFiles = useCallback((files: FileList | null) => { if (!files?.length) return; const next: MediaItem[] = []; for (let i = 0; i < files.length; i += 1) { const f = files[i], isVideo = f.type.startsWith("video/"), isImage = f.type.startsWith("image/"); if (!isVideo && !isImage) continue; next.push({ id: uid(), type: isVideo ? "video" : "image", fileName: f.name, objectUrl: URL.createObjectURL(f) }); } if (!next.length) { toast.error("No se encontraron archivos válidos."); return; } setMediaItems((prev) => { const out = [...prev, ...next]; setSelectedMediaIndex(prev.length); return out; }); }, []);
  const handleMediaInputChange = (e: ChangeEvent<HTMLInputElement>) => { handleMediaFiles(e.target.files); e.target.value = ""; };
  const openFilePicker = () => mediaFileInputRef.current?.click();
  const sceneToMediaIndex = useCallback((i: number) => mediaItems.length ? i % mediaItems.length : 0, [mediaItems.length]);
  const handlePrev = () => { if (!mediaItems.length) return; setSelectedMediaIndex((i) => i > 0 ? i - 1 : mediaItems.length - 1); setSelectedSceneIndex((i) => i > 0 ? i - 1 : Math.max(0, scenes.length - 1)); setIsVideoPaused(true); };
  const handleNext = () => { if (!mediaItems.length) return; setSelectedMediaIndex((i) => i < mediaItems.length - 1 ? i + 1 : 0); setSelectedSceneIndex((i) => i < scenes.length - 1 ? i + 1 : 0); setIsVideoPaused(true); };
  const handlePlayPause = () => { const v = videoRef.current; if (editorType === "photo" || !v) { setIsVideoPaused((p) => !p); return; } if (v.paused) v.play().then(() => setIsVideoPaused(false)).catch(() => toast.error("No se pudo reproducir el video.")); else { v.pause(); setIsVideoPaused(true); } };
  const handleRemoveMediaItem = (id: string) => setMediaItems((prev) => { const out = prev.filter((x) => x.id !== id); setSelectedMediaIndex((i) => Math.min(i, Math.max(0, out.length - 1))); return out; });
  const handleDuplicateSelected = async () => { if (!selectedMedia) return; try { const r = await fetch(selectedMedia.objectUrl), b = await r.blob(); const copy: MediaItem = { ...selectedMedia, id: uid(), fileName: `copia-${selectedMedia.fileName}`, objectUrl: URL.createObjectURL(b) }; setMediaItems((prev) => { const out = [...prev, copy]; setSelectedMediaIndex(out.length - 1); return out; }); } catch { toast.error("No se pudo duplicar el clip."); } };
  const handleMoveSelectedClip = (d: -1 | 1) => { if (scenes.length <= 1) return; const a = selectedSceneIndex, b = a + d; if (b < 0 || b >= scenes.length) return; setScenes((prev) => { const out = [...prev]; const [m] = out.splice(a, 1); out.splice(b, 0, m); return out.map((s, i) => ({ ...s, order: i })); }); setSelectedSceneIndex(b); setSelectedMediaIndex(sceneToMediaIndex(b)); };
  const handleAddSticker = (stickerId: string) => setStickers((prev) => [...prev, { id: uid(), stickerId, x: 50, y: 50, scale: 1, rotation: 0 }]);
  const handleRemoveSticker = (id: string) => setStickers((prev) => prev.filter((s) => s.id !== id));
  const handleDownloadPhoto = () => requireRegistration(() => { if (!canvasRef.current) return; const a = document.createElement("a"); a.href = canvasRef.current.toDataURL("image/png"); a.download = `photo-${Date.now()}.png`; a.click(); });

  const buildProject = (): PeraCutProject => ({ version: "1.0", type: editorType, name: projectName, savedAt: new Date().toISOString(), photo: editorType === "photo" ? { imageDataUrl: currentImage ?? undefined, brightness, contrast, saturation, rotation, filter: selectedFilter, stickers } : undefined, video: editorType === "video" ? { scenes: scenes.map((s) => ({ id: String(s.id), duration: s.duration, mediaUrl: s.mediaUrl ?? undefined, transition: transitionType, transitionDuration, stickers: [] })), transitionType, transitionDuration, slowMotionSpeed } : undefined });
  const handleProjectLoaded = (p: PeraCutProject) => { setEditorType(p.type); setProjectName(p.name); if (p.type === "photo" && p.photo) { if (p.photo.imageDataUrl) setMediaItems([{ id: uid(), type: "image", fileName: "proyecto-guardado.png", objectUrl: p.photo.imageDataUrl }]); setSelectedMediaIndex(0); setBrightness(p.photo.brightness ?? 100); setContrast(p.photo.contrast ?? 100); setSaturation(p.photo.saturation ?? 100); setRotation(p.photo.rotation ?? 0); setSelectedFilter(p.photo.filter ?? "none"); setStickers(p.photo.stickers ?? []); } if (p.type === "video" && p.video) { setTransitionType(p.video.transitionType ?? "fade"); setTransitionDuration(p.video.transitionDuration ?? 500); setSlowMotionSpeed(p.video.slowMotionSpeed ?? 1); const restored = p.video.scenes.map((s, i) => ({ id: Number(s.id) || i + 1, projectId: 0, order: i, duration: s.duration, mediaUrl: s.mediaUrl ?? null, mediaType: "image" as const })); setScenes(restored); setSelectedSceneIndex(0); setMediaItems(restored.filter((s) => !!s.mediaUrl).map((s, i) => ({ id: `restored-${i}-${uid()}`, type: s.mediaType, fileName: `scene-${s.id}`, objectUrl: s.mediaUrl! }))); setSelectedMediaIndex(0); } setShowTypeSelector(false); };
  const exportDialogButtonGuard = (e: MouseEvent<HTMLButtonElement>) => { if (!isRegistered()) { e.preventDefault(); e.stopPropagation(); requireRegistration(() => {}); } };
  const fileInputNode = <input ref={mediaFileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaInputChange} aria-label="Seleccionar archivos de imagen o video" />;
  const warningBannerNode = editorType === "video" && totalVideoDurationMs >= MAX_EXPORT_DURATION_MS ? <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2 text-yellow-800 text-sm"><AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />{EXPORT_LIMIT_WARNING_ES}</div> : undefined;
  const saveDialogProps = { editorType, canvasRef, imageFilters: { brightness, contrast, saturation, rotation, filter: selectedFilter }, currentImageSrc: currentImage, videoScenes: scenes.map((s) => ({ id: String(s.id), imageUrl: s.mediaUrl ?? undefined, duration: s.duration })), projectName, project: buildProject(), onProjectLoaded: handleProjectLoaded } as const;
  const compactButtonClass = "w-full h-8 justify-start text-xs px-2";

  if (showTypeSelector) return <UnifiedEditorTypeSelector onBack={() => navigate("/")} onSelectType={(t) => { setEditorType(t); setShowTypeSelector(false); }} />;

  return (
    <>
      <CapCutEditorLayout
        title={editorType === "photo" ? "Editor de Fotos" : "Editor de Videos"}
        projectName={projectName}
        onBack={() => navigate("/")}
        warningBanner={warningBannerNode}
        fileInput={fileInputNode}
        leftSidebar={
          <UnifiedEditorLeftPanel
            mediaItems={mediaItems}
            scenes={scenes}
            selectedMediaIndex={selectedMediaIndex}
            onOpenFilePicker={openFilePicker}
            onSelectItem={(i) => {
              setSelectedMediaIndex(i);
              const m = scenes.findIndex((_, si) => sceneToMediaIndex(si) === i);
              setSelectedSceneIndex(m >= 0 ? m : 0);
              setIsVideoPaused(true);
            }}
          />
        }
        centerContent={
          <UnifiedEditorCenterPanel
            editorType={editorType}
            selectedMedia={selectedMedia}
            currentImage={currentImage}
            canvasRef={canvasRef}
            videoRef={videoRef}
            previewAspectRatio={previewAspectRatio}
            stickers={stickers}
            onOpenFilePicker={openFilePicker}
            onRemoveSticker={handleRemoveSticker}
          />
        }
        rightSidebar={
          <div className="space-y-3">
            {/* Preset filters */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground/70 uppercase">Presets</h3>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "neon", label: "Neon", filter: "cool" },
                  { id: "light", label: "Light", filter: "vintage" },
                  { id: "dusk", label: "Dusk", filter: "warm" },
                ].map((x) => (
                  <Button
                    key={x.id}
                    size="sm"
                    variant={selectedFilter === x.filter ? "default" : "outline"}
                    className="h-8 text-[11px] px-1"
                    onClick={() => setSelectedFilter(x.filter)}
                  >
                    {x.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground/70 uppercase">Ratio</h3>
              <div className="grid grid-cols-4 gap-1">
                {(["9:16", "1:1", "16:9", "4:5"] as const).map((x) => (
                  <Button
                    key={x}
                    size="sm"
                    variant={previewAspectRatio === x ? "default" : "outline"}
                    className="h-8 text-[10px] px-1"
                    onClick={() => setPreviewAspectRatio(x)}
                  >
                    {x}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tab selector */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                {([
                  { key: "media", label: "Media" },
                  { key: "clip", label: "Clip" },
                  { key: "project", label: "Proyecto" },
                ] as const).map((x) => (
                  <Button
                    key={x.key}
                    size="sm"
                    variant={rightTab === x.key ? "default" : "outline"}
                    className="h-8 text-[10px] px-1"
                    onClick={() => setRightTab(x.key)}
                  >
                    {x.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <Button
                size="sm"
                variant="outline"
                className={compactButtonClass}
                onClick={openFilePicker}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Importar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={compactButtonClass}
                onClick={() => setRightTab("clip")}
                disabled={editorType !== "video"}
              >
                <Volume2 className="w-3.5 h-3.5 mr-1" /> Sonido
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={compactButtonClass}
                disabled={!selectedMedia}
                onClick={() => selectedMedia && handleRemoveMediaItem(selectedMedia.id)}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Borrar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={compactButtonClass}
                disabled={!selectedMedia}
                onClick={handleDuplicateSelected}
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Duplicar
              </Button>
              {editorType === "video" && (
                <Button
                  size="sm"
                  variant="outline"
                  className={compactButtonClass}
                  onClick={() => setShowTemplateDialog(true)}
                >
                  <LayoutTemplate className="w-3.5 h-3.5 mr-1" /> Plantilla
                </Button>
              )}
              <ExportSaveDialog {...saveDialogProps}>
                <Button
                  size="sm"
                  className={`${compactButtonClass} bg-purple-600 hover:bg-purple-700`}
                  onClick={exportDialogButtonGuard}
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Guardar
                </Button>
              </ExportSaveDialog>
              <ExportSaveDialog {...saveDialogProps}>
                <Button
                  size="sm"
                  variant="outline"
                  className={compactButtonClass}
                  onClick={exportDialogButtonGuard}
                >
                  <FolderOpen className="w-3.5 h-3.5 mr-1" /> Cargar
                </Button>
              </ExportSaveDialog>
              {editorType === "photo" ? (
                <Button
                  size="sm"
                  className={`${compactButtonClass} bg-blue-600 hover:bg-blue-700`}
                  onClick={handleDownloadPhoto}
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Descargar
                </Button>
              ) : (
                <ExportSaveDialog {...saveDialogProps}>
                  <Button
                    size="sm"
                    className={`${compactButtonClass} bg-purple-600 hover:bg-purple-700 disabled:opacity-50`}
                    disabled={renderBlocked}
                    onClick={exportDialogButtonGuard}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Descargar
                  </Button>
                </ExportSaveDialog>
              )}
              <Button
                size="sm"
                variant="outline"
                className={compactButtonClass}
                onClick={() => requireRegistration(() => toast.success("Listo para compartir"))}
              >
                <Share2 className="w-3.5 h-3.5 mr-1" /> Compartir
              </Button>
            </div>

            {/* Tab content */}
            {rightTab === "media" && editorType === "photo" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Brillo {brightness}%
                  </p>
                  <Slider
                    value={[brightness]}
                    onValueChange={(v) => setBrightness(v[0])}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Contraste {contrast}%
                  </p>
                  <Slider
                    value={[contrast]}
                    onValueChange={(v) => setContrast(v[0])}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Saturación {saturation}%
                  </p>
                  <Slider
                    value={[saturation]}
                    onValueChange={(v) => setSaturation(v[0])}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Rotación {rotation}°
                  </p>
                  <Slider
                    value={[rotation]}
                    onValueChange={(v) => setRotation(v[0])}
                    min={0}
                    max={360}
                    step={1}
                  />
                </div>
              </div>
            )}
            {rightTab === "clip" && editorType === "video" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Velocidad {slowMotionSpeed.toFixed(2)}x
                  </p>
                  <Slider
                    value={[slowMotionSpeed]}
                    onValueChange={(v) => setSlowMotionSpeed(v[0])}
                    min={0.25}
                    max={2}
                    step={0.25}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Transición</p>
                  <Select value={transitionType} onValueChange={setTransitionType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fundido</SelectItem>
                      <SelectItem value="slide">Barrido</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="wipeLeft">Barrido Izq</SelectItem>
                      <SelectItem value="wipeRight">Barrido Der</SelectItem>
                      <SelectItem value="none">Ninguno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Duración transición {transitionDuration}ms
                  </p>
                  <Slider
                    value={[transitionDuration]}
                    onValueChange={(v) => setTransitionDuration(v[0])}
                    min={100}
                    max={2000}
                    step={100}
                  />
                </div>
                <MusicPanel
                  defaultMusicTrack={loadedTemplate?.defaultMusicTrack}
                  templateDurationMs={loadedTemplate?.durationMs}
                />
              </div>
            )}
            {rightTab === "project" && (
              <div className="pt-3 border-t border-border space-y-2">
                <p className="font-semibold text-foreground text-sm">{projectName}</p>
                <p className="text-xs text-muted-foreground">
                  {editorType === "photo" ? "Proyecto de foto" : "Proyecto de video"}
                </p>
                {loadedTemplate && (
                  <p className="text-xs text-green-600">
                    Plantilla: {loadedTemplate.styleName} · {loadedTemplate.durationMs / 1000}
                    s · {loadedTemplate.aspectRatio}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className={compactButtonClass}
                  onClick={() => setShowStickerPanel((v) => !v)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Stickers
                </Button>
                {showStickerPanel && (
                  <div className="grid grid-cols-4 gap-1">
                    {STICKERS.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleAddSticker(st.id)}
                        title={st.name}
                        className="aspect-square rounded border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
                      >
                        <img
                          src={stickerToDataUrl(st)}
                          alt={st.name}
                          className="w-6 h-6"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        }
        timelineSection={
          <div className="space-y-3 h-full flex flex-col">
            <CapCutMediaTimeline
              mediaItems={mediaItems}
              selectedIndex={selectedMediaIndex}
              onSelectItem={setSelectedMediaIndex}
              onRemoveItem={handleRemoveMediaItem}
              onAddMedia={openFilePicker}
              onAddTransition={(afterIndex) =>
                toast.info(`Añadir transición después del clip ${afterIndex + 1}`)
              }
            />
            <CapCutAudioTimeline
              audioTrack={loadedTemplate?.defaultMusicTrack}
              onAddAudio={() => setRightTab("clip")}
            />
          </div>
        }
      />
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden glass-panel">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>Plantillas</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 h-full min-h-0">
            <TemplateSelector
              onSelectTemplate={(t) => {
                navigate(`/editor?type=video&template=${t.id}`);
                setShowTemplateDialog(false);
              }}
              onClose={() => setShowTemplateDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      <RegistrationModal
        open={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setShowRegistrationModal(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </>
  );
}
