import { createContext, useContext, useState, type ReactNode } from "react";

interface FlyGameState {
  killCount: number;
  registerKill: () => void;
}

const FlyGameContext = createContext<FlyGameState | null>(null);

export function FlyGameProvider({ children }: { children: ReactNode }) {
  const [killCount, setKillCount] = useState(0);
  const registerKill = () => setKillCount((c) => c + 1);

  return <FlyGameContext.Provider value={{ killCount, registerKill }}>{children}</FlyGameContext.Provider>;
}

export function useFlyGame() {
  const ctx = useContext(FlyGameContext);
  if (!ctx) throw new Error("useFlyGame must be used within FlyGameProvider");
  return ctx;
}
