import { useRegisterSW } from "virtual:pwa-register/preact";
import { isExerciseRoute } from "../../core/router";
import { texts } from "../../texts";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/** Propose la nouvelle version du site, sans jamais interrompre un exercice. */
export function UpdateBanner({ path }: { path: string }) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // L'appli installée peut rester ouverte longtemps : on vérifie régulièrement.
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS);
    },
  });

  if (!needRefresh || isExerciseRoute(path)) return null;

  return (
    <div class="update-banner" role="status">
      <span>{texts.update.message}</span>
      <button class="button" type="button" onClick={() => void updateServiceWorker(true)}>
        {texts.update.action}
      </button>
    </div>
  );
}
