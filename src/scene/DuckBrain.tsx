import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useDuckGame } from "../state/DuckGameContext";

const MODEL_URL = "/models/duck.fbx";
const FLY_CLIP_NAME = "Duck|Fly_F_IP";

const textureLoader = new THREE.TextureLoader();
const albedoMap = textureLoader.load("/models/textures/duck-albedo.jpg");
albedoMap.colorSpace = THREE.SRGBColorSpace;
const normalMap = textureLoader.load("/models/textures/duck-normal.png");
const roughnessMap = textureLoader.load("/models/textures/duck-roughness.jpg");
const metalnessMap = textureLoader.load("/models/textures/duck-metallic.jpg");
const aoMap = textureLoader.load("/models/textures/duck-ao.jpg");

const DUCK_MATERIAL = new THREE.MeshStandardMaterial({
  map: albedoMap,
  normalMap,
  roughnessMap,
  metalnessMap,
  aoMap,
  // MeshStandardMaterial multiplies each map by its scalar counterpart —
  // metalness defaults to 0, which would zero out metalnessMap entirely
  roughness: 1,
  metalness: 1,
});

// Duck Hunt vibe: a wide, unhurried sweep across the sky rather than the
// fly's fast erratic buzz — slower frequencies, bigger horizontal radius.
const RADIUS = new THREE.Vector3(1.15, 0.45, 0.55);
const LOOKAHEAD_SECONDS = 0.2;

// Confirmed by rendering at identity rotation: this model sits right-side
// up with the beak pointing along local +X, the same convention as the fly
// model and the earlier plain-OBJ duck export. +90° around Y maps local +X
// to Three.js's canonical forward (-Z): R_y(90)*(1,0,0) = (0,0,-1).
const MODEL_BASE_CORRECTION = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
// FBXLoader already normalizes the FBX's internal unit scale to meters, so
// the loaded model comes in at a realistic ~0.3 x 0.6 x 0.76 (roughly a
// real duck's size) — only a modest scale-up is needed for visibility.
const MODEL_SCALE = 0.45;

// duck-hunt-style hit reaction: a brief upward kick, then gravity takes
// over while it tumbles, until it's fallen out of view — then it respawns.
const FALL_GRAVITY = 3.6;
const HIT_KICK_UP_SPEED = 0.55;
const TUMBLE_SPEED = 5;
const FALL_OUT_OF_VIEW_Y = -1.6;
const RESPAWN_DELAY_SECONDS = 2.5;
// invisible-but-raycastable sphere, generous relative to the model so it's
// actually clickable
const HIT_TARGET_WORLD_RADIUS = 0.32;

const correctionQuat = MODEL_BASE_CORRECTION.clone();
const lookMatrix = new THREE.Matrix4();
const tumbleDelta = new THREE.Quaternion();

type FlightState = "alive" | "falling" | "respawning";

interface DuckBrainProps {
  center: THREE.Vector3;
  phaseOffset: number;
}

export default function DuckBrain({ center, phaseOffset }: DuckBrainProps) {
  const group = useRef<THREE.Group>(null!);
  const { registerDuck } = useDuckGame();
  const fbx = useLoader(FBXLoader, MODEL_URL);
  const instanceObj = useMemo(() => {
    const cloned = cloneSkinned(fbx);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // aoMap requires a second UV channel — this model only ships one,
        // so reuse it rather than leaving the AO map inert
        const uv = child.geometry.attributes.uv;
        if (uv && !child.geometry.attributes.uv2) child.geometry.setAttribute("uv2", uv);
        child.material = DUCK_MATERIAL;
        child.castShadow = true;
      }
    });
    return cloned;
  }, [fbx]);
  const { actions } = useAnimations(fbx.animations, group);

  useEffect(() => {
    const clip = actions[FLY_CLIP_NAME] ?? Object.values(actions)[0] ?? null;
    clip?.reset().play();
  }, [actions]);

  const flightState = useRef<FlightState>("alive");
  const currentTime = useRef(0);
  const fallVelocity = useRef(new THREE.Vector3());
  const tumbleAxis = useRef(new THREE.Vector3(1, 0, 0));
  const respawnAt = useRef(0);

  const scratchOffset = useRef(new THREE.Vector3());
  const scratchPos = useRef(new THREE.Vector3());
  const scratchLookAt = useRef(new THREE.Vector3());
  const scratchQuat = useRef(new THREE.Quaternion());

  const flightOffset = (t: number, out: THREE.Vector3) => {
    const p = t + phaseOffset;
    out.set(
      Math.sin(p * 0.25) * RADIUS.x + Math.sin(p * 0.7) * RADIUS.x * 0.2,
      Math.sin(p * 0.35 + 1.3) * RADIUS.y + Math.sin(p * 0.9) * RADIUS.y * 0.25,
      Math.cos(p * 0.22 + 0.6) * RADIUS.z + Math.sin(p * 0.55) * RADIUS.z * 0.2
    );
    return out;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (flightState.current !== "alive") return;

    flightState.current = "falling";
    registerDuck();
    Object.values(actions).forEach((a) => a?.stop());

    const t = currentTime.current;
    flightOffset(t, scratchPos.current);
    flightOffset(t + LOOKAHEAD_SECONDS, scratchLookAt.current);
    fallVelocity.current
      .subVectors(scratchLookAt.current, scratchPos.current)
      .normalize()
      .multiplyScalar(0.45)
      .setY(HIT_KICK_UP_SPEED);

    tumbleAxis.current.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    currentTime.current = t;

    if (flightState.current === "alive") {
      flightOffset(t, scratchOffset.current);
      scratchPos.current.copy(center).add(scratchOffset.current);
      group.current.position.copy(scratchPos.current);

      flightOffset(t + LOOKAHEAD_SECONDS, scratchOffset.current);
      scratchLookAt.current.copy(center).add(scratchOffset.current);

      lookMatrix.lookAt(scratchPos.current, scratchLookAt.current, THREE.Object3D.DEFAULT_UP);
      scratchQuat.current.setFromRotationMatrix(lookMatrix).multiply(correctionQuat);
      group.current.quaternion.copy(scratchQuat.current);
      return;
    }

    if (flightState.current === "falling") {
      fallVelocity.current.y -= FALL_GRAVITY * delta;
      group.current.position.addScaledVector(fallVelocity.current, delta);

      tumbleDelta.setFromAxisAngle(tumbleAxis.current, TUMBLE_SPEED * delta);
      group.current.quaternion.multiply(tumbleDelta);

      if (group.current.position.y < FALL_OUT_OF_VIEW_Y) {
        flightState.current = "respawning";
        respawnAt.current = t + RESPAWN_DELAY_SECONDS;
        group.current.visible = false;
      }
      return;
    }

    // respawning
    if (t >= respawnAt.current) {
      flightState.current = "alive";
      group.current.visible = true;
      const clip = actions[FLY_CLIP_NAME] ?? Object.values(actions)[0] ?? null;
      clip?.reset().play();
    }
  });

  return (
    <group ref={group} scale={MODEL_SCALE} onClick={handleClick}>
      <primitive object={instanceObj} />
      {/* generous invisible hit target, sized in the model's own (unscaled)
          local units to end up at HIT_TARGET_WORLD_RADIUS once scaled */}
      <mesh>
        <sphereGeometry args={[HIT_TARGET_WORLD_RADIUS / MODEL_SCALE, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

useLoader.preload(FBXLoader, MODEL_URL);
