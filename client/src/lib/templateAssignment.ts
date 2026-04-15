import type { TemplatePreset } from '@/lib/templateRegistry';

const TEMPLATE_ASSIGNMENT_STORAGE_KEY = 'peracut-template-assignment-v1';

export interface ClipKeyframeValue {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface ClipKeyframeRange {
  start: ClipKeyframeValue;
  end: ClipKeyframeValue;
}

export interface TemplateAssignedSlot {
  slotIndex: number;
  mediaType: 'image' | 'video';
  objectUrl: string;
  fileName: string;
  keyframes: ClipKeyframeRange;
  autoFilled: boolean;
}

export interface TemplateAssignmentPayload {
  templateId: string;
  slots: TemplateAssignedSlot[];
  autoFilledCount: number;
}

const DEFAULT_KEYFRAME: ClipKeyframeRange = {
  start: { x: 0, y: 0, scale: 1, rotation: 0 },
  end: { x: 0, y: 0, scale: 1.08, rotation: 0 },
};

export function createDefaultKeyframe(slotIndex: number): ClipKeyframeRange {
  const driftX = ((slotIndex % 5) - 2) * 6;
  const driftY = ((slotIndex % 4) - 1.5) * 4;
  const scaleBump = 1 + ((slotIndex % 3) * 0.04);
  return {
    start: { ...DEFAULT_KEYFRAME.start, x: -driftX, y: -driftY, scale: 1 },
    end: { ...DEFAULT_KEYFRAME.end, x: driftX, y: driftY, scale: Number(scaleBump.toFixed(2)) },
  };
}

export function autoFillTemplateSlots(
  template: TemplatePreset,
  providedSlots: Array<TemplateAssignedSlot | null>,
): TemplateAssignmentPayload {
  const slots: TemplateAssignedSlot[] = [];
  const valid = providedSlots.filter((s): s is TemplateAssignedSlot => !!s);

  if (valid.length === 0) {
    return {
      templateId: template.id,
      slots: template.scenes.map((scene) => ({
        slotIndex: scene.index,
        mediaType: 'image',
        objectUrl: '',
        fileName: 'vacío',
        keyframes: createDefaultKeyframe(scene.index),
        autoFilled: true,
      })),
      autoFilledCount: template.scenes.length,
    };
  }

  let autoFilledCount = 0;
  for (let i = 0; i < template.scenes.length; i++) {
    const existing = providedSlots[i];
    if (existing) {
      slots.push({ ...existing, slotIndex: i, keyframes: existing.keyframes ?? createDefaultKeyframe(i), autoFilled: false });
      continue;
    }

    const fallback = valid[i % valid.length];
    autoFilledCount += 1;
    slots.push({
      ...fallback,
      slotIndex: i,
      fileName: `${fallback.fileName} · relleno`,
      keyframes: createDefaultKeyframe(i),
      autoFilled: true,
    });
  }

  return {
    templateId: template.id,
    slots,
    autoFilledCount,
  };
}

export function saveTemplateAssignment(payload: TemplateAssignmentPayload): void {
  sessionStorage.setItem(TEMPLATE_ASSIGNMENT_STORAGE_KEY, JSON.stringify(payload));
}

export function readTemplateAssignment(templateId: string): TemplateAssignmentPayload | null {
  const raw = sessionStorage.getItem(TEMPLATE_ASSIGNMENT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as TemplateAssignmentPayload;
    if (parsed.templateId !== templateId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTemplateAssignment(): void {
  sessionStorage.removeItem(TEMPLATE_ASSIGNMENT_STORAGE_KEY);
}
