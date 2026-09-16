import { useCabinet } from "../state/CabinetContext";
import { useDuckGame } from "../state/DuckGameContext";

export default function DuckCounter() {
  const { opened } = useCabinet();
  const { duckCount } = useDuckGame();

  // only relevant during the idle scene — a drawer being open means the
  // ducks aren't even visible/clickable behind the overlay
  if (opened !== null) return null;

  return (
    <div className="duck-counter" aria-live="polite">
      <span className="duck-counter-label">Duck Counter</span>
      <span className="duck-counter-display">{String(duckCount).padStart(3, "0")}</span>
    </div>
  );
}
