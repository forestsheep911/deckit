# Deckit

Deckit is a Codex plugin for producing image-first presentation decks end to end.

Current release: **v0.5.0**.

v0.5.0 adds optional bitmap-to-element reconstruction through Gorden Super PPT Skills or Copilot inside PowerPoint. Reconstruction remains off by default; unavailable PowerPoint Copilot offers cancellation or Gorden.

## What Deckit Does

Deckit turns a topic, note, Markdown document, PDF, or URL into a presentation workflow:

1. Ingest or frame the source material.
2. Build a deck brief and narrative arc.
3. Create a slide-by-slide storyboard.
4. Resolve a reusable visual style or preserve the user's custom style.
5. Write image-generation prompts for each full-slide visual.
6. Generate actual slide images through the official image generation capability when available.
7. Package generated slide PNGs into the requested final delivery target.
8. Produce standard preview artifact(s): `dist/preview.png` for decks up to 32 slides, or numbered `dist/preview-XX.png` files for longer decks.
9. Review and audit the output before delivery.
10. Optionally reconstruct approved bitmaps into editable elements when the user chooses Gorden or PowerPoint Copilot.

## Visual Style Library

Reusable styles live under `plugins/deckit/assets/visual-styles/`. The machine-readable `catalog.json` provides stable IDs and preflight short codes; each style's Markdown file contains the prompt contract used by `visual-director`.

Initial styles:

- `AUTO` / `adaptive-default` — derive a concrete style from the deck's content.
- `HAND` / `notability-handwritten-cn` — warm ivory, deep-navy handwritten Chinese academic notes with constrained highlight colors.

Deckit's recommendation gate displays a recommended style. Expanded preflight lets users switch styles by short code without adding another approval round. Run `uv run deckit-dev list-styles` from `tools/` to validate and inspect the library.

## Current Production Route

Deckit has one primary production route: **image-first**, followed by optional element reconstruction.

That means:

- slide visuals are generated as bitmap images first;
- `.pptx` output is a non-editable image-container deck, with one full-slide image per slide;
- `.pdf` output is image-only delivery built from generated slide images;
- generated slide PNGs are retained as intermediate artifacts;
- Deckit should not substitute native PowerPoint shapes, browser-rendered slides, SVG screenshots, or generic presentation plugins for the image-generation step.

Reconstruction is off by default. After bitmap review, users can choose `NONE`, `GORDEN`, or `COPILOT`, for the whole deck or selected pages:

- **Gorden Super PPT Skills**: use its external `GordenImage2PPTX` conversion skill. Ordinary text becomes editable; background, frame, icons and chart graphics remain movable picture layers by default. Requires the installed skill and image generation, without a Microsoft 365 Copilot requirement.
- **PowerPoint Copilot**: operate Microsoft 365 Copilot inside PowerPoint to restore text and suitable simple shapes; complex artwork can remain separate images. Check actual in-app editing capability.
- If PowerPoint Copilot is unavailable, explicitly offer **cancel reconstruction** or **use Gorden**; never switch automatically. If Gorden is missing, explain the installation requirement.

Preserve the bitmap delivery and store reconstructed derivatives under `dist/native/<conversion-id>/`. Verify structure, visual fidelity, and actual editing/save/close/reopen separately. See [reconstruction workflow](plugins/deckit/references/native-reconstruction.md). Source instructions coordinate external tools; they do not bundle Gorden or Microsoft 365 Copilot.

## Marketplace Installation

Deckit is distributed through the 2water Codex plugin marketplace:

```text
forestsheep911/codex-plugin-marketplace-2water
```

The marketplace entry should point to this repository as a git subdirectory source:

```json
{
  "name": "deckit",
  "source": {
    "source": "git-subdir",
    "url": "forestsheep911/deckit",
    "path": "plugins/deckit",
    "ref": "v0.5.0"
  }
}
```

Useful verification commands:

```powershell
git ls-remote --tags https://github.com/forestsheep911/deckit.git refs/tags/v0.5.0
```

```powershell
Invoke-WebRequest -UseBasicParsing `
  https://raw.githubusercontent.com/forestsheep911/codex-plugin-marketplace-2water/main/.agents/plugins/marketplace.json |
  Select-Object -ExpandProperty Content
```

## Local Development Layout

The installable plugin lives under:

```text
plugins/deckit/
```

Key files:

```text
plugins/deckit/.codex-plugin/plugin.json
plugins/deckit/skills/deck-producer/SKILL.md
plugins/deckit/skills/story-architect/SKILL.md
plugins/deckit/skills/slide-storyboarder/SKILL.md
plugins/deckit/skills/visual-director/SKILL.md
plugins/deckit/skills/document-ingestor/SKILL.md
plugins/deckit/skills/native-reconstructor/SKILL.md
plugins/deckit/references/workflow.md
plugins/deckit/references/native-reconstruction.md
plugins/deckit/references/budget-modes.md
plugins/deckit/references/visual-style-library.md
plugins/deckit/assets/visual-styles/catalog.json
```

Development docs live under:

```text
docs/
```

Generated and smoke-test artifacts are local working outputs and should not be treated as the plugin source of truth.

## Release Checklist

When publishing a new Deckit version:

1. Update `plugins/deckit/.codex-plugin/plugin.json`.
2. Commit and push the Deckit repository changes.
3. Create and push a matching tag, for example `v0.4.1`.
4. Update `forestsheep911/codex-plugin-marketplace-2water` so `.agents/plugins/marketplace.json` points Deckit's `ref` to the new tag.
5. Commit and push the marketplace change.
6. Verify that the remote tag exists and the raw marketplace JSON points at the same tag.

See `AGENTS.md` for the detailed release and Windows marketplace-upgrade troubleshooting notes.

## More Documentation

- `docs/install-and-use.md` — local install and workflow notes.
- `docs/development-layout.md` — repository layout and dev-tool notes.
- `docs/v1-status.md` — current V1 status, updated for v0.5.0.
- `docs/production-mode-insights.md` — archived production-mode research.
- `docs/pptx-native-experiment.md` — archived native-PPTX experiment notes.
