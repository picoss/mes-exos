import { signal } from "@preact/signals";
import { pathFromHash } from "../core/router";

export const currentPath = signal(pathFromHash(window.location.hash));

window.addEventListener("hashchange", () => {
  currentPath.value = pathFromHash(window.location.hash);
  window.scrollTo(0, 0);
});
