# hero-product

Custom **hero** block. Purpose: product-launch-hero. A full-bleed background video (or image)
with the product heading, copy, price and call to action over it. A page that starts with this
block gets the Surface product design.

## Authoring (Document Authoring)

Model: `standalone`

| Row | Content |
| --- | --- |
| Media | Poster image (optional), then a link to the desktop video, optionally a second link to the mobile video |
| Content | Optional promo link, heading(s), copy, product name, price and a **bold** call-to-action link |

Video links can be:

- an `.mp4` / `.webm` / `.mov` file, or
- a **Dynamic Media** delivery URL, with or without `/play`, e.g.
  `https://delivery-p112310-e1104563.adobeaemcloud.com/adobe/assets/urn:aaid:aem:<id>/play`.
  It plays as a muted, looping background video: the adaptive HLS stream where the browser
  supports it, otherwise the asset's original MP4. Without an authored poster, the asset's
  thumbnail is used. A `?token=` on the URL (protected assets) is passed on.

## Supported variations

- `sans`: the display headline is set in Segoe Sans instead of the mono display face; the promo
  pill only wraps when the screen is too narrow.

## Universal Editor fields

N/A (Document Authoring project)
