<!--
  Stage 1: brand colours (US-01). Markup only; all behaviour comes from core/project.ts.
-->
<script lang="ts">
  import { tick } from "svelte";
  import { addColour, focusAfterRemove, loadExample, moveColour, removeColour, renameColour, setColourInput, type ProjectView } from "../../core/project";

  let { view }: { view: ProjectView } = $props();

  /** Removes a colour, then moves focus to a sensible place once the DOM has updated. */
  async function remove(id: string) {
    const target = focusAfterRemove(id);
    removeColour(id);
    await tick();
    document.getElementById(target)?.focus();
  }
</script>

<section class="stage" aria-labelledby="brand-heading">
  <h2 id="brand-heading">1. Your brand colours</h2>
  <p class="muted">Enter each brand colour as a hex value, such as #1B548F.</p>
  <ul class="colour-list">
    {#each view.colours as colour, index (colour.id)}
      <li class="colour-row">
        <div class="swatch" style:background={colour.hex ?? undefined} aria-hidden="true"></div>
        <div class="field">
          <label for="name-{colour.id}">Name</label>
          <input id="name-{colour.id}" type="text" value={colour.name} oninput={(e) => renameColour(colour.id, e.currentTarget.value)} />
        </div>
        <div class="field">
          <label for="hex-{colour.id}">Hex value</label>
          <input
            id="hex-{colour.id}"
            type="text"
            spellcheck="false"
            autocomplete="off"
            value={colour.input}
            aria-invalid={!colour.valid && colour.input !== ""}
            aria-describedby="readout-{colour.id}{!colour.valid && colour.input !== '' ? ` error-${colour.id}` : ''}"
            oninput={(e) => setColourInput(colour.id, e.currentTarget.value)}
          />
          {#if !colour.valid && colour.input !== ""}
            <span class="error" id="error-{colour.id}">Use a hex value like #1B548F</span>
          {/if}
        </div>
        <p class="readout" id="readout-{colour.id}">
          Hue {colour.hsl ? `${colour.hsl.h}°` : "–"} · Saturation {colour.hsl ? `${colour.hsl.s}%` : "–"} · Lightness {colour.hsl ? `${colour.hsl.l}%` : "–"}
        </p>
        <div class="row-actions">
          <button type="button" disabled={index === 0} onclick={() => moveColour(colour.id, -1)} aria-label="Move {colour.name} up">↑</button>
          <button type="button" disabled={index === view.colours.length - 1} onclick={() => moveColour(colour.id, 1)} aria-label="Move {colour.name} down">↓</button>
          <button type="button" id="remove-{colour.id}" onclick={() => remove(colour.id)} aria-label="Remove {colour.name}">Remove</button>
        </div>
      </li>
    {/each}
  </ul>
  <div class="stage-actions">
    <button type="button" id="add-colour" class="primary" onclick={addColour}>Add a colour</button>
    <button type="button" onclick={loadExample}>Try an example</button>
  </div>
</section>
