import * as THREE from "three";
import DuckBrain from "./DuckBrain";

// hand-placed so the flock spreads across the sky above the cabinet rather
// than overlapping — phaseOffset staggers each duck's position along the
// same sine-wave flight path so they don't move in lockstep
const FLOCK = [
  { center: new THREE.Vector3(0.4, 1.6, -0.5), phaseOffset: 0 },
  { center: new THREE.Vector3(-0.3, 1.85, -0.7), phaseOffset: 3.1 },
  { center: new THREE.Vector3(1.0, 1.45, -0.35), phaseOffset: 6.2 },
];

export default function Ducks() {
  return (
    <>
      {FLOCK.map((duck, i) => (
        <DuckBrain key={i} center={duck.center} phaseOffset={duck.phaseOffset} />
      ))}
    </>
  );
}
