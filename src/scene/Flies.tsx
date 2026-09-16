import * as THREE from "three";
import FlyBrain from "./FlyBrain";

// hand-placed so the flock spreads across the sky above the cabinet rather
// than overlapping — phaseOffset staggers each fly's position along the
// same sine-wave flight path so they don't move in lockstep
const FLOCK = [
  { center: new THREE.Vector3(0.4, 1.55, -0.4), phaseOffset: 0 },
  { center: new THREE.Vector3(-0.35, 1.75, -0.6), phaseOffset: 2.4 },
  { center: new THREE.Vector3(1.05, 1.4, -0.25), phaseOffset: 4.6 },
  { center: new THREE.Vector3(0.15, 1.95, -0.85), phaseOffset: 1.2 },
];

export default function Flies() {
  return (
    <>
      {FLOCK.map((fly, i) => (
        <FlyBrain key={i} center={fly.center} phaseOffset={fly.phaseOffset} />
      ))}
    </>
  );
}
