/** Entry point: mounts the Svelte view layer. */
import { mount } from "svelte";
import "../../styles/app.css";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app")! });
