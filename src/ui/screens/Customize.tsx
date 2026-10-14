import { useState } from "preact/hooks";
import { AVATARS, THEMES } from "../../config";
import type { Profile } from "../../core/types";
import { texts } from "../../texts";
import { AvatarPicker } from "../components/AvatarPicker";
import { Header } from "../components/Header";
import { ThemePicker } from "../components/ThemePicker";
import { saveProfile, stars } from "../store";

export function Customize({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);

  function changeName(value: string) {
    setName(value);
    const trimmed = value.trim();
    if (trimmed) saveProfile({ name: trimmed });
  }

  return (
    <main class="page stack">
      <Header title={texts.customize.title} back="/" />

      <label class="field">
        <span class="field__label">{texts.customize.nameLabel}</span>
        <input
          class="input"
          type="text"
          autocomplete="given-name"
          maxLength={20}
          value={name}
          onInput={(event) => changeName(event.currentTarget.value)}
        />
      </label>

      <AvatarPicker
        label={texts.customize.avatarLabel}
        avatars={AVATARS}
        value={profile.avatar}
        stars={stars.value}
        onChange={(avatar) => saveProfile({ avatar })}
      />

      <ThemePicker
        label={texts.customize.themeLabel}
        themes={THEMES}
        value={profile.theme}
        stars={stars.value}
        onChange={(theme) => saveProfile({ theme })}
      />

      <fieldset class="picker">
        <legend class="picker__label">{texts.customize.optionsLabel}</legend>
        <label class="switch">
          <input
            type="checkbox"
            checked={profile.sound}
            onChange={(event) => saveProfile({ sound: event.currentTarget.checked })}
          />
          <span>{texts.customize.sound}</span>
        </label>
        <label class="switch">
          <input
            type="checkbox"
            checked={profile.forceKeypad}
            onChange={(event) => saveProfile({ forceKeypad: event.currentTarget.checked })}
          />
          <span>{texts.customize.forceKeypad}</span>
        </label>
      </fieldset>
    </main>
  );
}
