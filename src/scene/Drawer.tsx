import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useCabinet } from "../state/CabinetContext";
import type { DrawerConfig } from "../data/drawers";

// how far through the authored open animation a hover preview scrubs to —
// the folder only starts rising in the back half of the shared timeline
// (it slides out with the drawer first), so this needs to reach past that
// point or hover shows the drawer opening with no folder emergence at all
const PEEK_FRACTION = 0.8;
// how far in front of the camera the folder settles once fully open — must
// stay comfortably less than the camera's open-state distance to the drawer,
// otherwise the drawer geometry ends up closer to camera than the folder
// and renders in front of it
const FLY_DISTANCE = 0.8;
// margin so the flown folder overscans the viewport instead of leaving edges
// visible — generous because the folder's authored tilt foreshortens its
// effective on-screen size once it's facing the camera
const COVER_MARGIN = 1.9;

const IDENTITY_QUAT = new THREE.Quaternion();

interface DrawerProps {
  config: DrawerConfig;
  model: THREE.Object3D;
  folderModel: THREE.Object3D;
  actions: Record<string, THREE.AnimationAction | undefined>;
  mixer: THREE.AnimationMixer;
}

export default function Drawer({ config, model, folderModel, actions, mixer }: DrawerProps) {
  const { hovered, opened, setHovered, toggleOpen } = useCabinet();
  const progress = useRef(0);
  const flying = useRef(false);
  const started = useRef(false);
  // single shared 0..1 blend driving position, scale AND rotation together
  // during the fly — interpolating each of those independently (even with
  // matched damping rates) lets them drift out of sync frame to frame,
  // which reads as sporadic/wobbly instead of one clean motion
  const flightProgress = useRef(0);
  const restPosition = useRef(new THREE.Vector3());
  const lookHelper = useRef(new THREE.Object3D());
  const forwardHelper = useRef(new THREE.Vector3());
  const desiredCenter = useRef(new THREE.Vector3());
  const offsetHelper = useRef(new THREE.Vector3());
  const flyPositionTarget = useRef(new THREE.Vector3());

  const isOpen = opened === config.id;
  const isHovered = hovered === config.id;
  const isOtherOpen = opened !== null && !isOpen;

  // this mesh's geometry isn't centered on its own local origin — its
  // vertices are baked at an offset (matching wherever it sits in the
  // drawer), the same way the drawer's own geometry is. That's fine for the
  // authored open/close animation (its keyframes already account for it),
  // but once we take over position/scale/rotation manually for the fly-to-
  // camera stage, we have to compensate for that offset ourselves — setting
  // .position directly moves the local origin, not the visual center.
  const { folderSize, localCenter } = useMemo(() => {
    const mesh = folderModel as THREE.Mesh;
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { folderSize: size, localCenter: center };
  }, [folderModel]);

  useFrame((state, delta) => {
    // `actions` entries are lazy getters that only resolve once Cabinet's
    // root ref is attached — looking them up here (rather than once at
    // mount) guarantees that's already happened
    const drawerAction = actions[config.drawerClip] ?? null;
    const folderAction = actions[config.folderClip] ?? null;
    if (!drawerAction || !folderAction) return;

    if (!started.current) {
      started.current = true;
      [drawerAction, folderAction].forEach((action) => {
        action.reset().play();
        action.paused = true;
      });
    }

    // stay fully open for as long as the folder is flying in either
    // direction — the drawer shouldn't start sliding shut until the file
    // has actually made it back inside (flying.current only clears once
    // the fly-back below finishes)
    const target = isOpen || flying.current ? 1 : isHovered && opened === null ? PEEK_FRACTION : 0;
    const rate = target > progress.current ? 3 : 6;
    progress.current = THREE.MathUtils.damp(progress.current, target, rate, delta);

    if (isOpen && progress.current > 0.98 && !flying.current) {
      flying.current = true;
      flightProgress.current = 0;
      restPosition.current.copy(folderModel.position);
    }

    // the drawer and folder clips were authored on one shared timeline (the
    // folder rising only after the drawer's slide finishes) but have
    // different durations — scrubbing each to `progress * its own duration`
    // independently desyncs them, letting the longer clip (folder) get
    // ahead of the shorter one (drawer) and poke through its still-closing
    // face. Use one shared absolute time instead; the shorter clip just
    // holds its final pose once that time exceeds its own duration.
    const sharedDuration = Math.max(drawerAction.getClip().duration, folderAction.getClip().duration);
    const sharedTime = THREE.MathUtils.clamp(progress.current, 0, 1) * sharedDuration;
    drawerAction.time = Math.min(sharedTime, drawerAction.getClip().duration);
    folderAction.enabled = !flying.current;
    if (folderAction.enabled) {
      folderAction.time = Math.min(sharedTime, folderAction.getClip().duration);
    }
    mixer.update(0);

    if (!flying.current) {
      // resting/hover/mid-open: let the authored animation drive position,
      // just make sure scale/rotation stay at rest in case a previous fly
      // left them altered
      folderModel.scale.setScalar(THREE.MathUtils.damp(folderModel.scale.x, 1, 6, delta));
      folderModel.quaternion.slerp(IDENTITY_QUAT, 1 - Math.exp(-delta * 6));
      return;
    }

    const cam = state.camera as THREE.PerspectiveCamera;

    // recomputed live every frame (the camera may still be settling into
    // its own open-state dolly), but always blended via flightProgress below
    // rather than each given its own independent convergence rate
    cam.getWorldDirection(forwardHelper.current);
    desiredCenter.current.copy(cam.position).addScaledVector(forwardHelper.current, FLY_DISTANCE);

    const vFov = (cam.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFov / 2) * FLY_DISTANCE;
    const visibleWidth = visibleHeight * cam.aspect;
    const flyScale = Math.max(
      (visibleHeight * COVER_MARGIN) / folderSize.y,
      (visibleWidth * COVER_MARGIN) / folderSize.x
    );

    lookHelper.current.position.copy(desiredCenter.current);
    lookHelper.current.lookAt(cam.position);

    const flightTarget = isOpen ? 1 : 0;
    // noticeably slower flying out (a deliberate reveal) than flying back
    // in (snappier, since the drawer is waiting on it before it can close)
    const flightRate = flightTarget > flightProgress.current ? 1.1 : 3.5;
    flightProgress.current = THREE.MathUtils.damp(flightProgress.current, flightTarget, flightRate, delta);
    const p = flightProgress.current;

    // scale and rotation blend from their rest values straight to the live
    // fly target, both driven by the exact same `p` — always in lockstep
    const scale = THREE.MathUtils.lerp(1, flyScale, p);
    folderModel.scale.setScalar(scale);
    folderModel.quaternion.copy(IDENTITY_QUAT).slerp(lookHelper.current.quaternion, p);

    // position also uses `p`, but its rest/fly endpoints have to account for
    // the same local-origin offset the scale/rotation above just applied
    offsetHelper.current.copy(localCenter).multiplyScalar(scale).applyQuaternion(folderModel.quaternion);
    flyPositionTarget.current.copy(desiredCenter.current).sub(offsetHelper.current);
    folderModel.position.copy(restPosition.current).lerp(flyPositionTarget.current, p);

    if (!isOpen && p < 0.01) flying.current = false;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isOtherOpen) setHovered(config.id);
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isOtherOpen) toggleOpen(config.id);
  };

  return (
    <>
      <primitive object={model} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick} />
      <primitive
        object={folderModel}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
    </>
  );
}
