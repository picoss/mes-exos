import { frenchSpacing, parseRichText } from "../../core/typography";

/** Texte d'un exercice : typographie française et fractions [[a/b]] écrites en étage. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((segment, index) =>
        segment.kind === "text" ? (
          frenchSpacing(segment.text)
        ) : (
          <span key={index} class="frac">
            <span class="visually-hidden">
              {segment.num} sur {segment.den}
            </span>
            <span class="frac__body" aria-hidden="true">
              <span class="frac__num">{segment.num}</span>
              <span class="frac__den">{segment.den}</span>
            </span>
          </span>
        ),
      )}
    </>
  );
}
