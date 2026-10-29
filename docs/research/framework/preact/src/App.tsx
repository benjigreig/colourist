/**
 * App shell and both stages (Preact view layer). Markup only; behaviour comes from core/project.ts.
 * The markup matches the Svelte spike element for element, so the comparison is fair.
 */
import type { ReadonlySignal } from "@preact/signals";
import { useLayoutEffect, useRef } from "preact/hooks";
import {
  addColour, choosePreset, focusAfterRemove, loadExample, moveColour, removeColour, renameColour, setColourInput,
  type ProjectView,
} from "../../core/project";

/** Props shared by every component: the derived view, as a signal. */
interface ViewProps { view: ReadonlySignal<ProjectView> }

/** The page: heading, both stages and the live region. */
export function App({ view }: ViewProps) {
  return (
    <main class="app">
      <header>
        <h1>colouri.st spike</h1>
        <p class="muted">Preact with signals. Stage 1 and stage 2 only.</p>
      </header>
      <BrandStage view={view} />
      <LadderStage view={view} />
      <div class="visually-hidden" aria-live="polite">{view.value.announcement}</div>
    </main>
  );
}

/** Stage 1: brand colours (US-01). */
function BrandStage({ view }: ViewProps) {
  const colours = view.value.colours;
  // Preact has no equivalent of Svelte's tick(), so the focus target is held until the next render commits.
  const pendingFocus = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (pendingFocus.current) { document.getElementById(pendingFocus.current)?.focus(); pendingFocus.current = null; }
  });
  /** Removes a colour, then moves focus to a sensible place after the next render. */
  const remove = (id: string) => { pendingFocus.current = focusAfterRemove(id); removeColour(id); };
  return (
    <section class="stage" aria-labelledby="brand-heading">
      <h2 id="brand-heading">1. Your brand colours</h2>
      <p class="muted">Enter each brand colour as a hex value, such as #1B548F.</p>
      <ul class="colour-list">
        {colours.map((colour, index) => {
          const invalid = !colour.valid && colour.input !== "";
          return (
            <li class="colour-row" key={colour.id}>
              <div class="swatch" style={colour.hex ? { background: colour.hex } : undefined} aria-hidden="true" />
              <div class="field">
                <label for={`name-${colour.id}`}>Name</label>
                <input id={`name-${colour.id}`} type="text" value={colour.name} onInput={(e) => renameColour(colour.id, e.currentTarget.value)} />
              </div>
              <div class="field">
                <label for={`hex-${colour.id}`}>Hex value</label>
                <input
                  id={`hex-${colour.id}`}
                  type="text"
                  spellcheck={false}
                  autocomplete="off"
                  value={colour.input}
                  aria-invalid={invalid}
                  aria-describedby={`readout-${colour.id}${invalid ? ` error-${colour.id}` : ""}`}
                  onInput={(e) => setColourInput(colour.id, e.currentTarget.value)}
                />
                {invalid && <span class="error" id={`error-${colour.id}`}>Use a hex value like #1B548F</span>}
              </div>
              <p class="readout" id={`readout-${colour.id}`}>
                Hue {colour.hsl ? `${colour.hsl.h}°` : "–"} · Saturation {colour.hsl ? `${colour.hsl.s}%` : "–"} · Lightness {colour.hsl ? `${colour.hsl.l}%` : "–"}
              </p>
              <div class="row-actions">
                <button type="button" disabled={index === 0} onClick={() => moveColour(colour.id, -1)} aria-label={`Move ${colour.name} up`}>↑</button>
                <button type="button" disabled={index === colours.length - 1} onClick={() => moveColour(colour.id, 1)} aria-label={`Move ${colour.name} down`}>↓</button>
                <button type="button" id={`remove-${colour.id}`} onClick={() => remove(colour.id)} aria-label={`Remove ${colour.name}`}>Remove</button>
              </div>
            </li>
          );
        })}
      </ul>
      <div class="stage-actions">
        <button type="button" id="add-colour" class="primary" onClick={addColour}>Add a colour</button>
        <button type="button" onClick={loadExample}>Try an example</button>
      </div>
    </section>
  );
}

/** Stage 2: choose a ladder and see every scale on it (US-02). */
function LadderStage({ view }: ViewProps) {
  const { presets, preset } = view.value;
  const valid = view.value.colours.filter((c) => c.scale);
  return (
    <section class="stage" aria-labelledby="ladder-heading">
      <h2 id="ladder-heading">2. Choose a ladder</h2>
      <fieldset>
        <legend>How many steps should each scale have?</legend>
        {presets.map((p) => (
          <div class="preset" key={p.id}>
            <input type="radio" id={`preset-${p.id}`} name="preset" value={p.id} checked={p.id === preset.id} onChange={() => choosePreset(p.id)} aria-describedby={`reason-${p.id}`} />
            <label for={`preset-${p.id}`}>{p.label}</label>
            {p.recommended && <span class="badge">Recommended</span>}
            <span class="muted" id={`reason-${p.id}`}>{p.reason}</span>
          </div>
        ))}
      </fieldset>

      {valid.length === 0 ? (
        <p>Add a valid brand colour to see its scale.</p>
      ) : (
        <>
          <div class="table-frame" role="region" aria-labelledby="ladder-caption" tabIndex={0}>
            <table>
              <caption id="ladder-caption" class="visually-hidden">Scales on the {preset.label} ladder. The step nearest each brand colour is marked.</caption>
              <thead>
                <tr>
                  <th scope="col">Colour</th>
                  {preset.stepNames.map((name, i) => (
                    <th scope="col" key={name}>{name}<span class="visually-hidden">, L* {preset.ladder[i]}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {valid.map((colour) => (
                  <tr key={colour.id}>
                    <th scope="row">{colour.name}</th>
                    {colour.scale!.steps.map((step, i) => {
                      const nearest = i === colour.scale!.nearestStep;
                      return (
                        <td class={`step${nearest ? " nearest" : ""}`} key={step.name} style={{ background: step.hex, color: step.label }}>
                          {nearest && <span class="step-brand">Brand</span>}
                          {step.hex}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul class="muted">
            {valid.map((colour) => (
              <li key={colour.id}>{colour.name} ({colour.hex}) lands nearest step {colour.scale!.steps[colour.scale!.nearestStep].name}, {colour.scale!.nearestDifference} L* away.</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
