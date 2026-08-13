import { useEffect, useRef } from "react";
import { useProgress } from "@react-three/drei";
import { PROJECTS } from "./data/portfolio";
import { PHOTO_SRC } from "./data/about";
import { ENTRIES } from "./data/archive";

// warms the browser's cache for Portfolio/About/Archive images once the 3D
// scene's own assets (model + HDRI) are done loading, so they're already
// available by the time someone actually clicks into those sections —
// deliberately sequenced to not compete with the 3D load for bandwidth
export default function ImagePrefetch() {
  const { active } = useProgress();
  const sceneWasLoading = useRef(false);
  const prefetched = useRef(false);

  useEffect(() => {
    if (active) sceneWasLoading.current = true;
    if (!active && sceneWasLoading.current && !prefetched.current) {
      prefetched.current = true;
      const urls = [
        ...PROJECTS.map((p) => p.image),
        PHOTO_SRC,
        ...ENTRIES.map((e) => e.image),
      ].filter((src): src is string => Boolean(src));

      urls.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [active]);

  return null;
}
