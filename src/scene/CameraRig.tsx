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

// the home composition (cabinet + title + nav words spread horizontally)
// was framed against this aspect ratio. On a narrower viewport (mobile
// portrait) the horizontal frustum shrinks below what's needed to fit that
// spread, so the camera dollies back along the same viewing direction to
// compensate — capped so extremely tall/thin windows don't zoom out forever.
const REFERENCE_ASPECT = 1.18;
const MAX_ZOOM_OUT = 2.6;
// OrbitControls' maxDistance (Scene.tsx) must cover this, or it clamps the
// camera back before the zoom-out above ever takes visible effect
export const MAX_HOME_DISTANCE = HOME_POSITION.distanceTo(HOME_LOOK) * MAX_ZOOM_OUT;

const homeOffset = new THREE.Vector3();
const scaledHomePos = new THREE.Vector3();

export default function CameraRig() {
  const { camera } = useThree();
  const { opened } = useCabinet();
  const lookTarget = useRef(HOME_LOOK.clone());

  useFrame((_, delta) => {
    const drawer = DRAWERS.find((d) => d.id === opened);
    let targetPos: THREE.Vector3;
    let targetLook: THREE.Vector3;

    if (drawer) {
      targetPos = new THREE.Vector3(-0.35, drawer.approxY * 0.5 + 0.25, 1.6);
      targetLook = new THREE.Vector3(0, drawer.approxY * 0.6 + 0.15, 0.3);
    } else {
      const aspect = (camera as THREE.PerspectiveCamera).aspect;
      const zoomOut = THREE.MathUtils.clamp(REFERENCE_ASPECT / aspect, 1, MAX_ZOOM_OUT);
      homeOffset.copy(HOME_POSITION).sub(HOME_LOOK).multiplyScalar(zoomOut);
      scaledHomePos.copy(HOME_LOOK).add(homeOffset);
      targetPos = scaledHomePos;
      targetLook = HOME_LOOK;
    }

    const t = 1 - Math.exp(-delta * 2.6);
    camera.position.lerp(targetPos, t);
    lookTarget.current.lerp(targetLook, t);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
