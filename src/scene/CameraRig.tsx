import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCabinet } from "../state/CabinetContext";
import { DRAWERS } from "../data/drawers";

// wide enough to frame the cabinet AND the nav text beside it (title +
// three words extend out to roughly x=1.4), not just the cabinet alone.
// look target's x is centered on the title (not the cabinet), which pushes
// the cabinet further toward the left of frame and the words toward the
// right — matching the reference composition. Camera sits lower than a
// level shot so the horizon sits low in frame with mostly sky above it.
export const HOME_POSITION = new THREE.Vector3(-1.0, 0.9, 2.5);
const HOME_LOOK = new THREE.Vector3(0.57, 0.62, 0.15);

export default function CameraRig() {
  const { camera } = useThree();
  const { opened } = useCabinet();
  const lookTarget = useRef(HOME_LOOK.clone());

  useFrame((_, delta) => {
    const drawer = DRAWERS.find((d) => d.id === opened);
    const targetPos = drawer
      ? new THREE.Vector3(-0.35, drawer.approxY * 0.5 + 0.25, 1.6)
      : HOME_POSITION;
    const targetLook = drawer
      ? new THREE.Vector3(0, drawer.approxY * 0.6 + 0.15, 0.3)
      : HOME_LOOK;

    const t = 1 - Math.exp(-delta * 2.6);
    camera.position.lerp(targetPos, t);
    lookTarget.current.lerp(targetLook, t);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
