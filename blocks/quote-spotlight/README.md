# quote-spotlight

Custom **quote** block. Purpose: testimonial.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, one row per part. Rows are recognised by their content, so authors can reorder or omit them.

| Row | Cell 1 | Cell 2 |
| --- | --- | --- |
| Background | Desktop photo | Mobile photo (optional, shown in portrait viewports) |
| Heading | Heading (h3) | |
| Quote | Quote paragraph(s); the last paragraph is the attribution | Attribution (optional alternative to the last paragraph) |
| Product | Thumbnail image | Product name, price, **bold** Buy link (italic = secondary pill) |

- A row with images only is the background; a row with a link, or with an image and text, is a product card (several are allowed).
- An authored blockquote is used as-is; everything else in that row becomes the attribution.
- Unformatted product links are still rendered as the primary pill.
- Full bleed: the section loses its padding and width.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
