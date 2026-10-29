/**
 * Entry point and adapter for the Preact view layer.
 *
 * The adapter is the only Preact-specific state code: it mirrors the core store
 * into a signal, and derives the view from it.
 */
import { render } from "preact";
import { computed, signal } from "@preact/signals";
import "../../styles/app.css";
import { deriveView, projectStore } from "../../core/project";
import { App } from "./App";

const project = signal(projectStore.get());
projectStore.subscribe((value) => { project.value = value; });
const view = computed(() => deriveView(project.value));

render(<App view={view} />, document.getElementById("app")!);
