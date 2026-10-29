/**
 * @module svelte.config
 * Svelte compiler options: runes mode throughout (ADR 0003). Accessibility warnings fail the
 * build through `svelte-check --fail-on-warnings` and lint; a deliberate exception needs a
 * `svelte-ignore` comment saying why.
 */
export default { compilerOptions: { runes: true } };
