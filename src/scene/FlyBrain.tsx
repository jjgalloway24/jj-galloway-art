import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/fly.glb";

// Real rigged fly model (placeholder sphere replaced) — flight path is
// layered sine waves at mismatched frequencies per axis so it reads as an
// erratic buzzing fly rather than a clean repeating loop/orbit.
const CENTER = new THREE.Vector3(0.4, 1.55, -0.4);
const RADIUS = new THREE.Vector3(0.85, 0.35, 0.6);
const LOOKAHEAD_SECONDS = 0.15;

// FattooCreater's rig faces its own local +X with +Z up, not three.js's
// forward/up convention — this corrective offset is applied on top of the
// lookAt orientation every frame so the model actually points where it flies
const MODEL_FORWARD_CORRECTION = new THREE.Euler(Math.PI / 2, 0, Math.PI / 2);

// raw geometry spans ~0.73 units (comparable to the whole cabinet) — scale
// down to read as a small flying creature next to it, not another object
// the same size
const MODEL_SCALE = 0.12;

const scratchOffset = new THREE.Vector3();
const scratchPos = new THREE.Vector3();
const scratchLookAt = new THREE.Vector3();
const scratchQuat = new THREE.Quaternion();
const correctionQuat = new THREE.Quaternion().setFromEuler(MODEL_FORWARD_CORRECTION);
const lookMatrix = new THREE.Matrix4();

function flightOffset(t: number, out: THREE.Vector3) {
  out.set(
    Math.sin(t * 0.6) * RADIUS.x + Math.sin(t * 1.7) * RADIUS.x * 0.25,
    Math.sin(t * 0.9 + 1.3) * RADIUS.y + Math.sin(t * 2.3) * RADIUS.y * 0.3,
    Math.cos(t * 0.5 + 0.6) * RADIUS.z + Math.sin(t * 1.3) * RADIUS.z * 0.25
  );
  return out;
}

export default function FlyBrain() {
  const group = useRef<THREE.Group>(null!);
  // single instance on screen — safe to use the cached scene directly rather
  // than cloning, which would need SkeletonUtils.clone (not plain
  // Object3D.clone) to avoid breaking this skinned mesh's bone bindings
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions["Take 001"]?.reset().play();
  }, [actions]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    flightOffset(t, scratchOffset);
    scratchPos.copy(CENTER).add(scratchOffset);
    group.current.position.copy(scratchPos);

    flightOffset(t + LOOKAHEAD_SECONDS, scratchOffset);
    scratchLookAt.copy(CENTER).add(scratchOffset);

    lookMatrix.lookAt(scratchPos, scratchLookAt, THREE.Object3D.DEFAULT_UP);
    scratchQuat.setFromRotationMatrix(lookMatrix).multiply(correctionQuat);
    group.current.quaternion.copy(scratchQuat);
  });

  return (
    <group ref={group} scale={MODEL_SCALE}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
