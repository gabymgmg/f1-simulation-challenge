import { useEffect, useState } from 'react';
import { fetchJson, errorMessageFor } from './api.js';
import RaceInfo from './RaceInfo.jsx';

export default function App() {
  const [races, setRaces] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [race, setRace] = useState(null);
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

  function selectRace(raceId) {
    setSelectedRaceId(raceId);
    setRace(null);
    setErrorMessage('');
    if (!raceId) return;

    setLoading(true);
    fetchJson(`/api/races/${raceId}`)
      .then(setRace)
      .catch((error) => setErrorMessage(errorMessageFor(error)))
      .finally(() => setLoading(false));
  }

  return (
    <main>
      <h1>F1 Strategy Simulator</h1>

      <label>
        Race{' '}
        <select value={selectedRaceId} onChange={(event) => selectRace(event.target.value)}>
          <option value="">Choose a race</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      {loading && <p className="loading">Loading...</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {race && <RaceInfo race={race} tyres={tyres} />}
    </main>
  );
}
