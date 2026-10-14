import { href } from "../../core/router";
import { texts } from "../../texts";
import { Header } from "../components/Header";

/** Écran d'une partie pas encore développée, ou d'une adresse inconnue. */
export function Placeholder({ title, message }: { title: string; message: string }) {
  return (
    <main class="page stack">
      <Header title={title} back="/" />
      <div class="stack center placeholder">
        <p class="placeholder__icon" aria-hidden="true">
          🚧
        </p>
        <p>{message}</p>
        <a class="button" href={href("/")}>
          {texts.comingSoon.home}
        </a>
      </div>
    </main>
  );
}
