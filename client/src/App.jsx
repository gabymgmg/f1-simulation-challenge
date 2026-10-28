import { useEffect, useState } from 'react';
import { fetchJson, errorMessageFor } from './api.js';
import RaceInfo from './RaceInfo.jsx';
import TyreTable from './TyreTable.jsx';
import StrategyBuilder from './StrategyBuilder.jsx';
import ResultTable from './ResultTable.jsx';

export default function App() {
  const [races, setRaces] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [race, setRace] = useState(null);
  const [stints, setStints] = useState([]);
  const [result, setResult] = useState(null);
  const [strategyErrors, setStrategyErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  // Starts as true because races and tyres are requested on the first render
  const [loading, setLoading] = useState(true);

  // Races and tyres do not depend on the selected race, so they are loaded once
  useEffect(() => {
    Promise.all([fetchJson('/api/races'), fetchJson('/api/tyres')])
      .then(([racesData, tyresData]) => {
        setRaces(racesData);
        setTyres(tyresData);
      })
      .catch((error) => setErrorMessage(errorMessageFor(error)))
      .finally(() => setLoading(false));
  }, []);

  // A new race starts a new strategy
  function selectRace(raceId) {
    setSelectedRaceId(raceId);
    setRace(null);
    setStints([]);
    setResult(null);
    setStrategyErrors([]);
    setErrorMessage('');
    if (!raceId) return;

    setLoading(true);
    fetchJson(`/api/races/${raceId}`)
      .then(setRace)
      .catch((error) => setErrorMessage(errorMessageFor(error)))
      .finally(() => setLoading(false));
  }

  function simulate() {
    setStrategyErrors([]);
    setErrorMessage('');
    setLoading(true);

    // The form keeps laps as text; the server expects integers
    const body = {
      raceId: selectedRaceId,
      stints: stints.map((stint) => ({ compound: stint.compound, laps: Number(stint.laps) })),
    };

    fetchJson('/api/simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(setResult)
      .catch((error) => {
        if (error.status === 422) {
          setStrategyErrors(error.errors);
        } else {
          setErrorMessage(errorMessageFor(error));
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <main>
      <header>
        <h1>F1 Strategy Simulator</h1>
        <label className="race-select">
          Select race
          <select value={selectedRaceId} onChange={(event) => selectRace(event.target.value)}>
            <option value="">Choose a race</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        {loading && <p className="muted">Loading...</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
      </header>

      <div className="info-grid">
        <RaceInfo race={race} />
        {/* Tyres are the same for every race, so they are shown from the start */}
        {tyres.length > 0 && <TyreTable tyres={tyres} />}
      </div>

      {race && (
        <StrategyBuilder
          stints={stints}
          tyres={tyres}
          raceLaps={race.laps}
          onChange={setStints}
          onSimulate={simulate}
          disabled={loading}
        />
      )}

      {strategyErrors.length > 0 && (
        <ul className="error-list">
          {strategyErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {result && <ResultTable result={result} />}
    </main>
  );
}
