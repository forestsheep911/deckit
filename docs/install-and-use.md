# Install and Use Deckit in a Fresh Working Directory

This document describes the minimal steps to install and use the Deckit plugin from a working directory **outside** this repository, using the local marketplace. It is the result of the Week 2 install-loop validation walk-through.

## Goal

Prove that:

1. A new working directory can install `deckit` via the local marketplace.
2. A new contributor can produce the first `deck-brief.md` in under 30 minutes.
3. Any developer-tool friction surfaces early, not after release.

## Prerequisites

- Cursor (or any client that consumes Codex plugins) installed locally.
- Python `>=3.11` and `uv` installed (only required to use `deckit-dev` from the source tree).
- A local clone of the `deckit` repository (referred to below as `<deckit-repo>`).

## Layout of a Fresh Working Directory

A typical setup looks like this:

```text
<workdir>/
├── .agents/
│   └── plugins/
│       └── marketplace.json     # points at <deckit-repo>/plugins/deckit
├── sources/
│   └── <topic>.md               # the source material you want to turn into slides
└── <run-name>/                  # created later by `deckit-dev new-run`
    ├── run.json
    ├── source/
    ├── work/
    ├── prompts/
    └── dist/
```

`<workdir>` does not need to be a Git repository.

## Step 1 — Configure the Local Marketplace

Create `<workdir>/.agents/plugins/marketplace.json`:

```json
{
  "name": "deckit-local",
  "interface": {
    "displayName": "Deckit Local Marketplace"
  },
  "plugins": [
    {
      "name": "deckit",
      "source": {
        "source": "local",
        "path": "C:/Users/you/path/to/deckit/plugins/deckit"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

The `source.path` field accepts an **absolute path** when the plugin lives in a different repository. Use forward slashes on all platforms.

Verify the marketplace parses cleanly before installing:

```powershell
cd <deckit-repo>\tools
uv run deckit-dev inspect-marketplace --marketplace "<workdir>\.agents\plugins\marketplace.json"
```

Expected output:

```text
marketplace: deckit-local
plugins: 1
- deckit: <absolute path to plugin>
```

If this command fails, fix the marketplace before continuing.

## Step 2 — Install the Plugin in Cursor

Open `<workdir>` in Cursor. The local marketplace is auto-discovered from `.agents/plugins/marketplace.json`. Install the `deckit` plugin from the plugin panel; the policy `installation: AVAILABLE` makes it appear as installable.

> Note: the plugin install flow itself happens inside Cursor and is not scriptable from `deckit-dev` today. The `inspect-marketplace` command above is the strongest CLI-side verification available.

## Step 3 — Drop Source Material

`new-run` accepts three source kinds:

- A text or Markdown file on disk (`.md`, `.markdown`, `.txt`).
- A `.pdf` file on disk.
- An `http://` or `https://` URL.

For text sources, place the file under `<workdir>/sources/<topic>.md`. For PDFs, the file can live anywhere on disk. For URLs, no local file is needed.

## Step 4 — Create the Run Folder

For a text source:

```powershell
cd <deckit-repo>\tools
uv run deckit-dev new-run `
  --source "<workdir>\sources\<topic>.md" `
  --name <topic> `
  --runs-dir "<workdir>" `
  --budget balanced `
  --style HAND
```

For a PDF source (the `document-ingestor` skill is invoked automatically to convert the PDF into `source/input.md`):

```powershell
uv run deckit-dev new-run --source "<workdir>\sources\<topic>.pdf" --name <topic> --runs-dir "<workdir>" --budget balanced
```

For a URL source (the page is fetched, the main content area is extracted, and the result is written to `source/input.md`):

```powershell
uv run deckit-dev new-run --source "https://example.com/<post>" --name <topic> --runs-dir "<workdir>" --budget balanced
```

`--runs-dir` lets the run folder land in `<workdir>` instead of the default `<deckit-repo>\local-runs\`.

`production_mode`, `budget_mode`, and `visual_style_id` are recorded in `run.json`. In v0.4, `production_mode` is always `image-first`; `--mode` is optional and accepts only `image-first`. `--style` accepts either a stable style ID or its short code. Omit it to use `adaptive-default`.

List the available styles:

```powershell
cd <deckit-repo>\tools
uv run deckit-dev list-styles
```

You can also call the ingestor on its own (useful when you want to review the extracted Markdown before creating the run):

```powershell
uv run deckit-dev ingest --pdf "<file.pdf>" --out "<workdir>\sources\<topic>.md"
uv run deckit-dev ingest --url "https://..."   --out "<workdir>\sources\<topic>.md"
```

Inspect the result:

```powershell
type "<workdir>\<topic>\run.json"
```

You should see `production_mode`, `budget_mode`, `visual_style_id`, and a `source.type` of `text`, `pdf`, or `url`.

## Step 5 — Produce the Deck

Inside Cursor, in `<workdir>`, ask the installed `deckit` plugin to produce the deck. The `deck-producer` skill takes over. By default it calls:

1. `story-architect` to produce `<run-name>/work/deck-brief.md`.
2. `slide-storyboarder` to produce `<run-name>/work/storyboard.md`.
3. `visual-director` to produce `<run-name>/prompts/README.md` and `<run-name>/prompts/<slide-id>.md`.

If you explicitly invoke Deckit, topic-only requests are deck requests. For example, `@deckit 介绍一下 F-16 战斗机` should start a Deckit image-first workflow and produce deck artifacts; it should not stop at a plain prose introduction merely because the words "PPT" or "slides" were not present.

For generated slides, use the prompt pack with the official `$imagegen` skill and save PNGs under `<run-name>/assets/generated-slides/`. Package those PNGs as the baseline PPTX/PDF. Optional element reconstruction happens only after visual approval and explicit selection; it never replaces image generation.

If the user says "make a PPT", "create a PowerPoint", "制作 PPT", or another ambiguous presentation request, Deckit treats that as image-first production, with reconstruction off by default. The baseline PPTX contains one generated full-slide image per page. If the user explicitly requires editable elements, offer Gorden or PowerPoint Copilot reconstruction after bitmap review; do not start direct native generation.

Use the stable packaging command for PPTX containers:

```powershell
uv run deckit-dev package-images --run "<workdir>\<run-name>"
```

This command reads `work/storyboard.md`, requires a matching `assets/generated-slides/<slide-id>.png` for every slide, writes `dist/<run-name>.pptx`, adds PowerPoint speaker notes for every slide, and verifies that the file re-opens as a one-image-per-slide PPTX with notes. Do not hand-write minimal OpenXML `.pptx` zip packages for delivery; PowerPoint may reject or repair them.

Audit any PPTX deliverable, especially when debugging a suspicious run:

```powershell
uv run deckit-dev audit-pptx --pptx "<workdir>\<run-name>\dist\<run-name>.pptx"
```

The baseline audit must report exactly one picture per slide. Additional native objects fail this image-container check. Reconstructed derivatives have a separate acceptance checklist and must not use this audit as their acceptance. Do not create a native deck first and backfill Deckit artifacts; if generated PNGs do not exist yet, stop at the prompt pack.

When debugging, preserve `dist/review.md`, `audit-pptx` output, exact commands, and paths to the source, brief, storyboard, prompts, generated PNGs, and PPTX. Prefer writing this trace to `<run-name>/dist/debug-evidence.md`.

## Step 6 — Quality Gate

Run the executable quality gate:

```powershell
uv run deckit-dev review --run "<workdir>\<run-name>"
```

The report is written to `<run-name>/dist/review.md`. It checks the brief, storyboard, prompt mapping, image-first artifact discipline, and native-PPTX firewall rules. If the development tool is not available, run the [critique checklist](../plugins/deckit/references/critique-checklist.md) by hand and write findings to `<run-name>/dist/review.md`.

## Findings From the Validation Walk-through

The walk-through used the topic *"Why a project should pin its Python version"* in `C:\Users\fores\dev\trytry\deckit-install-test\` and produced a five-slide deck end-to-end. Time to first brief was under 15 minutes (well within the 30-minute target). Four real frictions surfaced:

1. **Cross-repo `inspect-marketplace` crashed with `relative_to` error.** When the plugin in `<workdir>/.agents/plugins/marketplace.json` lives in a different repository (absolute path), the dev tool tried to make the path relative to `<workdir>` and raised `ValueError`. **Fixed** in this iteration: `inspect-marketplace` now falls back to an absolute display path on `ValueError`.

2. **`new-run` did not record production mode or budget.** The new W1 skill text requires `production_mode` to be tracked in `run.json`, but `new-run` had no way to write it. **Fixed**: `production_mode` and `budget_mode` are now in `run.json`. In v0.4, the only active production mode is `image-first`.

3. **`deckit-dev` requires `cd <deckit-repo>\tools` before every call.** The dev tool is not on `PATH`. For now the wrapper invocation in this document works, but a future improvement is to publish `deckit-dev` as a globally installable script (likely a `pipx install <deckit-repo>/tools` recipe) so a fresh contributor does not need to navigate into the repo.

4. **There is no CLI step that exercises the actual plugin install flow.** Steps 1 and 4 are CLI-verifiable. Step 2 (the click-to-install in Cursor) is not. The strongest evidence today that install will work is `inspect-marketplace` succeeding plus the manifest passing `inspect`. If the plugin install protocol changes, this gap will become visible to new users before it is visible to maintainers.

## Walk-through Artifacts (gitignored)

The artifacts produced during the walk-through stay outside the repo (`local-runs/` and `<workdir>/` are both ignored). Recreate them locally with the steps above. Reference paths used during validation:

- Workdir: `C:\Users\fores\dev\trytry\deckit-install-test\`
- Source: `<workdir>\sources\pin-python-version.md`
- Run: `<workdir>\pin-python-version\`
- Files produced: `work/deck-brief.md`, `work/storyboard.md`, `prompts/README.md`, `prompts/00_cover.md` ... `prompts/04_closing.md`

## Optional Element Reconstruction (v0.5.0)

After bitmap review, choose `NONE` (default), `GORDEN`, or `COPILOT`, with the whole deck or specific pages as scope. The coordinator uses [native-reconstructor](../plugins/deckit/skills/native-reconstructor/SKILL.md) and the [reconstruction reference](../plugins/deckit/references/native-reconstruction.md).

- Gorden uses the externally installed `GordenImage2PPTX` skill from Gorden Super PPT Skills plus image generation. It restores native text and movable image layers, with a picture frame by default. Check the actual installed version and dependencies; do not assume it is bundled.
- Copilot uses Microsoft 365 Copilot inside PowerPoint. Verify usable editing and image attachment in the current app, not just a license label or GitHub Copilot installation.
- If PowerPoint Copilot is unavailable, offer cancellation or Gorden and wait for the user's choice. If Gorden is absent, offer installation or cancellation; no automatic route change.
- Keep conversion work under `work/native/<conversion-id>/` and derivatives under `dist/native/<conversion-id>/`. Preserve the baseline delivery and `production_mode: image-first`; record `native_conversion` separately in `run.json`.
- The dev helper's baseline review does not validate a native derivative. Complete the separate structure/visual/application checklist, including editing an existing text object, independently moving an object, saving, closing and reopening an acceptance copy. Unavailable application checks remain unverified.

## Known Limitations

- Direct native-PPTX generation is not a production route; optional reconstruction starts only after approved generated bitmaps exist.
- Reconstruction relies on external Gorden or PowerPoint Copilot capabilities and does not promise all-vector artwork, native chart data, connectors, or animation.
- `document-ingestor` (PDF + URL) handles plain documents only — no OCR, no JavaScript-rendered pages, no authenticated URLs. See `plugins/deckit/skills/document-ingestor/SKILL.md` for the full limitations list.
- `youtube-ingestor`, `audio-transcriber`, and DOCX/PPTX/XLSX ingestion are V2 work, not V1.
