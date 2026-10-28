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

  describe('total laps', () => {
    it('rejects stints that add up to fewer laps than the race', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 20 },
        { compound: 'HARD', laps: 20 },
      ]);

      expect(validateStrategy(strategy, raceRules)).toEqual([
        'Stints add up to 40 laps, but the race has 50 laps',
      ]);
    });

    it('rejects stints that add up to more laps than the race', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 30 },
        { compound: 'HARD', laps: 30 },
      ]);

      expect(validateStrategy(strategy, raceRules)).toEqual([
        'Stints add up to 60 laps, but the race has 50 laps',
      ]);
    });
  });

  describe('pit stops', () => {
    it('rejects a strategy with fewer pit stops than the minimum', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 20 },
        { compound: 'HARD', laps: 30 },
      ]);
      const rulesWithTwoStops = { ...raceRules, minimumPitStops: 2 };

      expect(validateStrategy(strategy, rulesWithTwoStops)).toEqual([
        'Strategy has 1 pit stop(s), but at least 2 are required',
      ]);
    });

    it('accepts a strategy with exactly the minimum pit stops', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 15 },
        { compound: 'MEDIUM', laps: 15 },
        { compound: 'HARD', laps: 20 },
      ]);
      const rulesWithTwoStops = { ...raceRules, minimumPitStops: 2 };

      expect(validateStrategy(strategy, rulesWithTwoStops)).toEqual([]);
    });
  });

  describe('distinct compounds', () => {
    it('rejects a strategy that uses only one compound', () => {
      const strategy = strategyWith([
        { compound: 'SOFT', laps: 20 },
        { compound: 'SOFT', laps: 30 },
      ]);

      expect(validateStrategy(strategy, raceRules)).toEqual([
        'Strategy must use at least two different compounds',
      ]);
    });
  });

  it('returns every error at once so the user can fix them all', () => {
    const strategy = strategyWith([{ compound: 'SOFT', laps: 0 }]);

    expect(validateStrategy(strategy, raceRules)).toEqual([
      'Stint 1 must last at least 1 lap',
      'Stints add up to 0 laps, but the race has 50 laps',
      'Strategy has 0 pit stop(s), but at least 1 are required',
      'Strategy must use at least two different compounds',
    ]);
  });
});
