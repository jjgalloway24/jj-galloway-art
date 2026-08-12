import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CabinetProvider, useCabinet } from "./state/CabinetContext";
import { DRAWERS } from "./data/drawers";
import Scene from "./scene/Scene";
import PortfolioContent from "./content/PortfolioContent";
import AboutContent from "./content/AboutContent";
import ArchiveContent from "./content/ArchiveContent";

const ORIGIN_BY_DRAWER: Record<string, string> = {
  portfolio: "50% 22%",
  about: "50% 50%",
  archive: "50% 78%",
};

function Overlay() {
  const { opened, close } = useCabinet();
  const drawer = DRAWERS.find((d) => d.id === opened);

  return (
    <AnimatePresence>
      {drawer && (
        <motion.div
          className="overlay"
          style={
            {
              transformOrigin: ORIGIN_BY_DRAWER[drawer.id],
              "--page-accent": drawer.tabColor,
            } as CSSProperties
          }
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, delay: 0.55, ease: [0.2, 0.8, 0.2, 1] },
          }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25, ease: "easeIn" } }}
        >
          <div className="overlay-inner">
            <div className="overlay-header">
              <h1>
                <span className="tab-accent" style={{ background: drawer.tabColor }} />
                {drawer.label}
              </h1>
              <button className="close-btn" onClick={close} aria-label="Close">
                ✕
              </button>
            </div>
            {drawer.id === "portfolio" && <PortfolioContent />}
            {drawer.id === "about" && <AboutContent />}
            {drawer.id === "archive" && <ArchiveContent />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <CabinetProvider>
      <div className="app">
        <div className="canvas-wrap">
          <Scene />
        </div>
        <Overlay />
        <div className="hint">
          <span className="hint-hover">Hover a drawer to preview · Click to open</span>
          <span className="hint-touch">Tap a drawer to open</span>
        </div>
      </div>
    </CabinetProvider>
  );
}
