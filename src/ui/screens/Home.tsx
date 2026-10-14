import { findAvatar } from "../../config";
import { href } from "../../core/router";
import type { Profile } from "../../core/types";
import { SUBJECTS } from "../../subjects";
import { texts } from "../../texts";
import { StarCount } from "../components/StarCount";
import { storagePersistent } from "../store";

export function Home({ profile }: { profile: Profile }) {
  const avatar = findAvatar(profile.avatar);

  return (
    <main class="page stack">
      <header class="home-header">
        <span class="avatar avatar--large" aria-hidden="true">
          {avatar.emoji}
        </span>
        <div class="stack stack--tight">
          <h1>{texts.home.hello(profile.name)}</h1>
          <StarCount />
        </div>
      </header>

      {!storagePersistent && <p class="notice">{texts.home.storageWarning}</p>}

      <nav class="tiles">
        {SUBJECTS.map((subject) => (
          <a key={subject.id} class="tile tile--primary" href={href("/" + subject.id)}>
            <span class="tile__icon" aria-hidden="true">
              {subject.icon}
            </span>
            {subject.name}
          </a>
        ))}
        <a class="tile" href={href("/defis")}>
          <span class="tile__icon" aria-hidden="true">
            ⏱️
          </span>
          {texts.home.challenges}
        </a>
        <a class="tile" href={href("/trophees")}>
          <span class="tile__icon" aria-hidden="true">
            🏆
          </span>
          {texts.home.trophies}
        </a>
        <a class="tile" href={href("/personnaliser")}>
          <span class="tile__icon" aria-hidden="true">
            🎨
          </span>
          {texts.home.customize}
        </a>
      </nav>

      <footer class="home-footer">
        <a class="discreet-link" href={href("/parent")}>
          🔒 {texts.home.parent}
        </a>
      </footer>
    </main>
  );
}
