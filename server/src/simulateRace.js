// Returns the total time of one stint, in seconds.
// Tyre age starts at 0 (new tyre) and grows by 1 each lap of the stint.
export function calculateStintTime({ stint, tyre, baseLapTime }) {
  let stintTime = 0;

  for (let tyreAge = 0; tyreAge < stint.laps; tyreAge++) {
    const lapTime = baseLapTime + tyre.pace + tyre.degradation * tyreAge;
    stintTime += lapTime;
  }

  return stintTime;
}

// Simulates the whole race and returns the breakdown the user reads:
// one row per stint (with the pit stop at the end of the stint that finishes)
// plus the totals.
export function simulateRace({ stints, tyres, baseLapTime, pitStopLoss, tyreChangeTime }) {
  // pitStopLoss does not include the tyre change, so both are added per stop
  const pitStopTime = pitStopLoss + tyreChangeTime;

  const stintResults = [];
  let totalPitStopTime = 0;
  let totalWearTime = 0;
  let totalTime = 0;

  for (let i = 0; i < stints.length; i++) {
    const stint = stints[i];
    // Compounds are already checked by validateStrategy.
    // Tyre data comes from the API, the source of truth for pace and degradation.
    const tyre = tyres.find((t) => t.compound === stint.compound);
    const stintTime = calculateStintTime({ stint, tyre, baseLapTime });
    // What the stint would take with no wear is laps * (baseLapTime + pace); the rest is wear
    const wearTime = stintTime - stint.laps * (baseLapTime + tyre.pace);

    // The last stint ends at the finish line, so it has no pit stop
    const isLastStint = i === stints.length - 1;
    const stintPitStopTime = isLastStint ? null : pitStopTime;

    stintResults.push({
      stintNumber: i + 1,
      compound: stint.compound,
      laps: stint.laps,
      stintTime,
      wearTime,
      pitStopTime: stintPitStopTime,
    });

    totalWearTime += wearTime;
    totalPitStopTime += stintPitStopTime ?? 0;
    totalTime += stintTime + (stintPitStopTime ?? 0);
  }

  return {
    stints: stintResults,
    totalPitStopTime,
    totalWearTime,
    totalTime,
  };
}
