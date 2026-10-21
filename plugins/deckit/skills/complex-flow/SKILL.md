---
name: complex-flow
description: Render selected complex Deckit workflow pages as non-editable slide PNGs with retained graph data. Use for exact branches, merges, retries or cross-role swimlanes that image generation cannot express reliably. Simple processes and ordinary slides stay on imagegen.
---

# Complex Flow

Use this only for the individual pages selected under [complex-flow routing](../../references/complex-flows.md). A process archetype, many words, or a PPTX request alone does not select this skill. Do not turn the rest of the deck into rendered diagrams. This is a bitmap delivery route, not PowerPoint shape export or reconstruction.

1. Keep the existing slide ID, exact steps, conditions, branch labels, main path and speaker notes. Record `visual_method: complex-flow` and a concrete reason on that storyboard page; ordinary pages use `imagegen` (the default). Keep a page treatment at `prompts/<slide-id>.md` with method, reason and style, rather than an imagegen prompt for that page.
2. Read the bundled [workflow schema](vendor/archify/schemas/workflow.schema.json), [common definitions](vendor/archify/schemas/common.schema.json), and [neutral example](assets/approval.workflow.json). Write `work/diagrams/<slide-id>/workflow.json` inside the active run. Use schema v2, a concise slide title, the deck's language and restrained palette. For business processes, give the legend reader-facing labels such as application, review and execution rather than technical node-type names. Give nodes and edges stable IDs. Derive `meta.output` from the actual run's relative path, not the sample. Omit fixed widths and viewBox initially. The renderer sizes nodes and columns; choose logical lane/column placement from the real flow. Preserve branch and return meaning when repairing layout.
3. Run the bundled adapter using absolute paths to the installed skill and the active run:

   ```text
   node <skill-root>/scripts/render-flow.mjs --run-dir <run-folder> --slide-id <slide-id> --input <run-folder>/work/diagrams/<slide-id>/workflow.json --reason "<why precise relationships need this route>" --theme light
   ```

   Node.js 22+ and an existing Chrome, Edge or Chromium executable are required. The script detects common locations; use `--browser <absolute executable>` or `DECKIT_CHROME` otherwise. No Archify installation, npm dependencies, account, online service or model API key is needed. If the runtime is unavailable, keep this page pending and report the missing dependency; do not silently change the rest of the deck or claim a screenshot exists.
4. A successful command writes a 3200×1800 PNG at `assets/generated-slides/<slide-id>.png`, static `slide.html`, and `render.json` beside the source. It enforces source topology/layout and actual browser font/layout measurements. For unreadable diagrams, shorten secondary copy while preserving facts, reorganize lanes, or split an overview and detail within the user's page constraints. Do not bypass a failing check or shrink text further. For portrait or other page ratios, this first version needs a separately verified adaptation; do not stretch the 16:9 PNG.
5. Open the actual PNG and review wording, direction, branches, readable size, glyphs and visual consistency with adjacent generated slides. Record that review separately in `dist/review.md`; the adapter's receipt honestly leaves `visual_review: pending`. It does not prove semantic correctness or PowerPoint behavior.
6. Continue normal one-picture-per-slide PPTX/PDF packaging, storyboard order, notes and preview. Keep source JSON and receipt for later edits. Use a fresh revision directory/run for changes because the adapter refuses existing outputs. Do not claim native editable nodes or connectors; future native export should reuse graph data rather than infer it from this PNG.

The pinned Archify 3.2.0 subset, commit and licenses are in [UPSTREAM.json](vendor/archify/UPSTREAM.json), [LICENSE](vendor/archify/LICENSE) and [third-party notices](vendor/archify/THIRD_PARTY_NOTICES.md). Only semantic icons are used; this adapter does not capture brand marks.
