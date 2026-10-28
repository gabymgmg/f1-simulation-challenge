import { describe, it, expect } from 'vitest';
import { validateStrategy } from './validateStrategy.js';

const raceRules = {
  raceLaps: 50,
  validCompounds: ['SOFT', 'MEDIUM', 'HARD'],
  minimumPitStops: 1,
};

function strategyWith(stints) {
  return { raceId: 'race-1', stints };
}

describe('validateStrategy', () => {
  it('returns no errors for a valid strategy', () => {
    const strategy = strategyWith([
      { compound: 'SOFT', laps: 20 },
      { compound: 'HARD', laps: 30 },
    ]);

    expect(validateStrategy(strategy, raceRules)).toEqual([]);
  });

  describe('stint laps', () => {
    it('rejects a stint with 0 laps', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 0 },
        { compound: 'HARD', laps: 50 },
      ]);

      expect(validateStrategy(strategy, raceRules)).toEqual([
        'Stint 1 must last at least 1 lap',
      ]);
    });

    it('rejects a stint with negative laps', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 55 },
        { compound: 'HARD', laps: -5 },
      ]);

      expect(validateStrategy(strategy, raceRules)).toEqual([
        'Stint 2 must last at least 1 lap',
      ]);
    });
  });

  describe('compounds', () => {
    it('rejects a compound that is not in the tyre list', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 20 },
        { compound: 'SUPERSOFT', laps: 30 },
      ]);

      expect(validateStrategy(strategy, raceRules)).toEqual([
        'Stint 2 uses an unknown compound: SUPERSOFT',
      ]);
    });
  });
});
