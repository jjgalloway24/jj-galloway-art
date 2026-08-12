import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useCabinet, type DrawerId } from "../state/CabinetContext";

interface NavWordProps {
  node: THREE.Object3D;
  drawerId: DrawerId;
}

export default function NavWord({ node, drawerId }: NavWordProps) {
  const { opened, toggleOpen } = useCabinet();
  const isOtherOpen = opened !== null && opened !== drawerId;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isOtherOpen) toggleOpen(drawerId);
  };
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isOtherOpen) document.body.style.cursor = "pointer";
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
    />
  );
}
