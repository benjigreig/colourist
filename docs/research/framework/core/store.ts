/**
 * A minimal observable store, independent of any framework.
 *
 * Each view layer adapts this to its own reactivity (a Svelte store contract,
 * a Preact signal). How small and clean that adapter is, is one of the things
 * the spike measures (D-010: the framework appears only in the view layer).
 */

/** Something that holds a value and tells subscribers when it changes. */
export interface Store<T> {
  get(): T;
  set(next: T): void;
  /**
   * Calls the listener now and on every change.
   * Matches Svelte's store contract, so Svelte can use it directly with `$store`.
   * @returns a function that stops listening
   */
  subscribe(listener: (value: T) => void): () => void;
}

/**
 * Creates a store holding an immutable value.
 * @param initial - the starting value
 */
export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<(value: T) => void>();
  return {
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      listeners.forEach((listener) => listener(value));
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(value);
      return () => listeners.delete(listener);
    },
  };
}
