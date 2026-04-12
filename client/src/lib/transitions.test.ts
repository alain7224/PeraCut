import { describe, it, expect } from 'vitest';
import {
  generateFadeTransition,
  generateSlideTransition,
  generateZoomTransition,
  generateWipeTransition,
  getTransitionGenerator,
  validateTransitionConfig,
  TRANSITION_DESCRIPTIONS,
  RECOMMENDED_TRANSITION_DURATION,
} from './transitions';

describe('transitions', () => {
  describe('generateFadeTransition', () => {
    it('should generate fade transition filter', () => {
      const filter = generateFadeTransition(0, 1, 500, 3000);
      expect(filter).toContain('xfade');
      expect(filter).toContain('transition=fade');
      expect(filter).toContain('duration=0.5');
    });

    it('should handle different durations', () => {
      const filter1 = generateFadeTransition(0, 1, 300, 3000);
      const filter2 = generateFadeTransition(0, 1, 1000, 3000);
      
      expect(filter1).toContain('duration=0.3');
      expect(filter2).toContain('duration=1');
    });
  });

  describe('generateSlideTransition', () => {
    it('should generate slide transition with default direction', () => {
      const filter = generateSlideTransition(0, 1, 500, 3000);
      expect(filter).toContain('xfade');
      expect(filter).toContain('slideleft');
    });

    it('should generate slide transitions for different directions', () => {
      const left = generateSlideTransition(0, 1, 500, 3000, 'left');
      const right = generateSlideTransition(0, 1, 500, 3000, 'right');
      const up = generateSlideTransition(0, 1, 500, 3000, 'up');
      const down = generateSlideTransition(0, 1, 500, 3000, 'down');

      expect(left).toContain('slideleft');
      expect(right).toContain('slideright');
      expect(up).toContain('slideup');
      expect(down).toContain('slidedown');
    });
  });

  describe('generateZoomTransition', () => {
    it('should generate zoom in transition', () => {
      const filter = generateZoomTransition(0, 1, 500, 3000, 'in');
      expect(filter).toContain('xfade');
      expect(filter).toContain('zoomin');
    });

    it('should generate zoom out transition', () => {
      const filter = generateZoomTransition(0, 1, 500, 3000, 'out');
      expect(filter).toContain('zoomout');
    });
  });

  describe('generateWipeTransition', () => {
    it('should generate wipe transitions', () => {
      const left = generateWipeTransition(0, 1, 500, 3000, 'left');
      const right = generateWipeTransition(0, 1, 500, 3000, 'right');

      expect(left).toContain('wipeleft');
      expect(right).toContain('wiperight');
    });
  });

  describe('getTransitionGenerator', () => {
    it('should return fade generator', () => {
      const generator = getTransitionGenerator('fade');
      const filter = generator(0, 1, 500, 3000);
      expect(filter).toContain('fade');
    });

    it('should return slide generator', () => {
      const generator = getTransitionGenerator('slide', 'left');
      const filter = generator(0, 1, 500, 3000);
      expect(filter).toContain('slide');
    });

    it('should return zoom generator', () => {
      const generator = getTransitionGenerator('zoom', 'in');
      const filter = generator(0, 1, 500, 3000);
      expect(filter).toContain('zoom');
    });

    it('should return none generator for no transition', () => {
      const generator = getTransitionGenerator('none');
      const filter = generator(0, 1, 500, 3000);
      expect(filter).toContain('concat');
    });
  });

  describe('validateTransitionConfig', () => {
    it('should validate correct transition config', () => {
      const config = { type: 'fade' as const, duration: 500 };
      expect(validateTransitionConfig(config)).toBe(true);
    });

    it('should reject invalid transition type', () => {
      const config = { type: 'invalid' as any, duration: 500 };
      expect(validateTransitionConfig(config)).toBe(false);
    });

    it('should reject duration too short', () => {
      const config = { type: 'fade' as const, duration: 50 };
      expect(validateTransitionConfig(config)).toBe(false);
    });

    it('should reject duration too long', () => {
      const config = { type: 'fade' as const, duration: 3000 };
      expect(validateTransitionConfig(config)).toBe(false);
    });

    it('should accept valid durations', () => {
      const config1 = { type: 'fade' as const, duration: 100 };
      const config2 = { type: 'fade' as const, duration: 1000 };
      const config3 = { type: 'fade' as const, duration: 2000 };

      expect(validateTransitionConfig(config1)).toBe(true);
      expect(validateTransitionConfig(config2)).toBe(true);
      expect(validateTransitionConfig(config3)).toBe(true);
    });
  });

  describe('constants', () => {
    it('should have transition descriptions', () => {
      expect(TRANSITION_DESCRIPTIONS.fade).toBeDefined();
      expect(TRANSITION_DESCRIPTIONS.slide).toBeDefined();
      expect(TRANSITION_DESCRIPTIONS.zoom).toBeDefined();
      expect(TRANSITION_DESCRIPTIONS.none).toBeDefined();
    });

    it('should have recommended transition duration', () => {
      expect(RECOMMENDED_TRANSITION_DURATION).toBe(500);
    });
  });
});
