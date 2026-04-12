import { describe, it, expect } from 'vitest';
import {
  generateBlurFilter,
  generateSepiaFilter,
  validateEffectConfig,
  createDefaultEffectConfig,
  getAllEffects,
} from './effects';
import {
  calculateAdjustedDuration,
  generateSlowMotionFilter,
  validateSlowMotionConfig,
  getNearestSpeed,
} from './slowMotion';
import {
  createDefaultAudioTrack,
  calculateVolumeWithFade,
  validateAudioTrack,
  getTotalAudioDuration,
  isValidAudioFormat,
} from './audioSystem';
import {
  getAllTemplates,
  getTemplateByType,
  searchTemplatesByTag,
  validateTemplate,
} from './videoTemplates';

describe('Effects System', () => {
  it('should generate blur filter', () => {
    const filter = generateBlurFilter(50);
    expect(filter).toContain('blur');
    expect(filter).toContain('px');
  });

  it('should generate sepia filter', () => {
    const filter = generateSepiaFilter(75);
    expect(filter).toContain('sepia');
  });

  it('should validate effect config', () => {
    const validConfig = createDefaultEffectConfig('blur');
    expect(validateEffectConfig(validConfig)).toBe(true);

    const invalidConfig = { type: 'blur' as const, intensity: 150, enabled: false };
    expect(validateEffectConfig(invalidConfig)).toBe(false);
  });

  it('should get all effects', () => {
    const effects = getAllEffects();
    expect(effects.length).toBeGreaterThan(0);
    expect(effects).toContain('blur');
    expect(effects).toContain('sepia');
  });
});

describe('Slow Motion System', () => {
  it('should calculate adjusted duration', () => {
    const originalDuration = 4000; // 4 segundos
    const adjustedDuration = calculateAdjustedDuration(originalDuration, 0.5);
    expect(adjustedDuration).toBe(8000); // 8 segundos a 0.5x
  });

  it('should generate slow motion filter', () => {
    const filter = generateSlowMotionFilter(0.5);
    expect(filter).toContain('setpts');
  });

  it('should validate slow motion config', () => {
    const validConfig = {
      enabled: true,
      speed: 0.5 as const,
      startTime: 0,
      endTime: 5000,
    };
    expect(validateSlowMotionConfig(validConfig)).toBe(true);

    const invalidConfig = {
      enabled: true,
      speed: 3 as any,
      startTime: 0,
      endTime: 5000,
    };
    expect(validateSlowMotionConfig(invalidConfig)).toBe(false);
  });

  it('should get nearest speed', () => {
    const nearest = getNearestSpeed(1.3);
    expect([1.25, 1.5]).toContain(nearest);
  });
});

describe('Audio System', () => {
  it('should create default audio track', () => {
    const track = createDefaultAudioTrack(
      'track-1',
      'Background Music',
      'https://example.com/music.mp3',
      5000
    );
    expect(track.id).toBe('track-1');
    expect(track.volume).toBe(100);
    expect(track.type).toBe('background');
  });

  it('should calculate volume with fade', () => {
    const volume = calculateVolumeWithFade(100, 500, 1000, 1000, 5000);
    expect(volume).toBeGreaterThan(0);
    expect(volume).toBeLessThanOrEqual(100);
  });

  it('should validate audio track', () => {
    const validTrack = createDefaultAudioTrack(
      'track-1',
      'Music',
      'https://example.com/music.mp3',
      5000
    );
    expect(validateAudioTrack(validTrack)).toBe(true);

    const invalidTrack = {
      ...validTrack,
      volume: 150,
    };
    expect(validateAudioTrack(invalidTrack)).toBe(false);
  });

  it('should get total audio duration', () => {
    const track1 = createDefaultAudioTrack('1', 'Music 1', 'url1', 3000);
    const track2 = createDefaultAudioTrack('2', 'Music 2', 'url2', 5000);
    track2.startTime = 2000;

    const total = getTotalAudioDuration([track1, track2]);
    expect(total).toBe(7000); // 2000 + 5000
  });

  it('should validate audio format', () => {
    expect(isValidAudioFormat('audio/mpeg')).toBe(true);
    expect(isValidAudioFormat('audio/wav')).toBe(true);
    expect(isValidAudioFormat('video/mp4')).toBe(false);
  });
});

describe('Video Templates', () => {
  it('should get all templates', () => {
    const templates = getAllTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.length).toBe(6);
  });

  it('should get template by type', () => {
    const template = getTemplateByType('intro');
    expect(template.type).toBe('intro');
    expect(template.scenes.length).toBeGreaterThan(0);
  });

  it('should search templates by tag', () => {
    const results = searchTemplatesByTag('professional');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should validate template', () => {
    const template = getTemplateByType('intro');
    expect(validateTemplate(template)).toBe(true);
  });

  it('should have all templates with valid structure', () => {
    const templates = getAllTemplates();
    templates.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.type).toBeDefined();
      expect(template.scenes).toBeDefined();
      expect(template.duration).toBeGreaterThan(0);
      expect(template.aspectRatio).toMatch(/16:9|9:16|1:1/);
    });
  });

  it('should have scenes with valid transitions', () => {
    const template = getTemplateByType('carousel');
    template.scenes.forEach((scene) => {
      expect(scene.transition).toBeDefined();
      expect(scene.transition.type).toBeDefined();
      expect(scene.transition.duration).toBeGreaterThan(0);
    });
  });
});
