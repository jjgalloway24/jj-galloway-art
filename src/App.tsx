import { lazy, Suspense } from "react";
import { CabinetProvider } from "./state/CabinetContext";
import { DuckGameProvider } from "./state/DuckGameContext";
import Scene from "./scene/Scene";
import LoadingScreen from "./LoadingScreen";
import ImagePrefetch from "./ImagePrefetch";
import DuckCounter from "./components/DuckCounter";

const Overlay = lazy(() => import("./Overlay"));

export default function App() {
  return (
    <CabinetProvider>
      <DuckGameProvider>
        <div className="app">
          <div className="canvas-wrap">
            <Scene />
          </div>
          <LoadingScreen />
          <ImagePrefetch />
          <DuckCounter />
          <Suspense fallback={null}>
            <Overlay />
          </Suspense>
          <div className="hint">
            <span className="hint-hover">Hover a drawer to preview · Click to open</span>
            <span className="hint-touch">Tap a drawer to open</span>
          </div>
        </div>
      </DuckGameProvider>
    </CabinetProvider>
  );
}
