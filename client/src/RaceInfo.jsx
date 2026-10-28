// Shows the selected race and its circuit as label / value rows
export default function RaceInfo({ race }) {
  if (!race) {
    return (
      <section className="card">
        <h2>Circuit</h2>
        <p className="muted">Select a race to see its circuit.</p>
      </section>
    );
  }

  const { circuit } = race;

  return (
    <section className="card">
      <h2 className="race-name">{race.name}</h2>
      <table className="details">
        <tbody>
          <tr>
            <th>Date</th>
            <td>{race.date}</td>
          </tr>
          <tr>
            <th>Laps</th>
            <td>{race.laps}</td>
          </tr>
          <tr>
            <th>Circuit</th>
            <td>{circuit.name}</td>
          </tr>
          <tr>
            <th>Country</th>
            <td>{circuit.country}</td>
          </tr>
          <tr>
            <th>Length</th>
            <td>{circuit.lengthKm} km</td>
          </tr>
          <tr>
            <th>Base lap time</th>
            <td>{circuit.baseLapTime} s</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
