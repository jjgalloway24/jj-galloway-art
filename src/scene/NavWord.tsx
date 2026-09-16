import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useCabinet, type DrawerId } from "../state/CabinetContext";
import OutOfOrderSign from "./OutOfOrderSign";

interface NavWordProps {
  node: THREE.Object3D;
  drawerId: DrawerId;
  disabled?: boolean;
}

export default function NavWord({ node, drawerId, disabled }: NavWordProps) {
  const { opened, toggleOpen } = useCabinet();
  const isOtherOpen = opened !== null && opened !== drawerId;

  // anchor + orientation for a disabled word's hanging sign. The sign is a
  // child of `node` so it's rigidly attached to it — moves/rotates with the
  // word rather than floating independently — which means its position has
  // to be found in world space (top-center of the text, nudged up and
  // toward the camera) and then converted back into node's local space, and
  // its content needs a corrective counter-rotation so it still faces the
  // camera correctly despite inheriting node's own baked rotation.
  const { signAnchor, signOrientation } = useMemo(() => {
    if (!disabled) return { signAnchor: null, signOrientation: undefined };
    node.updateMatrixWorld(true);
    const worldBox = new THREE.Box3().setFromObject(node);
    const worldTop = new THREE.Vector3(
      (worldBox.min.x + worldBox.max.x) / 2 - 0.05,
      worldBox.max.y + 0.05,
      worldBox.max.z + 0.06
    );
    return {
      signAnchor: node.worldToLocal(worldTop),
      signOrientation: node.quaternion.clone().invert(),
    };
  }, [node, disabled]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!disabled && !isOtherOpen) toggleOpen(drawerId);
  };
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!disabled && !isOtherOpen) document.body.style.cursor = "pointer";
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
  };

  return (
    <primitive
      object={node}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {signAnchor && <OutOfOrderSign position={signAnchor} orientation={signOrientation} />}
    </primitive>
  );
}
