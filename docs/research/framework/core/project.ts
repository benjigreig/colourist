/**
 * Project state and actions for the spike: stage 1 (brand colours) and stage 2 (ladder).
 *
 * Plain TypeScript. Views read `projectStore` and `view`, and call the actions.
 * Nothing here imports a framework.
 */
import { lstar, parseHex, toHsl, type Hsl } from "./colour";
import { EXAMPLE_BRAND, LADDER_PRESETS, type LadderPreset } from "./config";
import { buildScale, type Scale } from "./ladder";
import { createStore } from "./store";

/** A colour as the person entered it. */
export interface BrandColour {
  id: string;
  name: string;
  /** Exactly what the person typed, valid or not. */
  input: string;
}

/** The parts of a project this spike covers. */
export interface Project {
  colours: readonly BrandColour[];
  presetId: string;
  /** The last change, for the live region that announces it to screen readers. */
  announcement: string;
}

/** A brand colour with everything the views need to show it. */
export interface ColourView extends BrandColour {
  valid: boolean;
  hex: string | null;
  hsl: Hsl | null;
  lstar: number | null;
  scale: Scale | null;
}

/** Everything the views render, derived from the project. */
export interface ProjectView {
  colours: ColourView[];
  preset: LadderPreset;
  presets: readonly LadderPreset[];
  announcement: string;
}

let nextId = 1;
const newId = () => `c${nextId++}`;

export const projectStore = createStore<Project>({
  colours: [{ id: newId(), name: "Primary", input: "#1B548F" }],
  presetId: "13",
  announcement: "",
});

/**
 * Derives what the views show from the project. Pure, so it's tested without a browser.
 * @param project - the current project
 */
export function deriveView(project: Project): ProjectView {
  const preset = LADDER_PRESETS.find((p) => p.id === project.presetId) ?? LADDER_PRESETS[1];
  const colours = project.colours.map((colour) => {
    const rgb = parseHex(colour.input);
    if (!rgb) return { ...colour, valid: false, hex: null, hsl: null, lstar: null, scale: null };
    return {
      ...colour,
      valid: true,
      hex: colour.input.trim().startsWith("#") ? colour.input.trim().toUpperCase() : `#${colour.input.trim().toUpperCase()}`,
      hsl: toHsl(rgb),
      lstar: Math.round(lstar(rgb) * 10) / 10,
      scale: buildScale(rgb, preset.ladder, preset.stepNames),
    };
  });
  return { colours, preset, presets: LADDER_PRESETS, announcement: project.announcement };
}

/** Applies a change to the project. */
function update(change: (project: Project) => Project): void {
  projectStore.set(change(projectStore.get()));
}

/** Adds an empty colour at the end. */
export function addColour(): void {
  update((p) => ({ ...p, colours: [...p.colours, { id: newId(), name: `Colour ${p.colours.length + 1}`, input: "" }], announcement: "Colour added" }));
}

/** Renames a colour. */
export function renameColour(id: string, name: string): void {
  update((p) => ({ ...p, colours: p.colours.map((c) => (c.id === id ? { ...c, name } : c)), announcement: "" }));
}

/** Changes a colour's typed value. Invalid values are kept, so the person can finish typing. */
export function setColourInput(id: string, input: string): void {
  update((p) => ({ ...p, colours: p.colours.map((c) => (c.id === id ? { ...c, input } : c)), announcement: "" }));
}

/**
 * Where keyboard focus should go after a colour is removed, so it isn't lost.
 * The next row's Remove button, or the previous row's if it was last, or "Add a colour" if none are left.
 * Deciding the target is logic, so it lives here; moving focus is the view's job.
 * @returns the id of the element to focus
 */
export function focusAfterRemove(id: string): string {
  const colours = projectStore.get().colours;
  const index = colours.findIndex((c) => c.id === id);
  const next = colours[index + 1] ?? colours[index - 1];
  return next ? `remove-${next.id}` : "add-colour";
}

/** Removes a colour. */
export function removeColour(id: string): void {
  update((p) => {
    const removed = p.colours.find((c) => c.id === id);
    return { ...p, colours: p.colours.filter((c) => c.id !== id), announcement: `${removed?.name ?? "Colour"} removed` };
  });
}

/**
 * Moves a colour up or down the list.
 * @param direction - -1 moves it earlier, 1 later
 */
export function moveColour(id: string, direction: -1 | 1): void {
  update((p) => {
    const index = p.colours.findIndex((c) => c.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= p.colours.length) return p;
    const colours = [...p.colours];
    [colours[index], colours[target]] = [colours[target], colours[index]];
    return { ...p, colours, announcement: `${colours[target].name} moved to position ${target + 1}` };
  });
}

/** Chooses a ladder preset. */
export function choosePreset(presetId: string): void {
  update((p) => ({ ...p, presetId, announcement: `Ladder set to ${presetId} steps` }));
}

/** Replaces the colours with the invented example brand. */
export function loadExample(): void {
  update((p) => ({ ...p, colours: EXAMPLE_BRAND.map((c) => ({ id: newId(), name: c.name, input: c.hex })), announcement: "Example brand loaded" }));
}
