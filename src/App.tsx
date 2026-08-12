import { lazy, Suspense } from "react";
import { CabinetProvider } from "./state/CabinetContext";
import Scene from "./scene/Scene";
import LoadingScreen from "./LoadingScreen";

const Overlay = lazy(() => import("./Overlay"));

export default function App() {
  return (
    <CabinetProvider>
      <div className="app">
        <div className="canvas-wrap">
          <Scene />
        </div>
        <LoadingScreen />
        <Suspense fallback={null}>
          <Overlay />
        </Suspense>
        <div className="hint">
          <span className="hint-hover">Hover a drawer to preview · Click to open</span>
          <span className="hint-touch">Tap a drawer to open</span>
        </div>
      </div>
    </CabinetProvider>
  );
}
