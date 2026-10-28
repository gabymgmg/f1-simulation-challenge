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
