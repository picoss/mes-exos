import "@fontsource/atkinson-hyperlegible-next/latin-400.css";
import "@fontsource/atkinson-hyperlegible-next/latin-700.css";
import "./ui/styles/global.css";
import { render } from "preact";
import { App } from "./ui/App";
import { startThemeSync } from "./ui/theme";

startThemeSync();
render(<App />, document.getElementById("app")!);

// Demande au navigateur de ne pas effacer les données s'il manque de place.
navigator.storage?.persist?.().catch(() => {});
