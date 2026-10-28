import express from 'express';
import { getRaces, getRace, getTyres, getSimulationParameters } from './f1Client.js';
import { validateStrategy } from './validateStrategy.js';
import { simulateRace } from './simulateRace.js';

// Errors thrown here (f1Client ones carry a status) reach the error middleware in app.js
export const router = express.Router();

// The client adapts user input to the contract; the server only accepts the contract
function isValidStint(stint) {
  return (
    typeof stint === 'object' &&
    stint !== null &&
    typeof stint.compound === 'string' &&
    Number.isInteger(stint.laps)
  );
}

router.get('/races', async (req, res) => {
  res.json(await getRaces());
});

// Returns the race with its circuit embedded
router.get('/races/:raceId', async (req, res) => {
  res.json(await getRace(req.params.raceId));
});

router.get('/tyres', async (req, res) => {
  res.json(await getTyres());
});

router.post('/simulation', async (req, res) => {
  // 1. Body shape: business rules only make sense once the body follows the contract
  const { raceId, stints } = req.body ?? {};
  if (!raceId || !Array.isArray(stints) || !stints.every(isValidStint)) {
    return res.status(400).json({
      message: 'Body must be { raceId: string, stints: [{ compound: string, laps: integer }] }',
    });
  }

  // 2. The backend does not trust client data: race, tyres and parameters come from the API
  const [race, tyres, simulationParameters] = await Promise.all([
    getRace(raceId),
    getTyres(),
    getSimulationParameters(raceId),
  ]);

  // 3. Business rules: every error is returned so the user can fix them all at once
  const errors = validateStrategy(
    { raceId, stints },
    {
      raceLaps: race.laps,
      validCompounds: tyres.map((tyre) => tyre.compound),
      minimumPitStops: simulationParameters.minimumPitStops,
    }
  );
  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  // 4. The most specific source wins: pit stop data from simulation-parameters, not from the circuit
  const result = simulateRace({
    stints,
    tyres,
    baseLapTime: race.circuit.baseLapTime,
    pitStopLoss: simulationParameters.pitStopLoss,
    tyreChangeTime: simulationParameters.tyreChangeTime,
  });

  // 5. Breakdown per stint plus totals
  res.json(result);
});
