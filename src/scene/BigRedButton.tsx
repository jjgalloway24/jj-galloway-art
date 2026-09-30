import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { createStripeTexture } from "./stripeTexture";
import { playStupidNoise } from "../utils/stupidNoise";

// sits on the ground in front-right of the cabinet, in the open reflective
// floor area rather than overlapping the cabinet or the nav text
const POSITION = new THREE.Vector3(0.85, 0, 0.85);

const PLATE_RADIUS = 0.22;
const HOUSING_RADIUS = 0.14;
const HOUSING_HEIGHT = 0.09;
const DOME_RADIUS = 0.1;
const DOME_REST_Y = HOUSING_HEIGHT + DOME_RADIUS * 0.35;
const PRESS_DEPTH = 0.035;

export default function BigRedButton() {
  const stripeTexture = useMemo(() => createStripeTexture(), []);
  const domeRef = useRef<THREE.Group>(null!);
  const domeMaterial = useRef<THREE.MeshStandardMaterial>(null!);
  const pressAmount = useRef(0);
  const pressed = useRef(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    pressed.current = true;
    playStupidNoise();
  };

  useFrame((state, delta) => {
    const target = pressed.current ? 1 : 0;
    const rate = pressed.current ? 22 : 6;
    pressAmount.current = THREE.MathUtils.damp(pressAmount.current, target, rate, delta);
    if (pressed.current && pressAmount.current > 0.85) pressed.current = false;

    if (domeRef.current) {
      domeRef.current.position.y = DOME_REST_Y - pressAmount.current * PRESS_DEPTH;
    }
    if (domeMaterial.current) {
      domeMaterial.current.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 2.4) * 0.25;
    }
  });

  return (
    <group
      position={POSITION}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* hazard-stripe mounting plate */}
      <mesh position={[0, 0.006, 0]} receiveShadow>
        <cylinderGeometry args={[PLATE_RADIUS, PLATE_RADIUS * 1.05, 0.012, 40]} />
        <meshStandardMaterial map={stripeTexture} roughness={0.8} metalness={0.05} />
      </mesh>

      {/* "IMPORTANT" plaque on the plate */}
      <Text
        position={[0, 0.013, PLATE_RADIUS * 0.62]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        font="/fonts/Oswald-Bold.ttf"
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
      >
        IMPORTANT
      </Text>
      <Text
        position={[0, 0.013, -PLATE_RADIUS * 0.62]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.024}
        font="/fonts/Oswald-Bold.ttf"
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
      >
        DO NOT PRESS
      </Text>

      {/* black control housing */}
      <mesh position={[0, HOUSING_HEIGHT / 2 + 0.012, 0]} castShadow>
        <cylinderGeometry args={[HOUSING_RADIUS, HOUSING_RADIUS * 1.15, HOUSING_HEIGHT, 32]} />
        <meshStandardMaterial color="#161616" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* chrome trim ring where the dome meets the housing */}
      <mesh position={[0, HOUSING_HEIGHT + 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[HOUSING_RADIUS * 0.92, 0.012, 12, 40]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* the big red dome itself, with a warning glow that pulses gently */}
      <group ref={domeRef} position={[0, DOME_REST_Y + 0.012, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[DOME_RADIUS, 32, 20, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial
            ref={domeMaterial}
            color="#b3181c"
            emissive="#ff2222"
            emissiveIntensity={0.55}
            roughness={0.3}
            metalness={0.15}
          />
        </mesh>
      </group>

      {/* generous invisible hit target so the smallish dome is easy to click */}
      <mesh position={[0, HOUSING_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[PLATE_RADIUS * 1.1, PLATE_RADIUS * 1.1, 0.35, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
