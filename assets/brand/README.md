# ecodemia logo files

The wordmark is "eco" + "demia" in Schibsted Grotesk ExtraBold (800) with -0.04em tracking, the same as the site masthead.

| Colour | Hex |
|---|---|
| Forest ("eco" on light) | `#0f5a3f` |
| Ink ("demia" on light) | `#14201a` |
| Forest deep (dark background) | `#0b3d2b` |
| Mint ("eco" on dark) | `#9fe0bf` |
| Paper | `#fbfcfb` |

## Which file to use

**wordmark/** in widths of 400, 800, 1600 and 2400 px
- `color`: the main logo, for white or light backgrounds (transparent)
- `reversed`: mint and white, for dark or photo backgrounds (transparent)
- `black` / `white`: one-colour versions for print, stamps, embossing and partner logo walls
- `forest`: one-colour green
- `color-on-paper` / `reversed-on-forest`: with a solid background, for places that don't support transparency

**mark/** for a square "e" where the full name won't fit, in sizes from 64 to 1024 px
- `mark-forest` / `mark-dark`: rounded tile; `-square` versions are for platforms that crop or round the image themselves
- `glyph-*`: the bare "e" on a transparent background

**favicon/**: `favicon.ico` (16, 32 and 48 px), PNG favicons, `apple-touch-icon.png`, Android icons, maskable PWA icons and a Windows tile

**social/**: Open Graph images (1200×630), X header, LinkedIn banner, YouTube banner, and profile pictures that survive a circle crop

**email/**: a 320 px signature logo; display it at 160 px wide so it stays sharp on retina screens

## Rules
- Keep clear space around the wordmark of at least the height of the "e".
- Don't recolour, stretch, outline or add effects. If a colour isn't listed above, use the black or white version.
- Below about 100 px wide, use the mark instead of the wordmark.
