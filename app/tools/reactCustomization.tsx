import { createContext, useContext } from "react";
import { useMemo, useState } from "react";

// usa i metodi get e set per gestire allo stato
export function useDotNotation<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  const result = useMemo(() => ({
    get: state,
    set: (newValue: T | ((prev: T) => T)) => setState(newValue),
  }), [state]);

  return result;
}


// Funzione generica per creare un contesto
export function generateContext<T>(useContextLogic: () => T) {
  // 1) Crea il contesto con tipo generico T
  const Ctx = createContext<T | null>(null);

  // 2) Componente Provider
  function provider({ children }: { children: React.ReactNode }) {
    const value = useContextLogic();
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  // 3) Hook personalizzato per usare il contesto
  function context() {
    const context = useContext(Ctx);
    if (!context) {
      throw new Error("errore nella creazione del context");
    }
    return context;
  }

  return {provider, context} as const;
}