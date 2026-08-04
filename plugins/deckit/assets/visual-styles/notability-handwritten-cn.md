# Visual Style: notability-handwritten-cn

## Intent

Create Chinese technical presentation slides that resemble carefully prepared handwritten academic talk notes on a clean digital notebook page. The result should feel calm, exact, information-rich, logically clear, and genuinely handwritten—not like a commercial presentation template or a photograph of paper.

## Canvas

- Flat 16:9 slide image unless the run specifies another aspect ratio.
- Warm ivory Notability-style digital note page.
- Generous outer margins and large quiet blank areas wherever the logic needs no content.
- The image itself is the slide: no stage, projector, room, camera perspective, visible paper edge, notebook binding, desk, hand, or photographic texture.

## Handwriting and diagrams

- Real delicate deep navy digital handwriting with subtly uneven baselines and natural pen-pressure variation.
- Small, neat Chinese characters and thin strokes.
- Thin hand-drawn boxes, arrows, axes, tables, probability paths, and technical diagrams.
- Avoid typeset computer fonts, fake marker fonts, pseudo-Chinese, and decorative doodles.

## Color roles

- Deep navy: default text and diagram strokes.
- Vivid cobalt blue: derivations, probability paths, formulas, arrows, and axes only.
- Magenta-red: conclusion or recommendation boxes only.
- Fluorescent yellow: at most one short emphasized phrase per slide.
- Fluorescent green: confirmed structures, winning paths, or recommended options.
- Coral pink: exceptions, loss paths, or eliminated cases.
- Highlights must be narrow and slightly imperfect, like a real marker stroke.

## Content contract

- One slide answers one question.
- Render only the exact Chinese characters, Latin letters, numerals, and mathematical notation supplied in the slide prompt.
- Put every visible string in a labeled `Text to Render` block and require character-for-character rendering.
- Do not add captions, labels, English, pseudo-text, or decorative marks that are not logically needed.
- Keep the amount of visible text compatible with small but legible handwriting; split the slide when exact text would become crowded.

## Negative direction

No rounded cards, gradients, shadows, glossy icons, decorative backgrounds, brand logos, footer, page number, watermark, stock photography, cinematic lighting, paper edge, or photo texture.

## Per-slide prompt reminder

Repeat the relevant color roles, exact text, layout logic, and negative constraints in every per-slide prompt. Do not rely on the global style file alone for text fidelity or generator exclusions.
