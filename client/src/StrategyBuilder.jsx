// Lets the user build the strategy as stints; pit stops are derived by the server
export default function StrategyBuilder({ stints, tyres, raceLaps, onChange, onSimulate, disabled, simulating }) {
  const plannedLaps = stints.reduce((sum, stint) => sum + (Number(stint.laps) || 0), 0);
  const lapsRemaining = raceLaps - plannedLaps;
  const canSimulate = stints.length > 0 && lapsRemaining === 0 && !disabled;

  function addStint() {
    onChange([...stints, { compound: tyres[0].compound, laps: '' }]);
  }

  function updateStint(index, field, value) {
    onChange(stints.map((stint, i) => (i === index ? { ...stint, [field]: value } : stint)));
  }

  function removeStint(index) {
    onChange(stints.filter((stint, i) => i !== index));
  }

  return (
    <section className="card strategy">
      <h2>Your strategy</h2>
      <p className="muted">
        Add stints in race order: a compound and how many laps it lasts. There is a pit stop between stints.
      </p>

      {stints.map((stint, index) => (
        <div className="stint-row" key={index}>
          <span className="stint-label">Stint {index + 1}</span>
          <select value={stint.compound} onChange={(event) => updateStint(index, 'compound', event.target.value)}>
            {tyres.map((tyre) => (
              <option key={tyre.compound} value={tyre.compound}>
                {tyre.compound}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Laps"
            value={stint.laps}
            onChange={(event) => updateStint(index, 'laps', event.target.value)}
          />
          <button className="button-secondary" onClick={() => removeStint(index)}>
            Remove
          </button>
        </div>
      ))}

      <button className="button-secondary" onClick={addStint}>
        + Add stint
      </button>

      <p className={lapsRemaining === 0 ? 'laps-remaining laps-ok' : 'laps-remaining'}>
        Laps remaining: <strong>{lapsRemaining}</strong>
        {lapsRemaining < 0 && ' (too many laps)'}
      </p>

      <button className="button-primary" onClick={onSimulate} disabled={!canSimulate}>
        {simulating ? 'Simulating...' : 'Simulate'}
      </button>
    </section>
  );
}
