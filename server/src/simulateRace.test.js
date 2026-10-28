import { describe, it, expect } from 'vitest';
import { calculateStintTime, simulateRace } from './simulateRace.js';

// Fixtures: round numbers so expected results can be calculated by hand
const baseLapTime = 91;
const softTyre = { compound: 'SOFT', pace: -1, degradation: 0.09 };
const hardTyre = { compound: 'HARD', pace: 1, degradation: 0.02 };
const tyres = [softTyre, hardTyre];
const pitStopLoss = 20;
const tyreChangeTime = 2.5;

function raceWith(stints) {
  return { stints, tyres, baseLapTime, pitStopLoss, tyreChangeTime };
}

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

describe('simulateRace', () => {
  const twoStintRace = raceWith([
    { compound: 'SOFT', laps: 2 },
    { compound: 'HARD', laps: 2 },
  ]);

  it('adds a pit stop at the end of every stint except the last', () => {
    const result = simulateRace(twoStintRace);

    expect(result.stints[0].pitStopTime).toBeCloseTo(22.5); // 20 + 2.5
    expect(result.stints[1].pitStopTime).toBeNull();
  });
});
