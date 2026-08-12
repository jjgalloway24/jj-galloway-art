import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export default function LoadingScreen() {
  const { progress, active } = useProgress();
  const [everStarted, setEverStarted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (active) setEverStarted(true);
  }, [active]);

  useEffect(() => {
    if (!everStarted || active) return;
    // hold briefly at 100% instead of snapping away the instant loading ends
    const timeout = setTimeout(() => setVisible(false), 350);
    return () => clearTimeout(timeout);
  }, [everStarted, active]);

  if (!visible) return null;

  const done = everStarted && !active;

  return (
    <div className={`loading-screen${done ? " loading-screen--done" : ""}`}>
      <div className="loading-title">JJ GALLOWAY ART</div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${Math.round(progress)}%` }} />
      </div>
      <div className="loading-percent">{Math.round(progress)}%</div>
    </div>
  );
}
