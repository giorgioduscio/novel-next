import { useState } from "react";

// usa i metodi get e set per gestire allo stato
export function useDot<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  const result = {
    get: () => state,
    set: (newValue: T | ((prev: T) => T)) => setState(newValue),
    // Sovrascrivi toString per restituire lo stato corrente
    toString: () => JSON.stringify(state),
  };

  return result;
}


// usa parentesi per gestire lo stato
export function useBracket<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  const result = ((newValue?: T | ((prev: T) => T)) => {
    // get
    if (newValue === undefined) {
      return state; 

    // set
    } else {
      setState(newValue);
    }
    
  }) as {
    (): T;
    (newValue: T | ((prev: T) => T)): void;
  };

  return result;
}