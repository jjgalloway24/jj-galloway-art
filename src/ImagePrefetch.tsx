import { useEffect, useRef } from "react";
import { PROJECTS } from "./data/portfolio";
import { PHOTO_SRC } from "./data/about";
import { ENTRIES } from "./data/archive";

// warms the browser's cache for Portfolio/About/Archive images as soon as
// the app mounts, so they're already available by the time someone
// actually clicks into those sections. Runs in parallel with (not after)
// the 3D scene's own model/HDRI load — fetchPriority "low" lets the
// browser still favor those over this large batch of images without us
// having to delay the start and lose that time entirely.
//
// Fetching the bytes isn't enough on its own: a cached-but-undecoded JPEG
// still has to be decoded into a paintable bitmap the first time an <img>
// actually renders it, and that decode is what shows up as a flash of the
// card's gradient placeholder before the real image pops in. img.decode()
// forces that decode to happen now instead, so the browser's decoded-image
// cache is already warm by the time the real <img> mounts.
export default function ImagePrefetch() {
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    const urls = [
      ...PROJECTS.map((p) => p.image),
      PHOTO_SRC,
      ...ENTRIES.map((e) => e.image),
    ].filter((src): src is string => Boolean(src));

    urls.forEach((src) => {
      const img = new Image();
      img.fetchPriority = "low";
      img.src = src;
      img.decode().catch(() => {});
    });
  }, []);

  return null;
}
