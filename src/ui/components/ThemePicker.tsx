import type { Theme } from "../../config";
import { texts } from "../../texts";

interface ThemePickerProps {
  label: string;
  themes: Theme[];
  value: string;
  stars: number;
  onChange: (themeId: string) => void;
}

export function ThemePicker({ label, themes, value, stars, onChange }: ThemePickerProps) {
  return (
    <fieldset class="picker">
      <legend class="picker__label">{label}</legend>
      <div class="picker__grid picker__grid--themes">
        {themes.map((theme) => {
          const locked = stars < theme.unlockAt;
          return (
            <label
              key={theme.id}
              class={`picker__item picker__item--theme${locked ? " is-locked" : ""}`}
              title={locked ? texts.locked(theme.unlockAt) : undefined}
            >
              <input
                class="visually-hidden"
                type="radio"
                name="theme"
                value={theme.id}
                checked={value === theme.id}
                disabled={locked}
                onChange={() => onChange(theme.id)}
              />
              <span
                class="swatch"
                aria-hidden="true"
                style={{ background: theme.colors.bg, borderColor: theme.colors.border }}
              >
                <span class="swatch__dot" style={{ background: theme.colors.primary }} />
                <span class="swatch__dot" style={{ background: theme.colors.accent }} />
              </span>
              <span class="picker__name">
                {theme.name}
                {locked && <span class="visually-hidden"> ({texts.locked(theme.unlockAt)})</span>}
              </span>
              {locked && (
                <span class="picker__lock" aria-hidden="true">
                  🔒 {theme.unlockAt} ⭐
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
