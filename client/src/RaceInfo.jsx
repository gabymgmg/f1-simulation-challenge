// Shows the selected race, its circuit and the tyre compounds the user can choose from
export default function RaceInfo({ race, tyres }) {
  const { circuit } = race;

  return (
    <section>
      <h2>{race.name}</h2>
      <p>
        {race.date} · {race.laps} laps
      </p>
      <p>
        {circuit.name}, {circuit.country} · {circuit.lengthKm} km
      </p>

      <h3>Tyres</h3>
      <table>
        <thead>
          <tr>
            <th>Compound</th>
            <th>Pace (s/lap)</th>
            <th>Degradation (s/lap of age)</th>
          </tr>
        </thead>
        <tbody>
          {tyres.map((tyre) => (
            <tr key={tyre.compound}>
              <td>{tyre.compound}</td>
              <td>{tyre.pace}</td>
              <td>{tyre.degradation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
