/**
 * @module scenario-report
 * Lists every Gherkin scenario in `docs/user-stories.md` that has no automated test yet
 * (ADR 0004).
 *
 * A test counts for a scenario when its name is the story and scenario title, optionally
 * followed by a detail after a dash: `US-01: Invalid input` or
 * `US-01: Invalid input — hue shows dashes`. Test names are read from the source of every
 * `*.test.ts` (Vitest) and `*.e2e.ts` (Playwright) file under `packages/` and `apps/`, so nothing has to run first.
 *
 * Usage: `node scripts/scenario-report.ts [--strict]`. It always prints the report. With
 * `--strict` it exits with 1 when any scenario is untested; CI turns that on before the closed
 * beta starts on 23 November 2026.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** One scenario from the user stories. */
export interface Scenario {
  /** The story it belongs to, such as `US-01`. */
  story: string;
  /** The scenario title, exactly as written after `Scenario:`. */
  title: string;
}

const root = fileURLToPath(new URL('..', import.meta.url));
const storiesPath = join(root, 'docs', 'user-stories.md');
// Not `scripts`: its own tests quote scenario names as sample data.
const searchRoots = ['packages', 'apps'];
const skipDirectories = new Set(['node_modules', 'dist', 'coverage', 'test-results']);

/**
 * Reads every scenario from the user stories document.
 * @param markdown The text of `docs/user-stories.md`.
 * @returns Each scenario with the story it sits under, in document order.
 */
export function parseScenarios(markdown: string): Scenario[] {
  const scenarios: Scenario[] = [];
  let story: string | undefined;
  for (const line of markdown.split('\n')) {
    const heading = /^### (US-\d{2}) ·/.exec(line);
    if (heading) story = heading[1];
    const scenario = /^\s*Scenario(?: Outline)?:\s*(.+?)\s*$/.exec(line);
    if (scenario?.[1] && story) scenarios.push({ story, title: scenario[1] });
  }
  return scenarios;
}

/**
 * Finds the story-and-scenario test names in some test source.
 * @param source The text of a test file.
 * @returns Each name's story and scenario title, as `US-01: Invalid input`, without any detail
 *   after a dash.
 */
export function findTestNames(source: string): string[] {
  const names: string[] = [];
  const pattern = /(['"`])(US-\d{2}): (.+?)(?: [—–-] [^'"`]*)?\1/g;
  for (const match of source.matchAll(pattern)) names.push(`${match[2]}: ${match[3]}`);
  return names;
}

/**
 * Lists the test files under a directory, skipping dependencies and build output.
 * @param directory Absolute path to search.
 * @returns Absolute paths of every `*.test.ts` and `*.e2e.ts` file found.
 */
async function listTestFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !skipDirectories.has(entry.name)) {
      files.push(...(await listTestFiles(path)));
    } else if (entry.isFile() && /\.(test|e2e)\.ts$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

/**
 * Prints the report and sets the exit code.
 * @returns Nothing. Sets `process.exitCode` to 1 in strict mode when a scenario is untested.
 */
async function main(): Promise<void> {
  const strict = process.argv.includes('--strict');
  const scenarios = parseScenarios(await readFile(storiesPath, 'utf8'));

  const tested = new Set<string>();
  const files = (
    await Promise.all(searchRoots.map((dir) => listTestFiles(join(root, dir))))
  ).flat();
  for (const file of files) {
    for (const name of findTestNames(await readFile(file, 'utf8'))) tested.add(name);
  }

  const untested = scenarios.filter(({ story, title }) => !tested.has(`${story}: ${title}`));
  const known = new Set(scenarios.map(({ story, title }) => `${story}: ${title}`));
  const unknown = [...tested].filter((name) => !known.has(name));

  console.log(
    `Scenarios with a test: ${scenarios.length - untested.length} of ${scenarios.length}` +
      ` (from ${files.length} test files under ${searchRoots.join(', ')})`,
  );
  let story: string | undefined;
  for (const scenario of untested) {
    if (scenario.story !== story) console.log(`\n${(story = scenario.story)}`);
    console.log(`  - ${scenario.title}`);
  }
  if (unknown.length > 0) {
    console.log('\nTest names that match no scenario (check the spelling against the story):');
    for (const name of unknown) console.log(`  - ${name}`);
  }
  console.log(`\nStories: ${relative(root, storiesPath)}`);

  if (strict && (untested.length > 0 || unknown.length > 0)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
