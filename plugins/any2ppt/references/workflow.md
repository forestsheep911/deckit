# Any2PPT Workflow

## Mode-aware Flow

Production mode (`image-first` / `pptx-native` / `hybrid`) is picked **before** budget mode. Mode decides what kind of artifact the deck becomes; budget decides how thoroughly each step is executed.

Mode determines the `visual-director` output:

- `image-first` → `prompts/README.md` + `prompts/<slide-id>.md`
- `pptx-native` → `work/layouts.md` (per-slide layout, chart, table, image needs)
- `hybrid` → both, with the storyboard tagging per-slide route

In image-first mode, "image" means an actual image-generation step, not local rendering code. A PowerPoint file with full-slide PNGs is only an optional delivery container after the PNGs are generated. Do not interpret image-first as "draw slides with PIL/canvas/HTML/SVG and insert them into PPTX."

If the user does not state a mode, ask once. If asking is impossible, default to `image-first` and record the default in `run.json` and the brief's "Skill Notes" section. Do not silently default.

Skip rules apply on top of mode. For example, `quick` budget under `image-first` mode still stops after the storyboard.

## Default Flow

1. `deck-producer` interprets the request, source, target output, **production mode**, and budget.
2. If the source is a `.pdf` or an `http(s)` URL, `document-ingestor` converts it into `source/input.md`.
3. `story-architect` creates `work/deck-brief.md` when the source needs argument shaping.
4. `slide-storyboarder` creates `work/storyboard.md`.
5. `visual-director` creates visual treatments according to the chosen mode (`prompts/*.md`, `work/layouts.md`, or both).
6. In image-first mode, if the user requested actual generated slides and image generation is available, generate one full-slide PNG per slide from the prompt pack and save it under `assets/generated-slides/`. If image generation is unavailable, stop at the prompt pack and report that generated images are pending.
7. `deck-producer` performs a final quality check (manual checklist or `any2ppt-dev review`) and summarizes deliverables.

## Source Inputs (V1)

V1 accepts three source kinds, all normalized into `source/input.md` inside the run folder:

- Text or Markdown files (`.md`, `.markdown`, `.txt`).
- `.pdf` files (text extraction; no OCR).
- `http(s)` URLs (HTML body → Markdown).

Standard run folder shape:

```text
<runs-dir>/<run-name>/
├── run.json
├── source/
│   └── input.md
├── work/
├── prompts/      (image-first / hybrid)
└── dist/
```

Create the run folder with the development tool when available:

```powershell
cd tools
uv run any2ppt-dev new-run --source <text-or-pdf-or-url> --name <run-name> --mode <mode> --budget <budget>
```

Then produce artifacts inside that run folder:

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md` and `prompts/<slide-id>.md` (image-first / hybrid)
- `work/layouts.md` (pptx-native / hybrid)
- `assets/generated-slides/<slide-id>.png` (image-first / hybrid, only after actual image generation)

## Skip Rules

- If the source is already plain text or Markdown, skip `document-ingestor`.
- If the user already provides a strong deck brief, skip source analysis (`story-architect`).
- If the user only wants an outline, stop after `story-architect`.
- If the user wants slide planning but no visuals, stop after `slide-storyboarder`.
- If the user wants image prompts, run `visual-director` in `image-first` mode.
- If the user wants generated slide images, run `visual-director` first, then use the available image-generation capability for each prompt. Do not substitute local programmatic rendering.
- If the user asks for an editable PPTX, set production mode to `pptx-native`. Treat full PPTX assembly as a V2 module unless `pptx-assembler` is available in the current environment; the V1 `any2ppt-dev pptx draft` subcommand is an experimental two-archetype prototype only.
- If the user asks for generated images packaged as PPTX, keep production mode as `image-first`; generate PNGs first, then optionally place those PNGs into a PPTX as a non-editable container.

## Artifact Paths

Use these paths by default inside the active project. The set of paths used depends on the chosen production mode.

Always:

- `work/deck-brief.md`
- `work/storyboard.md`

Image-first mode adds:

- `prompts/README.md`
- `prompts/<slide-id>.md`
- `assets/generated-slides/<slide-id>.png` when actual image generation is performed
- `dist/<deck-name>.pptx` only when the generated PNGs are optionally packaged for presentation delivery

PPTX-native mode adds:

- `work/layouts.md`
- `dist/<deck-name>.pptx` when `pptx-assembler` is available

Hybrid mode adds both image-first and pptx-native paths.

Do not overwrite user-provided source files. If re-running, create a new run folder or ask before replacing artifacts.
