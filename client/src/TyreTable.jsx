// Shows the tyre compounds. They are the same for every race, so this is visible from the start.
export default function TyreTable({ tyres }) {
  return (
    <section className="card">
      <h2>Tyres</h2>
      <table>
        <thead>
          <tr>
            <th>Compound</th>
            <th>Pace</th>
            <th>Degradation</th>
          </tr>
        </thead>
        <tbody>
          {tyres.map((tyre) => (
            <tr key={tyre.compound}>
              <td>
                <span className={`compound compound-${tyre.compound.toLowerCase()}`}>{tyre.compound}</span>
              </td>
              <td>{tyre.pace} s</td>
              <td>{tyre.degradation} s</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="legend">
        <strong>Pace:</strong> seconds added to the base lap time on a new tyre (negative is faster).
        <br />
        <strong>Degradation:</strong> seconds lost per lap as the tyre gets older.
      </p>
    </section>
  );
}
