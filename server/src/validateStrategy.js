// Returns a list of error messages. An empty list means the strategy is valid.
export function validateStrategy(strategy, raceRules) {
  const { stints } = strategy;

  return [
    ...checkStintLaps(stints),
    ...checkCompounds(stints, raceRules.validCompounds),
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
