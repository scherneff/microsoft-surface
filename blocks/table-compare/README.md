# table-compare

Custom **table** block. Purpose: product-compare.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, laid out exactly like the comparison it renders.

| | Product 1 | Product 2 | Product 3 |
| --- | --- | --- | --- |
| (empty) | Image, product name, price, **bold** Buy link | ... | ... |
| Colors | Violet, Platinum, Black | ... | ... |
| Processor | ... | ... | ... |
| ... one row per spec | | | |

- The first row is the product header when it has images or links (footnote links ignored); otherwise every row is a spec row.
- In a product cell: images go in a square box, the first text line is the name, other text lines are the price, link-only lines are pill buttons.
- The product header renders as three aligned rows (image, name, price + Buy), so names and prices line up across products.
- A spec row labelled `Colors`/`Colours` whose cells list known Surface finishes (Black, Dune, Jade, Platinum, Violet; comma or "and" separated) renders as colour dots, the first one ringed; the names stay as screen-reader text. Any unknown finish keeps that cell as plain text.
- First cell of each spec row is the label (row header). Rows with missing cells are padded and extra cells add a column, so columns always line up.
- Below 768px the table scrolls sideways and the label column stays pinned.
- Use in a section with section metadata `style: light`.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
