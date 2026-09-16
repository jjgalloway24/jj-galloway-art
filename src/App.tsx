import { lazy, Suspense } from "react";
import { CabinetProvider } from "./state/CabinetContext";
import { FlyGameProvider } from "./state/FlyGameContext";
import Scene from "./scene/Scene";
import LoadingScreen from "./LoadingScreen";
import ImagePrefetch from "./ImagePrefetch";
import FlyCounter from "./components/FlyCounter";

const Overlay = lazy(() => import("./Overlay"));

export default function App() {
  return (
    <CabinetProvider>
      <FlyGameProvider>
        <div className="app">
          <div className="canvas-wrap">
            <Scene />
          </div>
          <LoadingScreen />
          <ImagePrefetch />
          <FlyCounter />
          <Suspense fallback={null}>
            <Overlay />
          </Suspense>
          <div className="hint">
            <span className="hint-hover">Hover a drawer to preview · Click to open</span>
            <span className="hint-touch">Tap a drawer to open</span>
          </div>
        </div>
      </FlyGameProvider>
    </CabinetProvider>
  );
}
