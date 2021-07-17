export function createStateEmitter<T extends Record<string, any>>(
  initialState: T
) {
  const state = Object.assign({}, initialState);
  const getState = () => ({ ...state });
  const propertySubscribers: Partial<
    Record<keyof T, Set<(v: T[keyof T]) => void>>
  > = {};
  const stateSubscribers: Set<(v: T) => void> = new Set();
  const on = <P extends keyof T>(p: P, a: (v: T[P]) => void) => {
    if (!Array.isArray(propertySubscribers[p]))
      propertySubscribers[p] = new Set();
    propertySubscribers[p].add(a);
  };
  const off = <P extends keyof T>(p: P, a: (v: T[P]) => void) => {
    propertySubscribers[p]?.delete(a);
  };
  const onUpdate = (a: (v: T) => void) => {
    stateSubscribers.add(a);
  };
  const offUpdate = (a: (v: T) => void) => {
    stateSubscribers.delete(a);
  };
  const setState = (newState: Partial<T> | ((oldState: T) => T)) => {
    const stateAfter =
      typeof newState === "function"
        ? newState(state)
        : Object.assign({}, state, newState);

    const keys = new Set([...Object.keys(state), ...Object.keys(stateAfter)]);
    for (const key of keys) {
      if (state[key] !== stateAfter[key]) {
        state[key as keyof T] = stateAfter[key];
        propertySubscribers[key]?.forEach((handler) => handler(state[key]));
      }
    }
    stateSubscribers.forEach((handler) => handler(state));
  };
  const stop = () => {
    stateSubscribers.forEach((handler) => stateSubscribers.delete(handler));
  };
  return { getState, setState, on, off, onUpdate, offUpdate, stop };
}
