import { href } from "../../core/router";
import { texts } from "../../texts";
import { StarCount } from "./StarCount";

interface HeaderProps {
  title: string;
  /** Chemin de l'écran précédent. */
  back: string;
}

export function Header({ title, back }: HeaderProps) {
  return (
    <header class="topbar">
      <a class="topbar__back" href={href(back)} aria-label={texts.back}>
        ←
      </a>
      <h1 class="topbar__title">{title}</h1>
      <StarCount />
    </header>
  );
}
