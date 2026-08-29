import { useMemo, useState } from "react";

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

export function useDotNotation<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  // const computed = useMemo(()=> state, [state])

  const result = {
    get: state,
    set: (newValue: T | ((prev: T) => T)) => setState(newValue),
  };

  return result;
}
