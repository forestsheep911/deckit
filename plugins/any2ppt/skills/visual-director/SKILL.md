---
name: visual-director
description: Direct the visual treatment for Any2PPT slide storyboards. Use when Codex needs per-slide visual strategy, layout guidance, or image-generation prompts for presentation slides with readable text and argument-supporting visuals.
---

# Visual Director

Turn a slide storyboard into visual treatments and image prompts.

## Output

For image-first decks, create:

- `prompts/README.md` with global style direction and source references.
- `prompts/<slide-id>.md` with one complete prompt per slide.

For PPTX-native decks, describe layout, visual hierarchy, chart/table needs, and image requirements instead of writing only image prompts.

## Guidance

- Make visuals serve the slide's argument.
- Avoid decorative-only cinematic backgrounds.
- Prefer presentation-native forms: timelines, comparison tables, process diagrams, evidence cards, maps, charts, and structured callouts.
- Keep generated text short, large, high-contrast, and readable.
- Maintain consistent language, tone, palette, and information density across slides.
- Treat full-slide images as slide screenshots, not background art, unless the user explicitly asks otherwise.
