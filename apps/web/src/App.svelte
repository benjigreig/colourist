<!--
  The coming-soon placeholder page (CLR-1). Markup only: the text comes from the language file.
-->
<script lang="ts">
  import { placeholder as text } from './lang/en-AU.ts';
</script>

<svelte:head>
  <title>{text.title}</title>
  <meta name="description" content={text.description} />
</svelte:head>

<main>
  <h1>{text.name}</h1>
  <p class="tagline">{text.tagline}</p>
  <p>{text.intro}</p>

  <ul>
    {#each text.points as point (point.lead)}
      <li><strong>{point.lead}</strong> {point.body}</li>
    {/each}
  </ul>

  <p>
    {text.statistic}
    <a href={text.statisticSource.href}>{text.statisticSource.label}</a>
  </p>

  <p class="status">
    {text.status}
    <a href={text.repository.href}>{text.repository.label}</a>
  </p>
</main>
