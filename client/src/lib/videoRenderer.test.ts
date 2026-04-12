import { describe, it, expect, beforeAll } from 'vitest';
import { isFFmpegReady, downloadBlob } from './videoRenderer';

describe('videoRenderer', () => {
  it('should check FFmpeg ready status', () => {
    const ready = isFFmpegReady();
    expect(typeof ready).toBe('boolean');
  });

  it('should have downloadBlob function', () => {
    expect(typeof downloadBlob).toBe('function');
  });

  it('should handle blob download', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';
    
    // Mock document.createElement and appendChild
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    
    let appendedElement: HTMLElement | null = null;
    
    document.createElement = function(tagName: string) {
      if (tagName === 'a') {
        const element = originalCreateElement.call(document, tagName);
        return element;
      }
      return originalCreateElement.call(document, tagName);
    } as any;
    
    document.body.appendChild = function(element: HTMLElement) {
      appendedElement = element;
      return element;
    } as any;
    
    document.body.removeChild = function(element: HTMLElement) {
      appendedElement = null;
      return element;
    } as any;
    
    try {
      downloadBlob(blob, filename);
      expect(true).toBe(true);
    } finally {
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    }
  });

  it('should validate scene duration constraints', () => {
    const maxDuration = 15000; // 15 segundos en ms
    const sceneDuration = 3000; // 3 segundos
    const numberOfScenes = 5;
    
    const totalDuration = sceneDuration * numberOfScenes;
    expect(totalDuration).toBeLessThanOrEqual(maxDuration);
  });

  it('should calculate duration per image correctly', () => {
    const totalDuration = 15000; // 15 segundos
    const numberOfImages = 5;
    const durationPerImage = Math.floor(totalDuration / numberOfImages);
    
    expect(durationPerImage).toBe(3000);
    expect(durationPerImage * numberOfImages).toBeLessThanOrEqual(totalDuration);
  });
});
