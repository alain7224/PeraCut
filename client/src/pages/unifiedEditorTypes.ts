export type EditorType = "photo" | "video";
export type RightTab = "media" | "clip" | "project";

export interface Scene {
  id: number;
  projectId: number;
  order: number;
  duration: number;
  mediaUrl: string | null;
  mediaType: "image" | "video";
}

export const DEFAULT_SCENE_MS = 3000;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
