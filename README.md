# F1 Strategy Simulator

Pick a race, build a tyre strategy (compound + laps per stint), and see how long the race takes and where the time goes.

React + Vite (`/client`), Express (`/server`), Vitest.

## How to run

Node 22.12+.

```bash
cd server && npm install && npm run dev    # http://localhost:3001
cd client && npm install && npm run dev    # http://localhost:5173 (proxies /api to the server)
cd server && npm test                      # unit tests
```

The F1 API sleeps when idle: the first request can take up to a minute.

## Simulation and assumptions

`lap time = baseLapTime + tyre pace + degradation × tyre age`; each pit stop adds `pitStopLoss + tyreChangeTime`.

- Tyre age starts at 0 (new tyre) and resets after every stop.
- `tyreChangeTime` is not included in `pitStopLoss`, so both are added.
- If a value exists in several places, the most specific wins: simulation parameters > race > circuit.
- Pit stops are derived from stints (N stints = N − 1 stops).
- Deterministic: no lap time variance or safety car, so strategies can be compared.
- Strategy rules: each stint ≥ 1 lap, known compound, laps add up to the race, stops ≥ `minimumPitStops`, at least two compounds (my own rule).

The result shows, per stint, the time, the time lost to tyre wear and the pit stop cost, so the user can see when stopping earlier would pay off. Durations use `h:mm:ss.s`; costs (wear, pit stops) use seconds.

## API

The backend only receives `{ raceId, stints }` and fetches race, tyres and simulation parameters from the F1 API itself.

| Status | When |
|---|---|
| 400 | Malformed body or wrong types |
| 404 | Race not found (or invalid `raceId` format) |
| 422 | Invalid strategy, with every error at once |
| 503 / 504 | F1 API failure / timeout (70 s) |

## Tests

Unit tests (TDD) for strategy validation, the simulation and F1 API error translation. Routes and UI are not tested: they only connect tested pieces.

## With more time

Driver and team performance, weather vs. `optimalRainIntensity`, circuit `tyreWear` and fuel effect, comparing with the previous run, endpoint integration tests and caching F1 API responses.

## Use of AI

AI (Claude) was used to discuss decisions, review code and write boilerplate; I reviewed every change and own the model and rules. The key prompts are in [PROMPTS.md](PROMPTS.md).
