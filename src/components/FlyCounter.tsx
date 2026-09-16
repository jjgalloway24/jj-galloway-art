import { useCabinet } from "../state/CabinetContext";
import { useFlyGame } from "../state/FlyGameContext";

export default function FlyCounter() {
  const { opened } = useCabinet();
  const { killCount } = useFlyGame();

  // only relevant during the idle scene — a drawer being open means the
  // flies aren't even visible/clickable behind the overlay
  if (opened !== null) return null;

  return (
    <div className="fly-counter" aria-live="polite">
      <span className="fly-counter-label">Flies Killed</span>
      <span className="fly-counter-display">{String(killCount).padStart(3, "0")}</span>
    </div>
  );
}
