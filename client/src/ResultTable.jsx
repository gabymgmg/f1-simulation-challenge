// Formats seconds as h:mm:ss.s, rounding to tenths first so 59.96 s does not show as "60.0"
function formatTime(totalSeconds) {
  const totalTenths = Math.round(totalSeconds * 10);
  const hours = Math.floor(totalTenths / 36000);
  const minutes = Math.floor((totalTenths % 36000) / 600);
  const seconds = (totalTenths % 600) / 10;

  return `${hours}:${String(minutes).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`;
}

// Shows the breakdown per stint, with the pit stop on the stint that ends with it
export default function ResultTable({ result }) {
  return (
    <section className="card result">
      <h2>Result</h2>
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
              <td>+{stint.wearTime.toFixed(1)} s</td>
              <td>{stint.pitStopTime === null ? '—' : formatTime(stint.pitStopTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <div>
          <span>Total pit stop time</span>
          <strong>{formatTime(result.totalPitStopTime)}</strong>
        </div>
        <div>
          <span>Total lost to wear</span>
          <strong>{formatTime(result.totalWearTime)}</strong>
        </div>
      </div>

      <div className="total-time">
        <span>Total race time</span>
        <strong>{formatTime(result.totalTime)}</strong>
      </div>
    </section>
  );
}
