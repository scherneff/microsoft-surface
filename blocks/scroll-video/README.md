# scroll-video

Full-screen video that plays forward and backward with the page scroll. The video stays pinned
while a track four screens tall scrolls past; the scroll position picks the frame.

## Authoring (Document Authoring)

One row, two cells (order-tolerant: pictures and video links are found anywhere in the block).

| Cell 1 | Cell 2 |
| --- | --- |
| Poster image (landscape/desktop), optional second poster (portrait/mobile crop) | Link to the landscape/desktop video, optional link to the portrait/mobile video |

- Video links can be `.fsv` frame sequences (as used on microsoft.com) or regular `.mp4` / `.webm` files.
- Portrait screens use the second poster and video when present.
- The poster shows until the first frame is ready, and is all that is shown when the browser can't decode the video or the reader prefers reduced motion (then the block is one screen tall).
- In Surface product pages, copy right after the block rises into the space the last frame leaves.

## Supported variations

No variations.
