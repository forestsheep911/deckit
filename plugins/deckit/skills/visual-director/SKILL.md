---
name: visual-director
description: Direct the visual treatment for Deckit slide storyboards. Use when Codex needs per-slide visual strategy, layout guidance, or image-generation prompts for presentation slides with readable text and argument-supporting visuals.
---

# Visual Director

Turn a slide storyboard into visual treatments and model-ready image-generation prompts.

## Output

Deckit uses image-first production with actual image generation for ordinary pages. Selected complex workflow pages have the narrow [complex-flow exception](../../references/complex-flows.md). Create:

- `prompts/README.md` with global style direction and source references. Its first line should record the production mode.
- `prompts/<slide-id>.md` with a complete imagegen prompt for each ordinary page, or a page treatment recording `visual_method: complex-flow`, its routing reason, exact wording and matching palette for a selected diagram page.

Ordinary prompts are meant for `$imagegen`; their PNGs must be produced by that capability. Only a selected complex-flow page goes to `../complex-flow/SKILL.md` and its bundled screenshot adapter. Both write `assets/generated-slides/<slide-id>.png`, and both receive actual visual review. Do not substitute programmatic rendering for ordinary slide generation, or pass a diagram page treatment to imagegen as though it were a prompt.

Reuse the slide IDs from `work/storyboard.md` verbatim as filenames (`prompts/<slide-id>.md`). Do not rename, abbreviate, or reformat slide IDs — see the "Slide ID Format" section in `../slide-storyboarder/SKILL.md`.

## Guidance

- Before choosing palette or treatment, read `../../assets/visual-styles/catalog.json` and resolve `visual_style_id` from `run.json` or the deck brief. Follow `../../references/visual-style-library.md`.
- For a library style, read its referenced specification completely and treat it as a global constraint. For `adaptive-default`, make concrete style choices from the content. For `custom`, preserve the user's run-specific visual prompt from the deck brief.
- Record `visual_style_id: <id>` near the top of `prompts/README.md`, immediately after the production-mode line.
- Repeat critical style requirements in every per-slide prompt; a global reference alone is not enough for image-generation consistency.
- If an explicitly requested style ID or code is unknown, show the valid catalog choices instead of silently substituting the default.

- Make visuals serve the slide's argument.
- Avoid decorative-only cinematic backgrounds.
- Prefer slide-oriented visual patterns: timelines, comparison tables, process diagrams, evidence cards, maps, charts, and structured callouts.
- Keep generated text short, large, high-contrast, and readable.
- Maintain consistent language, tone, palette, and information density across slides.
- Treat full-slide images as slide screenshots, not background art, unless the user explicitly asks otherwise.
- Keep image-first prompts model-ready: include the intended use, visual subject, composition, exact text to render, style constraints, and negative constraints. Avoid instructions that imply the assistant should implement the slide by writing rendering code.
- If the user asks for a `.pptx` after image generation, treat it as a packaging step around already generated images; do not write native PowerPoint layout specs or local rendering code.
- Do not call third-party deck/PPTX generation skills such as Codex `Presentations` or Anthropic `pptx` from this skill. Write `$imagegen`-ready prompts for ordinary pages and treatments for selected complex-flow pages; native deck assembly is outside this skill.
- Prefer prompts that explicitly say "Use case: productivity-visual" and "Asset type: <aspect-ratio> presentation slide image" so `$imagegen` receives an image task, not a PowerPoint assembly task. Use the aspect ratio recorded in the run/deck brief/storyboard; default to `16:9` only when no aspect ratio was requested.
- The final delivery target is only `pptx` or `pdf`; do not write special prompts for alternate image-only delivery modes. Keep each generated slide independently readable because Deckit will also produce a standard vertical preview artifact(s) from the generated slide PNGs (`dist/preview.png` up to 32 slides; numbered `dist/preview-XX.png` files above 32 slides).

## Reference Sample

See `../../assets/sample-decks/sanmiao-victory-day/` for an image-first sample that fixes palette and typography globally and bans common generator failures explicitly. Reuse the per-slide structure (Meta / Visual Concept / Composition / Text to Render / Style / Negative) and the practice of repeating the exact characters to render in a "Text to Render" block.

For reusable style selection and the calibrated Chinese handwritten academic-notes treatment, see `../../assets/visual-styles/catalog.json` and `../../assets/visual-styles/notability-handwritten-cn.md`.
