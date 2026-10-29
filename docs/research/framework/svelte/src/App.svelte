<!--
  App shell (Svelte view layer).
  The core store follows Svelte's store contract, so `$projectStore` works with no adapter.
-->
<script lang="ts">
  import { deriveView, projectStore } from "../../core/project";
  import BrandStage from "./BrandStage.svelte";
  import LadderStage from "./LadderStage.svelte";

  const view = $derived(deriveView($projectStore));
</script>

<main class="app">
  <header>
    <h1>colouri.st spike</h1>
    <p class="muted">Svelte 5. Stage 1 and stage 2 only.</p>
  </header>
  <BrandStage {view} />
  <LadderStage {view} />
  <div class="visually-hidden" aria-live="polite">{view.announcement}</div>
</main>
