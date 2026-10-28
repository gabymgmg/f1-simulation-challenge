// Formats seconds as h:mm:ss.s, rounding to tenths first so 59.96 s does not show as "60.0"
function formatTime(totalSeconds) {
  const totalTenths = Math.round(totalSeconds * 10);
  const hours = Math.floor(totalTenths / 36000);
  const minutes = Math.floor((totalTenths % 36000) / 600);
  const seconds = (totalTenths % 600) / 10;

  return `${hours}:${String(minutes).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`;
}

// Costs (wear, pit stops) are shown in seconds so they can be compared directly
function formatCost(seconds) {
  return `+${seconds.toFixed(1)} s`;
}

// Shows the breakdown per stint, with the pit stop on the stint that ends with it
export default function ResultTable({ result, outdated }) {
  return (
    <section className={outdated ? 'card result result-outdated' : 'card result'}>
      <h2>Result</h2>
      {outdated && <p className="hint">Strategy changed: simulate again to update.</p>}
      <table>
        <thead>
          <tr>
            <th>Stint</th>
            <th>Compound</th>
            <th>Laps</th>
            <th>Stint time</th>
            <th>Lost to wear</th>
            <th>Pit stop</th>
          </tr>
        </thead>
        <tbody>
          {result.stints.map((stint) => (
            <tr key={stint.stintNumber}>
              <td>{stint.stintNumber}</td>
              <td>
                <span className={`compound compound-${stint.compound.toLowerCase()}`}>{stint.compound}</span>
              </td>
              <td>{stint.laps}</td>
              <td>{formatTime(stint.stintTime)}</td>
              <td>{formatCost(stint.wearTime)}</td>
              <td>{stint.pitStopTime === null ? '—' : formatCost(stint.pitStopTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <div>
          <span>Total pit stop time</span>
          <strong>{formatCost(result.totalPitStopTime)}</strong>
        </div>
        <div>
          <span>Total lost to wear</span>
          <strong>{formatCost(result.totalWearTime)}</strong>
        </div>
      </div>

      <div className="total-time">
        <span>Total race time</span>
        <strong>{formatTime(result.totalTime)}</strong>
      </div>

      <div className="legend how-to-read">
        <h3>How to read this</h3>
        <p>
          <strong>Stint time:</strong> total time of the laps driven on that tyre.
        </p>
        <p>
          <strong>Lost to wear:</strong> extra time caused by the tyre getting older. It grows with every lap of
          the stint and resets after a pit stop.
        </p>
        <p>
          <strong>Pit stop:</strong> fixed cost of stopping to change tyres (pit lane + tyre change). It's the same
          for every stop.
        </p>
        <p>
          <strong>Tip:</strong> if a stint loses more time to wear than a pit stop costs, stopping earlier would
          probably be faster.
        </p>
      </div>
    </section>
  );
}
