import { useState } from "preact/hooks";
import { AVATARS, DEFAULT_AVATAR, THEMES } from "../../config";
import { texts } from "../../texts";
import { AvatarPicker } from "../components/AvatarPicker";
import { ThemePicker } from "../components/ThemePicker";
import { saveProfile } from "../store";
import { activeTheme, previewThemeId } from "../theme";

const STARTER_AVATARS = AVATARS.filter((avatar) => avatar.unlockAt === 0);
const STARTER_THEMES = THEMES.filter((theme) => theme.unlockAt === 0);

/** Premier lancement : prénom, avatar, couleurs. */
export function Onboarding() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR.id);
  const trimmedName = name.trim();

  function start(event: Event) {
    event.preventDefault();
    if (!trimmedName) return;
    saveProfile({ name: trimmedName, avatar, theme: activeTheme.value.id });
    previewThemeId.value = null;
  }

  return (
    <main class="page">
      <form class="stack" onSubmit={start}>
        <h1>{texts.onboarding.title}</h1>

        <label class="field">
          <span class="field__label">{texts.onboarding.nameLabel}</span>
          <input
            class="input"
            type="text"
            autocomplete="given-name"
            maxLength={20}
            placeholder={texts.onboarding.namePlaceholder}
            value={name}
            onInput={(event) => setName(event.currentTarget.value)}
          />
        </label>

        <AvatarPicker
          label={texts.onboarding.avatarLabel}
          avatars={STARTER_AVATARS}
          value={avatar}
          stars={0}
          onChange={setAvatar}
        />

        <ThemePicker
          label={texts.onboarding.themeLabel}
          themes={STARTER_THEMES}
          value={activeTheme.value.id}
          stars={0}
          onChange={(themeId) => (previewThemeId.value = themeId)}
        />

        <button class="button button--large" type="submit" disabled={!trimmedName}>
          {texts.onboarding.start}
        </button>
      </form>
    </main>
  );
}
