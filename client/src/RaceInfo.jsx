// Shows the selected race and its circuit
export default function RaceInfo({ race }) {
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
    </section>
  );
}
