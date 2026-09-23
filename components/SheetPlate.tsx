/**
 * The engraved headpiece over every loose sheet — /writing, each post, the
 * 404. The same Merian panorama the notebook closes on and the study window
 * looks out at, so leaving the book for a page does not leave the town.
 * Ink-only with the paper keyed out (scripts/make-plates.mjs); fades out at
 * its ends so it reads as a printed vignette rather than a cropped photo.
 */
export default function SheetPlate() {
  return (
    <figure className="sheet-plate">
      <img
        src="/plates/panorama.webp"
        width={1000}
        height={342}
        alt="Matthäus Merian's 1620 engraving of Heidelberg: the castle, the old town and the river Neckar"
        fetchPriority="low"
        decoding="async"
      />
      <figcaption>Heidelberga · after M. Merian, 1620</figcaption>
    </figure>
  );
}
