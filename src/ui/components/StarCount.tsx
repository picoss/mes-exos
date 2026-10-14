import { stars } from "../store";
import { texts } from "../../texts";

export function StarCount() {
  return (
    <span class="star-count" aria-label={texts.stars(stars.value)}>
      <span aria-hidden="true">⭐ {stars.value}</span>
    </span>
  );
}
