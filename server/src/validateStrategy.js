// Returns a list of error messages. An empty list means the strategy is valid.
export function validateStrategy(strategy, raceRules) {
  const { stints } = strategy;

  return [...checkStintLaps(stints)];
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
