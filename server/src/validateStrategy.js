// Returns a list of error messages. An empty list means the strategy is valid.
export function validateStrategy(strategy, raceRules) {
  const { stints } = strategy;

  return [
    ...checkStintLaps(stints),
    ...checkCompounds(stints, raceRules.validCompounds),
    ...checkTotalLaps(stints, raceRules.raceLaps),
    ...checkPitStops(stints, raceRules.minimumPitStops),
  ];
}

// Each stint must last at least 1 lap
function checkStintLaps(stints) {
  const errors = [];
  stints.forEach((stint, index) => {
    if (stint.laps < 1) {
      errors.push(`Stint ${index + 1} must last at least 1 lap`);
    }
  });
  return errors;
}

// Each compound must be one of the tyres returned by the API
function checkCompounds(stints, validCompounds) {
  const errors = [];
  stints.forEach((stint, index) => {
    if (!validCompounds.includes(stint.compound)) {
      errors.push(`Stint ${index + 1} uses an unknown compound: ${stint.compound}`);
    }
  });
  return errors;
}

// The stints must cover exactly the race distance
function checkTotalLaps(stints, raceLaps) {
  const totalLaps = stints.reduce((sum, stint) => sum + stint.laps, 0);
  if (totalLaps !== raceLaps) {
    return [`Stints add up to ${totalLaps} laps, but the race has ${raceLaps} laps`];
  }
  return [];
}

// Pit stops are derived from the stints: N stints means N - 1 stops
function checkPitStops(stints, minimumPitStops) {
  const pitStops = stints.length - 1;
  if (pitStops < minimumPitStops) {
    return [`Strategy has ${pitStops} pit stop(s), but at least ${minimumPitStops} are required`];
  }
  return [];
}
