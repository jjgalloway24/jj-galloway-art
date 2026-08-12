import { createContext, useContext, useState, type ReactNode } from "react";

export type DrawerId = "portfolio" | "about" | "archive";

interface CabinetState {
  hovered: DrawerId | null;
  opened: DrawerId | null;
  setHovered: (id: DrawerId | null) => void;
  toggleOpen: (id: DrawerId) => void;
  close: () => void;
}

const CabinetContext = createContext<CabinetState | null>(null);

export function CabinetProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<DrawerId | null>(null);
  const [opened, setOpened] = useState<DrawerId | null>(null);

  const toggleOpen = (id: DrawerId) => {
    setOpened((current) => (current === id ? null : id));
  };

  const close = () => setOpened(null);

  return (
    <CabinetContext.Provider value={{ hovered, opened, setHovered, toggleOpen, close }}>
      {children}
    </CabinetContext.Provider>
  );
}

export function useCabinet() {
  const ctx = useContext(CabinetContext);
  if (!ctx) throw new Error("useCabinet must be used within CabinetProvider");
  return ctx;
}
