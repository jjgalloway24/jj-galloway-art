import { createContext, useContext, useState, type ReactNode } from "react";

interface DuckGameState {
  duckCount: number;
  registerDuck: () => void;
}

const DuckGameContext = createContext<DuckGameState | null>(null);

export function DuckGameProvider({ children }: { children: ReactNode }) {
  const [duckCount, setDuckCount] = useState(0);
  const registerDuck = () => setDuckCount((c) => c + 1);

  return <DuckGameContext.Provider value={{ duckCount, registerDuck }}>{children}</DuckGameContext.Provider>;
}

export function useDuckGame() {
  const ctx = useContext(DuckGameContext);
  if (!ctx) throw new Error("useDuckGame must be used within DuckGameProvider");
  return ctx;
}
