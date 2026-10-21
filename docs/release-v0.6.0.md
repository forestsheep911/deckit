# Deckit v0.6.0 — selected complex-flow screenshots

Release date: 2026-10-21. Package: `plugins/deckit` (Codex / 2water marketplace).

## Behavior

Ordinary pages still use official imagegen, including simple linear process pictures. During storyboarding, an individual page may select `complex-flow` when exact decision branches, merges, retry loops or cross-role handoffs require a structured graph. A complex middle page does not switch other pages away from generation.

The selected page keeps stable node/edge IDs, exact copy and conditions in workflow JSON. A bundled adapter uses pinned Archify workflow layout, validates geometry, measures real browser text at a 1600×900 CSS viewport, trims outer empty margins, and captures a clean 3200×1800 PNG. Node labels must be at least 18 CSS px and all SVG text at least 12 CSS px at that viewport. Overflow and insufficient readability block publication. These are automated floors, not a substitute for inspecting the actual image at presentation size.

PPTX/PDF remains bitmap-only. Every PPTX slide has exactly one full-slide picture in storyboard order with speaker notes. The optional diagram page's screenshot is recorded honestly as `complex-flow`, not an imagegen result. Source JSON, source/PNG SHA-256, layout and browser receipts are retained. Development packaging checks reject missing/stale receipts, changed sources/PNGs, and screenshots whose storyboard page did not select the route.

Native editable diagram shapes/connectors are not implemented. Future export can use the retained graph. Existing Gorden/Copilot reconstruction remains a separate optional post-processing workflow.

## Dependencies and distribution

Only the optional capture needs Node.js 22+ and an installed Chrome, Edge or Chromium. Common executable locations are detected; `--browser` and `DECKIT_CHROME` are supported. Capture uses a disposable headless browser profile, an exact viewport and local standalone HTML. It does not install a global Archify skill, fetch an updater or require an external design account/model key. The initial adapter supports 16:9 capture.

Archify 3.2.0 is pinned to `25cf37080fc8b1dbe758a4efc3935b55f3327083`. The workflow/shared renderer subset and locale/font resources are bundled with MIT and font notices. Third-party brand-vector data is replaced by an empty catalog, and the adapter rejects brand-capture fields. `UPSTREAM.json` records the adaptation. No unrelated Archify skill, CLI, explainer or updater is packaged.

This release targets the existing Codex package and marketplace tag. The separately managed Deckit Web account plugin is not updated by this release.

## Verification

- Eight new executable tests cover actual browser PNG capture and topology retention; mixed image-container order/notes/preview; source tampering and unselected-route rejection; preservation of existing images; simple-flow rejection; invalid topology/path escape; missing browser; and actual browser title overflow.
- Existing preview, style and reconstruction-boundary tests remain part of the committed regression suite.
- The release regression set passes 21 tests: 8 complex-flow, 6 preview, 3 reconstruction-boundary and 4 style tests. The broader local working copy also passed its existing Web tests; those unrelated Web sources are outside this release.
- Plugin manifest/skill discovery and the new skill's frontmatter/resources are validated separately.
- The 75-file installable ZIP passes archive CRC and manifest checks. Its runtime is extracted to a separate directory and successfully captures a new PNG there, establishing that the adapter does not depend on the research checkout or development tools.
- A neutral Chinese approval/rejection/resubmission PNG is inspected for actual glyphs, branches, arrow direction, clipping and clean export without viewer controls. Its real source, PNG and receipt are retained in ignored `local-runs/complex-flow-v060/`.
- Mixed PPTX verification uses clearly identified image fixtures for ordinary pages; it does not claim new imagegen execution or a newly generated complete presentation. It checks actual package structure, embedded image bytes, page order, speaker notes and preview.
- PowerPoint application opening and presentation on a projector, macOS/Linux capture and fresh end-to-end agent authoring remain unverified. Automated receipt measurements do not prove semantic correctness.

Publish the repository commit and `v0.6.0` tag before changing the marketplace source ref. Verify the remote tag and raw marketplace JSON after both pushes.
