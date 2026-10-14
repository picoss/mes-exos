// Typographie française appliquée aux contenus (énoncés, indices, corrections) :
// les espaces avant ! ? ; : et à l'intérieur des guillemets deviennent insécables.

export function frenchSpacing(text: string): string {
  return text
    .replace(/ ([!?;])/g, "\u202f$1")
    .replace(/ :/g, "\u00a0:")
    .replace(/« /g, "«\u00a0")
    .replace(/ »/g, "\u00a0»");
}

export type RichSegment =
  { kind: "text"; text: string } | { kind: "fraction"; num: string; den: string };

/** Découpe un texte en morceaux de texte et fractions [[a/b]]. */
export function parseRichText(text: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(/\[\[([^\]/]*)\/([^\]]*)\]\]/g)) {
    if (match.index > last) segments.push({ kind: "text", text: text.slice(last, match.index) });
    segments.push({ kind: "fraction", num: match[1]!, den: match[2]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}
