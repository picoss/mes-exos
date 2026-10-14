import type { Avatar } from "../../config";
import { texts } from "../../texts";

interface AvatarPickerProps {
  label: string;
  avatars: Avatar[];
  value: string;
  stars: number;
  onChange: (avatarId: string) => void;
}

export function AvatarPicker({ label, avatars, value, stars, onChange }: AvatarPickerProps) {
  return (
    <fieldset class="picker">
      <legend class="picker__label">{label}</legend>
      <div class="picker__grid picker__grid--avatars">
        {avatars.map((avatar) => {
          const locked = stars < avatar.unlockAt;
          return (
            <label
              key={avatar.id}
              class={`picker__item${locked ? " is-locked" : ""}`}
              title={locked ? texts.locked(avatar.unlockAt) : avatar.name}
            >
              <input
                class="visually-hidden"
                type="radio"
                name="avatar"
                value={avatar.id}
                checked={value === avatar.id}
                disabled={locked}
                onChange={() => onChange(avatar.id)}
              />
              <span class="avatar" aria-hidden="true">
                {avatar.emoji}
              </span>
              <span class="visually-hidden">
                {avatar.name}
                {locked && ` (${texts.locked(avatar.unlockAt)})`}
              </span>
              {locked && (
                <span class="picker__lock" aria-hidden="true">
                  🔒 {avatar.unlockAt} ⭐
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
