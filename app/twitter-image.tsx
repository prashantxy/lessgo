/* X reads twitter-image in preference to opengraph-image; the card is the
   same one, so this is only here to stop the summary_large_image declaration
   in layout.tsx from resolving to nothing. */
export { default, alt, size, contentType } from "./opengraph-image";
