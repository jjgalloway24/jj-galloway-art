import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import Drawer from "./Drawer";
import NavWord from "./NavWord";
import { DRAWERS } from "../data/drawers";

const MODEL_URL = "/models/filing-cabinet.glb";
const TITLE_NODE_NAME = "Text";
// nav word nodes, in the same top-to-bottom order as DRAWERS
const NAV_WORD_NODES = ["Text001", "Text002", "Text003"];

export default function Cabinet() {
  const { scene, animations } = useGLTF(MODEL_URL);
  const rootRef = useRef<THREE.Group>(null!);
  // `actions` entries are lazy getters keyed off rootRef.current, which isn't
  // attached yet during this first render — don't resolve them here, pass
  // the dict itself down and let Drawer look clips up inside useFrame
  // (by then the ref is attached and the getters resolve correctly)
  const { actions, mixer } = useAnimations(animations, rootRef);

  // clone once, then pull the drawer/folder/text meshes out so the static
  // group below doesn't render them twice (each is placed under its own
  // animated/interactive group instead). The animation mixer binds to nodes
  // by name regardless of where they end up in the tree, as long as they're
  // still a descendant of rootRef — so re-parenting them here is safe.
  const { staticScene, drawerMeshes, folderMeshes, titleNode, navWordNodes } = useMemo(() => {
    const cloned = scene.clone(true);
    const meshes = new Map<string, THREE.Object3D>();
    const folders = new Map<string, THREE.Object3D>();

    DRAWERS.forEach((d) => {
      const node = cloned.getObjectByName(d.nodeName);
      if (node) {
        node.parent?.remove(node);
        meshes.set(d.nodeName, node);
      }
      const folderNode = cloned.getObjectByName(d.folderNodeName);
      if (folderNode) {
        folderNode.parent?.remove(folderNode);
        folderNode.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            // once flown to face the camera, whichever side happens to be
            // baked as "front" may end up facing away — render both sides so
            // it's never invisible depending on approach angle
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              m.side = THREE.DoubleSide;
            });
          }
        });
        folders.set(d.folderNodeName, folderNode);
      }
    });

    const title = cloned.getObjectByName(TITLE_NODE_NAME) ?? null;
    if (title) title.parent?.remove(title);

    const words = new Map<string, THREE.Object3D>();
    NAV_WORD_NODES.forEach((name, i) => {
      const node = cloned.getObjectByName(name);
      if (node) {
        node.parent?.remove(node);
        words.set(DRAWERS[i].id, node);
      }
    });

    // Blender exports light intensity in photometric units (candela/lux),
    // which read as thousands in glTF — massively overexposed at Three.js's
    // default scalar intensity. Rescale into a sane visual range.
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Light && obj.intensity > 50) {
        obj.intensity = Math.min(obj.intensity / 25000, 4.2);
      }
    });

    return { staticScene: cloned, drawerMeshes: meshes, folderMeshes: folders, titleNode: title, navWordNodes: words };
  }, [scene]);

  return (
    <group ref={rootRef}>
      <primitive object={staticScene} />
      {titleNode && <primitive object={titleNode} />}
      {DRAWERS.map((d) => {
        const model = drawerMeshes.get(d.nodeName);
        const folderModel = folderMeshes.get(d.folderNodeName);
        if (!model || !folderModel) return null;
        return (
          <Drawer key={d.id} config={d} model={model} folderModel={folderModel} actions={actions} mixer={mixer} />
        );
      })}
      {DRAWERS.map((d) => {
        const wordNode = navWordNodes.get(d.id);
        return wordNode ? <NavWord key={d.id} node={wordNode} drawerId={d.id} /> : null;
      })}
    </group>
  );
}

useGLTF.preload(MODEL_URL);
