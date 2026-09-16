import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useFlyGame } from "../state/FlyGameContext";

const MODEL_URL = "/models/fly.glb";

// Real rigged fly model — flight path is layered sine waves at mismatched
// frequencies per axis so it reads as an erratic buzzing fly rather than a
// clean repeating loop/orbit. Each fly gets its own center + phase offset
// (see Flies.tsx) so multiple instances don't fly in lockstep or overlap.
const RADIUS = new THREE.Vector3(0.85, 0.35, 0.6);
const LOOKAHEAD_SECONDS = 0.15;

// Derived (not guessed) from the GLB's bone hierarchy: Neck->Head translates
// ~(0.08, 0, 0), almost pure local +X, so the model's head points along
// local +X. +90 deg around Y maps local +X to three.js's canonical forward
// (-Z) exactly: R_y(90)*(1,0,0) = (0,0,-1) — verified against four different
// travel directions (level, straight up, toward camera, diagonal), head
// leads correctly in all of them. ROLL is a separate knob (rotation around
// that now-forward-aligned axis) for legs-down vs legs-up, since aligning
// forward alone leaves roll undetermined; 0 already reads correctly here.
const MODEL_BASE_CORRECTION = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
const MODEL_ROLL_CORRECTION_RADIANS = 0;

// raw geometry spans ~0.73 units (comparable to the whole cabinet) — scale
// down to read as a small flying creature next to it, not another object
// the same size
const MODEL_SCALE = 0.12;

// duck-hunt-style hit reaction: a brief upward kick, then gravity takes over
// while it tumbles, until it's fallen out of view — then it respawns
const FALL_GRAVITY = 4.2;
const HIT_KICK_UP_SPEED = 0.6;
const TUMBLE_SPEED = 10;
const FALL_OUT_OF_VIEW_Y = -1.6;
const RESPAWN_DELAY_SECONDS = 2.5;
// invisible-but-raycastable sphere, generous relative to the small/fast
// model so it's actually clickable
const HIT_TARGET_WORLD_RADIUS = 0.22;

const rollCorrectionQuat = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(0, 0, 1),
  MODEL_ROLL_CORRECTION_RADIANS
);
// roll applied in the canonical (post-base-correction) frame, so it spins
// around the now-forward-aligned axis rather than the model's raw local one
const correctionQuat = rollCorrectionQuat.clone().multiply(MODEL_BASE_CORRECTION);
const lookMatrix = new THREE.Matrix4();
const tumbleDelta = new THREE.Quaternion();

type FlightState = "alive" | "falling" | "respawning";

interface FlyBrainProps {
  center: THREE.Vector3;
  phaseOffset: number;
}

export default function FlyBrain({ center, phaseOffset }: FlyBrainProps) {
  const group = useRef<THREE.Group>(null!);
  const { registerKill } = useFlyGame();
  // multiple flies on screen at once — each needs its own skeleton/bone
  // instances (SkeletonUtils.clone, not plain Object3D.clone) so their
  // animations and transforms don't fight over the same shared bones
  const { scene, animations } = useGLTF(MODEL_URL);
  const instanceScene = useMemo(() => cloneSkinned(scene), [scene]);
  const { actions } = useAnimations(animations, group);

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
      Math.sin(p * 0.6) * RADIUS.x + Math.sin(p * 1.7) * RADIUS.x * 0.25,
      Math.sin(p * 0.9 + 1.3) * RADIUS.y + Math.sin(p * 2.3) * RADIUS.y * 0.3,
      Math.cos(p * 0.5 + 0.6) * RADIUS.z + Math.sin(p * 1.3) * RADIUS.z * 0.25
    );
    return out;
  };

  useEffect(() => {
    actions["Take 001"]?.reset().play();
  }, [actions]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (flightState.current !== "alive") return;

    flightState.current = "falling";
    actions["Take 001"]?.stop();
    registerKill();

    // keep whatever horizontal momentum it had (same tangent used for
    // in-flight orientation) plus a little upward kick, then let gravity
    // take over from there
    const t = currentTime.current;
    flightOffset(t, scratchPos.current);
    flightOffset(t + LOOKAHEAD_SECONDS, scratchLookAt.current);
    fallVelocity.current
      .subVectors(scratchLookAt.current, scratchPos.current)
      .normalize()
      .multiplyScalar(0.5)
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
      actions["Take 001"]?.reset().play();
    }
  });

  return (
    <group ref={group} scale={MODEL_SCALE} onClick={handleClick}>
      <primitive object={instanceScene} />
      {/* generous invisible hit target — the real mesh (thin legs/wings) is
          fiddly to click precisely at this scale */}
      <mesh>
        <sphereGeometry args={[HIT_TARGET_WORLD_RADIUS / MODEL_SCALE, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
