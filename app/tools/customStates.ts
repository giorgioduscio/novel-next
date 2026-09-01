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
