# Images — replace these placeholders

Drop real assets into this folder using the exact filenames below. They are
referenced from `index.html` and will appear automatically (no code changes needed).

| Filename               | Used for                          | Suggested size        |
|------------------------|-----------------------------------|-----------------------|
| `jennifer-chen.jpg`    | Founder portrait (Founder section)| ~1000 × 1300 (4:5)    |
| `og-image.jpg`         | Social share preview              | 1200 × 630            |

## Optional — Selected Opportunities backgrounds
Each row in the "Selected Opportunities" section can take a background image.
In `index.html`, add an inline style to a `.work__row`, e.g.:

```html
<a href="#contact" class="work__row" style="--img:url('/images/branded-residences.jpg')" ...>
```

Recommended: dark, editorial, wide imagery (≈1600px wide). Avoid generic stock photos.

## Logo
Replace the text logo (`JC Capital`) in the header & footer of `index.html`
with an `<img>` of the official logo if you have an SVG/PNG.

## Notes
- Until `jennifer-chen.jpg` is added, the portrait shows a labeled placeholder block.
- All copy, contact details and links are also marked with comments in `index.html`.
