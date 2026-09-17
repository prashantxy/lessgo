# Vendored fonts

These four faces exist so the social cards can be set in the same type as the
book. `next/font/google` only ever hands back CSS, and satori — the renderer
behind `next/og` — needs the raw font bytes, so the files are committed rather
than fetched.

Read by `lib/og.tsx` at build time only: every `opengraph-image` route belongs
to a statically generated page, so the PNGs are baked during `next build` and
nothing here is touched serving a request.

| File | Family | Upstream |
| --- | --- | --- |
| `IMFellEnglish-Regular.ttf` | IM Fell English | <https://fonts.google.com/specimen/IM+Fell+English> |
| `IMFellEnglish-Italic.ttf` | IM Fell English Italic | same |
| `EBGaramond-Regular.ttf` | EB Garamond 400 | <https://fonts.google.com/specimen/EB+Garamond> |
| `EBGaramond-SemiBold.ttf` | EB Garamond 600 | same |

## Licence

Both families are under the SIL Open Font License 1.1, which permits bundling
and redistribution but requires the licence travel with the files — `OFL.txt`
is that copy.

- IM Fell English — © Igino Marini (<https://www.iginomarini.com>), with
  Reserved Font Name "IM FELL".
- EB Garamond — © The EB Garamond Project Authors
  (<https://github.com/octaviopardo/EBGaramond12>).

The copy of the licence text in `OFL.txt` carries EB Garamond's copyright
header; the licence body is the same OFL 1.1 that covers IM Fell English.
