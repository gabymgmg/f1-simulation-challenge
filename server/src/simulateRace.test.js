import { describe, it, expect } from 'vitest';
import { calculateStintTime } from './simulateRace.js';

// Fixtures: round numbers so expected results can be calculated by hand
const baseLapTime = 91;
const softTyre = { compound: 'SOFT', pace: -1, degradation: 0.09 };

describe('calculateStintTime', () => {
  it('returns baseLapTime + pace for a 1-lap stint (tyre age 0)', () => {
    const stint = { compound: 'SOFT', laps: 1 };

    const result = calculateStintTime({ stint, tyre: softTyre, baseLapTime });

    expect(result).toBeCloseTo(90); // 91 + (-1)
  });

  it('adds degradation from the second lap of a stint', () => {
    const stint = { compound: 'SOFT', laps: 2 };

    const result = calculateStintTime({ stint, tyre: softTyre, baseLapTime });

    expect(result).toBeCloseTo(180.09); // 90 + (90 + 0.09 * 1)
  });
});
