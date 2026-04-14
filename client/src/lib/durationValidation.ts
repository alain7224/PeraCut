export const MAX_EXPORT_DURATION_MS = 420000; // 7 minutes
export const EXPORT_LIMIT_WARNING_ES = "Exportación limitada a 7 minutos por video.";

export function exceedsExportLimit(durationMs: number): boolean {
  return durationMs > MAX_EXPORT_DURATION_MS;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function validateExportDuration(durationMs: number): { valid: boolean; message?: string } {
  if (exceedsExportLimit(durationMs)) {
    return { valid: false, message: EXPORT_LIMIT_WARNING_ES };
  }
  return { valid: true };
}
