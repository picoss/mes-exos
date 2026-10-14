// Routage par hash (#/maths/decimaux) : fonctions pures, sans dépendance au navigateur.

/** "#/maths/decimaux/" → "/maths/decimaux" ; "" ou "#" → "/". */
export function pathFromHash(hash: string): string {
  const segments = hash.replace(/^#/, "").split("/").filter(Boolean);
  return "/" + segments.map(decodeSegment).join("/");
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Lien vers un chemin, à utiliser dans un `href`. */
export function href(path: string): string {
  return "#" + path;
}

/**
 * Compare un chemin à un motif comme "/:subject/:chapter".
 * Renvoie les paramètres trouvés, ou `null` si le chemin ne correspond pas.
 */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (const [index, part] of patternParts.entries()) {
    const value = pathParts[index]!;
    if (part.startsWith(":")) params[part.slice(1)] = value;
    else if (part !== value) return null;
  }
  return params;
}

/** Écrans où elle est en train de répondre : on ne l'interrompt pas (mise à jour, etc.). */
const EXERCISE_PREFIXES = ["/serie", "/defi"];

export function isExerciseRoute(path: string): boolean {
  return EXERCISE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}
