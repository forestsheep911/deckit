# Production Mode Insights

## Context

This note records an early Any2PPT plugin test from:

- Test workspace: `C:\Users\fores\Documents\New project 2`
- Native PPTX output: `C:\Users\fores\Documents\New project 2\dist\eutectic-one-slide.pptx`
- Earlier image-first sample: `C:\Users\fores\dev\trytry\any2ppt\local-runs\sanmiao-victory-day\assets\generated-slides`

The test prompt asked Any2PPT to explain the eutectic phenomenon in one slide. The reasoning trace showed a deck/slide workflow and generated a `.pptx` output that PowerPoint can edit directly.

The output file was inspected as a PPTX package:

- Slides: 1
- Embedded media files: 0
- Native slide shapes: 48
- Text runs: 23

This confirms the test followed a PPTX-native production mode rather than an image-first mode.

## Key Finding

Any2PPT should not mean "always create a native PowerPoint file."

The project name is a product shorthand for creating presentation material. The production mode can vary:

- Image-first slides: generate full-slide visual images, then optionally package them into PPTX or PDF.
- PPTX-native slides: create editable PowerPoint elements such as shapes, text boxes, lines, charts, and diagrams.
- Hybrid slides: combine native PPTX structure with generated images, charts, or visual panels.

These are different production logics and should be treated as explicit choices, not accidental implementation details.

## Image-First Mode

Image-first mode uses image generation to produce complete 16:9 slide visuals. The earlier Sanmiao deck is the reference sample.

Strengths:

- Highest current artistic ceiling.
- Stronger atmosphere, composition, texture, documentary feeling, and visual density.
- Better suited for editorial, cinematic, historical, or visually expressive decks.
- Can produce polished slides quickly when the model follows the visual direction well.

Trade-offs:

- Slide content is not directly editable in PowerPoint.
- Fixing text or layout often requires generating the image again.
- Small text, factual labels, and exact typography can be fragile.
- A later PPTX or PDF is mostly a container unless additional editable overlays are added.

Use when:

- Visual impact matters more than downstream manual editing.
- The deck is closer to a polished visual artifact or narrative presentation.
- The user accepts regeneration as the main revision path.

## PPTX-Native Mode

PPTX-native mode creates PowerPoint-recognized elements directly. The eutectic one-slide test is the first observed example.

Strengths:

- Elements remain editable in PowerPoint.
- Users can manually adjust text, shapes, colors, lines, and layout later.
- Good for technical explainers, diagrams, consulting-style drafts, classroom material, and work that expects human revision.
- Can become more useful as layout heuristics, charting, and diagram patterns improve.

Trade-offs:

- Current artistic quality appears lower than image-first generation.
- Native elements tend to look more mechanical unless layout and typography are carefully tuned.
- Achieving polished design may require many handcrafted layout rules or a stronger template system.
- It may be better as a controllable draft mode before it becomes a final-art mode.

Use when:

- Editability is a primary user requirement.
- The user wants to continue work in PowerPoint.
- The slide is diagrammatic, technical, or text-and-structure driven.
- The production budget cannot afford repeated image regeneration.

## Hybrid Mode

Hybrid mode should be considered a future route.

Possible patterns:

- Use generated images as hero panels, backgrounds, or visual evidence cards.
- Keep titles, subtitles, annotations, and diagrams as editable PPTX elements.
- Generate visual assets per slide, but compose them with native PowerPoint layout.
- Use PPTX-native mode for draft and image-first mode for final visual passes.

Hybrid may eventually offer a better balance between visual quality and editability.

## Product Implication

`deck-producer` should eventually ask or infer a production mode:

- `image-first`: prioritize visual quality and generated slide screenshots.
- `pptx-native`: prioritize editability and PowerPoint-native elements.
- `hybrid`: balance generated visuals with editable structure.

This choice belongs near budget selection because it affects cost, revision strategy, and final artifact quality.

Example user-facing decision:

```text
Production mode:
- Visual polish: image-first
- Editable deck: PPTX-native
- Balanced: hybrid
```

## Development Direction

Do not remove PPTX-native mode. It is strategically valuable even if the current aesthetic quality is weaker.

Do not make PPTX-native the only definition of Any2PPT. The stronger current path for artistic expression is image-first generation.

Near-term development should keep both paths visible:

- Treat image-first as the high-visual-quality baseline.
- Treat PPTX-native as the editable-output path.
- Record examples and compare them honestly.
- Let `deck-producer` preserve this trade-off instead of hiding it.

Longer term, PPTX-native output may become more competitive through:

- Better slide archetype templates.
- Stronger typography rules.
- Layout validation and screenshot review.
- Reusable chart and diagram builders.
- A style-director skill or style parameter system.
