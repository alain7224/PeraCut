/**
 * Built-in SVG stickers bundled with PeraCut.
 * All stickers are self-contained inline SVGs (no external requests).
 */

export interface Sticker {
  id: string;
  name: string;
  category: "emoji" | "shape" | "decoration";
  /** Inline SVG markup */
  svg: string;
}

export const STICKERS: Sticker[] = [
  {
    id: "star",
    name: "Estrella",
    category: "shape",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FFD700" stroke="#FFA000" stroke-width="2"/></svg>`,
  },
  {
    id: "heart",
    name: "Corazón",
    category: "emoji",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 85 C50 85 10 55 10 30 C10 15 20 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C80 5 90 15 90 30 C90 55 50 85 50 85Z" fill="#FF4081" stroke="#C2185B" stroke-width="2"/></svg>`,
  },
  {
    id: "smile",
    name: "Sonrisa",
    category: "emoji",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#FFA000" stroke-width="2"/><circle cx="35" cy="38" r="6" fill="#333"/><circle cx="65" cy="38" r="6" fill="#333"/><path d="M30 60 Q50 80 70 60" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "fire",
    name: "Fuego",
    category: "decoration",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 90 C30 90 15 75 15 58 C15 45 25 35 35 28 C38 50 42 52 50 50 C45 38 55 18 70 10 C68 30 75 38 75 50 C82 45 85 35 82 22 C92 32 95 45 90 58 C88 75 68 90 50 90Z" fill="#FF6600"/><path d="M50 80 C38 80 28 70 28 60 C28 52 35 44 42 42 C43 54 46 56 50 55 C47 48 52 36 60 32 C59 42 63 47 63 55 C67 52 68 46 66 38 C72 44 74 52 72 60 C70 72 60 80 50 80Z" fill="#FFD700"/></svg>`,
  },
  {
    id: "crown",
    name: "Corona",
    category: "decoration",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><polygon points="5,70 5,30 25,50 50,10 75,50 95,30 95,70" fill="#FFD700" stroke="#FFA000" stroke-width="2"/><rect x="5" y="65" width="90" height="12" rx="3" fill="#FFA000"/><circle cx="50" cy="12" r="6" fill="#FF4081"/><circle cx="7" cy="32" r="4" fill="#4FC3F7"/><circle cx="93" cy="32" r="4" fill="#4FC3F7"/></svg>`,
  },
  {
    id: "lightning",
    name: "Rayo",
    category: "decoration",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="60,5 20,55 50,55 40,95 80,45 50,45" fill="#FFE000" stroke="#FF8C00" stroke-width="2"/></svg>`,
  },
  {
    id: "music",
    name: "Música",
    category: "decoration",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="80" r="15" fill="#9C27B0"/><circle cx="70" cy="70" r="15" fill="#9C27B0"/><rect x="38" y="15" width="6" height="68" fill="#9C27B0"/><path d="M44 15 L85 5 L85 40 L44 50 Z" fill="#9C27B0"/></svg>`,
  },
  {
    id: "flower",
    name: "Flor",
    category: "decoration",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="12" fill="#FFD700"/><ellipse cx="50" cy="20" rx="10" ry="18" fill="#FF7043"/><ellipse cx="50" cy="80" rx="10" ry="18" fill="#FF7043"/><ellipse cx="20" cy="50" rx="18" ry="10" fill="#FF7043"/><ellipse cx="80" cy="50" rx="18" ry="10" fill="#FF7043"/><ellipse cx="29" cy="29" rx="10" ry="18" transform="rotate(-45 29 29)" fill="#FF4081"/><ellipse cx="71" cy="29" rx="10" ry="18" transform="rotate(45 71 29)" fill="#FF4081"/><ellipse cx="29" cy="71" rx="10" ry="18" transform="rotate(45 29 71)" fill="#FF4081"/><ellipse cx="71" cy="71" rx="10" ry="18" transform="rotate(-45 71 71)" fill="#FF4081"/></svg>`,
  },
];

export function getStickerById(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}

export function getStickersByCategory(category: Sticker["category"]): Sticker[] {
  return STICKERS.filter((s) => s.category === category);
}

/** Return a data-URL that can be used as `<img src>` for the sticker. */
export function stickerToDataUrl(sticker: Sticker): string {
  return `data:image/svg+xml,${encodeURIComponent(sticker.svg)}`;
}
