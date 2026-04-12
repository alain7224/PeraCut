/**
 * Utilidades para compartir contenido en redes sociales
 */

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Compartir en Facebook
 */
export function shareFacebook(options: ShareOptions): void {
  const params = new URLSearchParams({
    app_id: "YOUR_FACEBOOK_APP_ID", // Reemplazar con ID real
    display: "popup",
    href: options.url || window.location.href,
    redirect_uri: window.location.href,
  });

  window.open(
    `https://www.facebook.com/dialog/share?${params.toString()}`,
    "facebook-share",
    "width=600,height=400"
  );
}

/**
 * Compartir en Twitter/X
 */
export function shareTwitter(options: ShareOptions): void {
  const params = new URLSearchParams({
    text: `${options.title}\n${options.text}`,
    url: options.url || window.location.href,
    hashtags: "visualcontentai,contentcreation",
  });

  window.open(
    `https://twitter.com/intent/tweet?${params.toString()}`,
    "twitter-share",
    "width=600,height=400"
  );
}

/**
 * Compartir en Instagram (abre la app o web)
 */
export function shareInstagram(options: ShareOptions): void {
  // Instagram no tiene un share dialog directo, pero podemos intentar abrir la app
  const instagramUrl = `https://www.instagram.com/`;
  window.open(instagramUrl, "instagram-share");
}

/**
 * Compartir en TikTok
 */
export function shareTikTok(options: ShareOptions): void {
  const params = new URLSearchParams({
    url: options.url || window.location.href,
  });

  window.open(
    `https://www.tiktok.com/share?${params.toString()}`,
    "tiktok-share",
    "width=600,height=400"
  );
}

/**
 * Compartir en YouTube
 */
export function shareYouTube(options: ShareOptions): void {
  const params = new URLSearchParams({
    url: options.url || window.location.href,
  });

  window.open(
    `https://www.youtube.com/share?${params.toString()}`,
    "youtube-share",
    "width=600,height=400"
  );
}

/**
 * Descargar archivo
 */
export function downloadFile(
  dataUrl: string,
  filename: string,
  mimeType: string = "image/png"
): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copiar al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
}

/**
 * Compartir usando Web Share API (si está disponible)
 */
export async function webShare(options: ShareOptions): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share API not supported");
  }

  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url || window.location.href,
    });
  } catch (error) {
    console.error("Error sharing:", error);
  }
}

/**
 * Generar URL para compartir con parámetros
 */
export function generateShareUrl(
  baseUrl: string,
  params: Record<string, string>
): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

/**
 * Obtener datos de la imagen para compartir
 */
export function getImageShareData(canvas: HTMLCanvasElement): {
  dataUrl: string;
  blob: Promise<Blob | null>;
} {
  return {
    dataUrl: canvas.toDataURL("image/png"),
    blob: new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    }),
  };
}
