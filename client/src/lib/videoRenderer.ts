import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let ffmpegReady = false;

/**
 * Inicializar FFmpeg
 */
export async function initFFmpeg(): Promise<void> {
  if (ffmpegReady) return;

  try {
    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegReady = true;
  } catch (error) {
    console.error('Error inicializando FFmpeg:', error);
    throw error;
  }
}

/**
 * Crear video con transiciones
 */
export async function createVideoWithTransitions(
  scenes: Array<{
    type: 'image' | 'video';
    source: Blob | string;
    duration: number;
    transition?: 'fade' | 'slide' | 'zoom';
  }>,
  outputFormat: 'mp4' | 'webm' = 'mp4'
): Promise<Blob> {
  if (!ffmpeg || !ffmpegReady) {
    throw new Error('FFmpeg no está inicializado');
  }

  try {
    // Crear lista de filtros para transiciones
    let filterComplex = '';
    let inputCount = 0;
    const inputs: string[] = [];

    // Procesar cada escena
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const inputFile = `input_${i}`;

      if (scene.source instanceof Blob) {
        const arrayBuffer = await scene.source.arrayBuffer();
        ffmpeg!.writeFile(inputFile, new Uint8Array(arrayBuffer));
      } else {
        const response = await fetch(scene.source);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        ffmpeg!.writeFile(inputFile, new Uint8Array(arrayBuffer));
      }

      inputs.push(`-i ${inputFile}`);
      inputCount++;
    }

    // Construir filtro complejo con transiciones
    filterComplex = buildTransitionFilter(scenes, inputCount);

    // Configurar comando FFmpeg
    const videoCodec = outputFormat === 'mp4' ? 'libx264' : 'libvpx-vp9';
    const audioCodec = outputFormat === 'mp4' ? 'aac' : 'libopus';

    const command = [
      ...inputs.join(' ').split(' '),
      '-filter_complex',
      filterComplex,
      '-c:v',
      videoCodec,
      '-preset',
      'fast',
      '-crf',
      '23',
      '-c:a',
      audioCodec,
      '-b:a',
      '128k',
      '-t',
      '15', // Máximo 15 segundos
      '-y',
      'output.mp4',
    ];

    // Ejecutar FFmpeg
    await ffmpeg!.exec(command);

    // Leer archivo de salida
    const data = await ffmpeg!.readFile('output.mp4');
    const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
    const blob = new Blob([uint8Array as BlobPart], { type: `video/${outputFormat}` });

    // Limpiar archivos
    ffmpeg!.deleteFile('output.mp4');
    for (let i = 0; i < inputCount; i++) {
      ffmpeg!.deleteFile(`input_${i}`);
    }

    return blob;
  } catch (error) {
    console.error('Error renderizando video:', error);
    throw error;
  }
}

/**
 * Construir filtro de transiciones para FFmpeg
 */
function buildTransitionFilter(
  scenes: Array<{ duration: number; transition?: string }>,
  inputCount: number
): string {
  let filterParts: string[] = [];
  let currentInput = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const duration = Math.min(scene.duration / 1000, 15 / scenes.length); // Distribuir 15 segundos

    // Escalar y establecer duración
    filterParts.push(`[${currentInput}]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30[v${i}]`);

    currentInput++;
  }

  // Concatenar con transiciones
  let concatFilter = '';
  for (let i = 0; i < scenes.length; i++) {
    concatFilter += `[v${i}]`;
  }
  concatFilter += `concat=n=${scenes.length}:v=1:a=0[outv]`;
  filterParts.push(concatFilter);

  return filterParts.join(';') + ';[outv]format=yuv420p[out]';
}

/**
 * Crear video simple sin transiciones
 */
export async function createSimpleVideo(
  imageBlobs: Blob[],
  durationPerImage: number = 3000 // 3 segundos por imagen
): Promise<Blob> {
  if (!ffmpeg || !ffmpegReady) {
    throw new Error('FFmpeg no está inicializado');
  }

  try {
    // Crear imagen de duración específica para cada blob
    const inputs: string[] = [];

    for (let i = 0; i < imageBlobs.length; i++) {
      const inputFile = `img_${i}.png`;
      const arrayBuffer = await imageBlobs[i].arrayBuffer();
      ffmpeg!.writeFile(inputFile, new Uint8Array(arrayBuffer));
      inputs.push(`-loop 1 -i ${inputFile} -c:v libx264 -t ${durationPerImage / 1000} -pix_fmt yuv420p -vf scale=1280:720 ${inputFile}.mp4`);
    }

    // Crear lista de archivos para concatenar
    let concatList = '';
    for (let i = 0; i < imageBlobs.length; i++) {
      concatList += `file 'img_${i}.png.mp4'\n`;
    }
    ffmpeg!.writeFile('concat.txt', concatList);

    // Ejecutar FFmpeg para crear video
    const command = [
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      'concat.txt',
      '-c',
      'copy',
      '-y',
      'output.mp4',
    ];

    await ffmpeg!.exec(command);

    // Leer archivo de salida
    const data = await ffmpeg!.readFile('output.mp4');
    const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
    const blob = new Blob([uint8Array as BlobPart], { type: 'video/mp4' });

    // Limpiar archivos
    ffmpeg!.deleteFile('output.mp4');
    ffmpeg!.deleteFile('concat.txt');
    for (let i = 0; i < imageBlobs.length; i++) {
      ffmpeg!.deleteFile(`img_${i}.png`);
      ffmpeg!.deleteFile(`img_${i}.png.mp4`);
    }

    return blob;
  } catch (error) {
    console.error('Error creando video simple:', error);
    throw error;
  }
}

/**
 * Descargar blob como archivo
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Obtener estado de FFmpeg
 */
export function isFFmpegReady(): boolean {
  return ffmpegReady;
}
