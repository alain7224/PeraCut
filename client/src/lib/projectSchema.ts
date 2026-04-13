/**
 * PeraCut project schema — defines the JSON structure used to save and reload
 * an editing session from a `.peracut.json` file.
 */

export const PERACUT_PROJECT_VERSION = "1.0";

export interface StickerItem {
  /** Instance id (nanoid) */
  id: string;
  /** Sticker definition id (from stickers.ts) */
  stickerId: string;
  /** X position as percentage (0–100) of canvas/frame width */
  x: number;
  /** Y position as percentage (0–100) of canvas/frame height */
  y: number;
  /** Scale factor (1 = natural size, 0.5 = half, 2 = double) */
  scale: number;
  /** Rotation in degrees */
  rotation: number;
}

export interface PhotoProjectState {
  /** Base-64 encoded original image (may be omitted if large) */
  imageDataUrl?: string;
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  filter: string;
  stickers: StickerItem[];
}

export interface VideoScene {
  /** Unique id for this scene */
  id: string;
  /** Duration in milliseconds */
  duration: number;
  /** URL or base-64 data-URL of the scene image/clip */
  mediaUrl?: string;
  transition: string;
  transitionDuration: number;
  stickers: StickerItem[];
}

export interface VideoProjectState {
  scenes: VideoScene[];
  transitionType: string;
  transitionDuration: number;
  slowMotionSpeed: number;
  templateId?: string;
}

export interface PeraCutProject {
  version: string;
  type: "photo" | "video";
  name: string;
  savedAt: string; // ISO-8601
  photo?: PhotoProjectState;
  video?: VideoProjectState;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Serialise the project and trigger a browser download of the JSON file. */
export function downloadProject(project: PeraCutProject): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name.replace(/\s+/g, "-")}.peracut.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Open a file-picker and parse the selected `.peracut.json` file. */
export function loadProjectFromFile(): Promise<PeraCutProject> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".peracut.json,.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error("No file selected"));
      const cleanup = () => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = event.target?.result as string;
          const project = JSON.parse(raw) as PeraCutProject;
          if (!project.version || !project.type) {
            throw new Error("Invalid project file: missing required fields");
          }
          resolve(project);
        } catch (err) {
          reject(err);
        } finally {
          cleanup();
        }
      };
      reader.onerror = () => {
        cleanup();
        reject(new Error("Error reading file"));
      };
      reader.readAsText(file);
    };
    input.oncancel = () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };
    // Some browsers require the element to be in the DOM before .click()
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();
  });
}
