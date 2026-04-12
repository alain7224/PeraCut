/**
 * Utilidades para edición de imágenes
 */

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hueRotate: number;
}

export interface ImageTransforms {
  rotation: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Aplicar filtros a un canvas
 */
export function applyFilters(
  ctx: CanvasRenderingContext2D,
  filters: Partial<ImageFilters>
): string {
  const {
    brightness = 100,
    contrast = 100,
    saturation = 100,
    blur = 0,
    hueRotate = 0,
  } = filters;

  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hueRotate}deg)`;
}

/**
 * Aplicar filtro predefinido
 */
export function applyPresetFilter(
  ctx: CanvasRenderingContext2D,
  filterName: string
): string {
  switch (filterName) {
    case "grayscale":
      return "grayscale(100%)";
    case "sepia":
      return "sepia(100%)";
    case "vintage":
      return "sepia(50%) saturate(50%) brightness(110%)";
    case "cool":
      return "hue-rotate(180deg) saturate(120%)";
    case "warm":
      return "hue-rotate(10deg) saturate(130%)";
    case "noir":
      return "grayscale(100%) contrast(150%)";
    default:
      return "none";
  }
}

/**
 * Dibujar imagen con transformaciones
 */
export function drawImageWithTransforms(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  transforms: Partial<ImageTransforms>,
  filters: Partial<ImageFilters>
): void {
  const {
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
    offsetX = 0,
    offsetY = 0,
  } = transforms;

  ctx.save();

  // Aplicar filtros
  ctx.filter = applyFilters(ctx, filters);

  // Aplicar transformaciones
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

/**
 * Recortar imagen
 */
export function cropImage(
  canvas: HTMLCanvasElement,
  cropBox: CropBox
): HTMLCanvasElement {
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = cropBox.width;
  croppedCanvas.height = cropBox.height;

  const ctx = croppedCanvas.getContext("2d");
  if (!ctx) return croppedCanvas;

  const sourceCanvas = canvas;
  ctx.drawImage(
    sourceCanvas,
    cropBox.x,
    cropBox.y,
    cropBox.width,
    cropBox.height,
    0,
    0,
    cropBox.width,
    cropBox.height
  );

  return croppedCanvas;
}

/**
 * Redimensionar imagen
 */
export function resizeImage(
  canvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement {
  let width = canvas.width;
  let height = canvas.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = width;
  resizedCanvas.height = height;

  const ctx = resizedCanvas.getContext("2d");
  if (!ctx) return resizedCanvas;

  ctx.drawImage(canvas, 0, 0, width, height);
  return resizedCanvas;
}

/**
 * Exportar canvas como blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality: number = 0.95
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      format,
      quality
    );
  });
}

/**
 * Calcular DPI de una imagen
 */
export function calculateDPI(
  widthPx: number,
  widthIn: number
): number {
  return Math.round(widthPx / widthIn);
}

/**
 * Validar resolución de imagen
 */
export function validateImageResolution(
  width: number,
  height: number,
  maxWidth: number = 4000,
  maxHeight: number = 4000
): { valid: boolean; error?: string } {
  if (width > maxWidth || height > maxHeight) {
    return {
      valid: false,
      error: `La imagen no puede exceder ${maxWidth}x${maxHeight} píxeles`,
    };
  }
  return { valid: true };
}

/**
 * Agregar texto a un canvas
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    fontSize?: number;
    fontFamily?: string;
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
  } = {}
): void {
  const {
    font = "Arial",
    fontSize = 24,
    fontFamily = "Arial",
    fillStyle = "#000000",
    strokeStyle = undefined,
    lineWidth = 1,
    textAlign = "left",
    textBaseline = "top",
  } = options;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
}
