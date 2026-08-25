"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Oggetto globale per registrare i context
const contextRegistry: Record<string, { Context: React.Context<any>; Provider: React.FC<{ children: ReactNode }> }> = {};

export interface RegisteredContext<T> {
  Context: React.Context<{ state: T; setState: React.Dispatch<React.SetStateAction<T>> } | null>;
  Provider: React.FC<{ children: ReactNode }>;
  useContext: () => [T, React.Dispatch<React.SetStateAction<T>>];
}

// Funzione per registrare un context
export function registerContext<T>(initialStateOrFn: T | (() => T)): RegisteredContext<T> {
  // Genera una chiave univoca per il context
  const contextKey = `Context_${Object.keys(contextRegistry).length}`;

  // Crea il context
  const Context = createContext<{ state: T; setState: React.Dispatch<React.SetStateAction<T>> } | null>(null);

  // Provider per il context
  const Provider: React.FC<{ children: ReactNode }> = function ({ children }) {
    const [state, setState] = useState<T>(
      typeof initialStateOrFn === "function"
        ? (initialStateOrFn as () => T)()
        : initialStateOrFn
    );
    return <Context.Provider value={{ state, setState }}>{children}</Context.Provider>;
  };

  // Registra il context e il suo provider
  contextRegistry[contextKey] = { Context, Provider };

  // Ritorna un oggetto con:
  // - Context: il contesto creato
  // - Provider: il provider associato
  // - useContext: hook per accedere al valore
  return {
    Context,
    Provider,
    useContext: function (): [T, React.Dispatch<React.SetStateAction<T>>] {
      const contextValue = useContext(Context);
      if (!contextValue) {
        throw new Error("useContext must be used within its Provider");
      }
      return [contextValue.state, contextValue.setState];
    },
  };
}

// Componente che raggruppa tutti i provider registrati
export function ContextProvider({ children }: { children: ReactNode }) {
  const providers = Object.values(contextRegistry).map(function ({ Provider }) {
    return Provider;
  });

  // Inverti l'ordine per evitare nested provider hell
  return providers.reverse().reduce(function (acc, ProviderComponent) {
    return <ProviderComponent>{acc}</ProviderComponent>;
  }, children);
}

