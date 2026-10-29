<!--
  Stage 2: choose a ladder and see every scale on it (US-02). Markup only.
-->
<script lang="ts">
  import { choosePreset, type ProjectView } from "../../core/project";

  let { view }: { view: ProjectView } = $props();
  const valid = $derived(view.colours.filter((c) => c.scale));
</script>

<section class="stage" aria-labelledby="ladder-heading">
  <h2 id="ladder-heading">2. Choose a ladder</h2>
  <fieldset>
    <legend>How many steps should each scale have?</legend>
    {#each view.presets as preset (preset.id)}
      <div class="preset">
        <input type="radio" id="preset-{preset.id}" name="preset" value={preset.id} checked={preset.id === view.preset.id} onchange={() => choosePreset(preset.id)} aria-describedby="reason-{preset.id}" />
        <label for="preset-{preset.id}">{preset.label}</label>
        {#if preset.recommended}<span class="badge">Recommended</span>{/if}
        <span class="muted" id="reason-{preset.id}">{preset.reason}</span>
      </div>
    {/each}
  </fieldset>

  {#if valid.length === 0}
    <p>Add a valid brand colour to see its scale.</p>
  {:else}
    <!-- A scrollable region must be reachable by keyboard (WCAG 2.1.1), so tabindex="0" is intended here. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="table-frame" role="region" aria-labelledby="ladder-caption" tabindex="0">
      <table>
        <caption id="ladder-caption" class="visually-hidden">Scales on the {view.preset.label} ladder. The step nearest each brand colour is marked.</caption>
        <thead>
          <tr>
            <th scope="col">Colour</th>
            {#each view.preset.stepNames as name, i (name)}
              <th scope="col">{name}<span class="visually-hidden">, L* {view.preset.ladder[i]}</span></th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each valid as colour (colour.id)}
            <tr>
              <th scope="row">{colour.name}</th>
              {#each colour.scale!.steps as step, i (step.name)}
                <td class="step" class:nearest={i === colour.scale!.nearestStep} style:background={step.hex} style:color={step.label}>
                  {#if i === colour.scale!.nearestStep}<span class="step-brand">Brand</span>{/if}
                  {step.hex}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <ul class="muted">
      {#each valid as colour (colour.id)}
        <li>{colour.name} ({colour.hex}) lands nearest step {colour.scale!.steps[colour.scale!.nearestStep].name}, {colour.scale!.nearestDifference} L* away.</li>
      {/each}
    </ul>
  {/if}
</section>
