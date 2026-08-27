import { createContext, useContext } from "react";

// Funzione generica per creare un contesto
export function generateContext<T>(useContextLogic: () => T) {
  // 1) Crea il contesto con tipo generico T
  const Context = createContext<T | null>(null);

  // 2) Componente Provider
  function provider({ children }: { children: React.ReactNode }) {
    const value = useContextLogic();
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  // 3) Hook personalizzato per usare il contesto
  function context() {
    const context = useContext(Context);
    if (!context) {
      throw new Error("errore nella creazione del context");
    }
    return context;
  }

  return {provider, context} as const;
}