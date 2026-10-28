// Lets the user build the strategy as stints; pit stops are derived by the server
export default function StrategyBuilder({ stints, tyres, raceLaps, onChange, onSimulate, disabled }) {
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
    <section>
      <h3>Strategy</h3>

      {stints.map((stint, index) => (
        <div className="stint-row" key={index}>
          <span>Stint {index + 1}</span>
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
          <button onClick={() => removeStint(index)}>Remove</button>
        </div>
      ))}

      <button onClick={addStint}>Add stint</button>

      <p>
        Laps remaining: <strong>{lapsRemaining}</strong>
        {lapsRemaining < 0 && ' (too many laps)'}
      </p>

      <button onClick={onSimulate} disabled={!canSimulate}>
        Simulate
      </button>
    </section>
  );
}
