# Deckit Workflow

## Explicit Invocation Default

When Deckit is explicitly invoked (`@deckit`, "use Deckit", "用 Deckit", or plugin selection), treat the request as an end-to-end deck-production request by default. Do not answer with plain explanatory prose just because the user did not say "slides" or "PPT".

## Preflight Clarification Gate

Before starting an expensive image-first run, Deckit may ask one compact preflight question set when the prompt is high-risk vague. This protects users from spending time, tokens, and image-generation budget on an output that is likely to miss their intent.

Trigger the preflight when the request lacks enough constraints to produce a good deliverable, such as:

- topic-only or generic requests with no audience, goal, depth, page count, or final delivery target;
- broad topics with multiple plausible framings;
- vague quality language such as "高质量", "随便做", or "做好看点" without budget or page count;
- ambiguous final format;
- thin or contradictory source material.

Ask at most four items in one response:

1. Quality/budget: `quick`, `balanced` (default), or `premium`.
2. Approximate page/slide count, offered as concrete choices rather than a yes/no acceptance question.
3. A coarse 3-6 section outline and whether the user accepts it.
4. Final delivery target: `pptx` (default) or `pdf`.

If the user says to use defaults, proceed without more questions. If they answer partially, infer the rest from defaults and record the assumptions. This preflight is allowed only before artifact production. It must not become a continuation gate between brief, storyboard, prompts, image generation, and packaging.

Skip the preflight entirely when the prompt is already sufficiently specified. Do not ask users to restate or "confirm" information that is already present in their request. Treat preflight as a missing-field check:

- if all key fields are present, proceed directly and record them as constraints;
- if only a few fields are missing, ask only those fields or safely fill defaults;
- only use the full four-question template when most key fields are absent.

Key fields include quality/budget, approximate page count, audience or goal, rough structure, and final delivery target. Map explicit user wording into settings instead of asking again: "高质量" → `premium`, "6 页" → `target_slide_count: 6`, "按背景/挑战/方案/案例/结论" → accepted rough outline, and "输出 PDF" → `pdf`.

Generated slide PNGs are always retained under `assets/generated-slides/`, and `dist/preview.png` is a standard automatic preview artifact. Do not present raw PNGs, a single PNG, or a stitched long image as final delivery choices in preflight. If the user asks for a PNG/preview/long image, keep the generated slide PNGs and the standard vertical preview artifact, but still ask for or infer only `pptx` or `pdf` as the final packaged deliverable unless the user explicitly requests a partial image-only run.

For the page-count preflight item, provide 3-4 choices with the recommended option first, plus a custom option. Examples:

- balanced/default: `标准 8 页（推荐） / 精简 5 页 / 完整 12 页 / 自定义`
- quick: `快速 5 页（推荐） / 稍完整 6 页 / 上限 7 页 / 自定义`
- premium: `完整 12 页（推荐） / 紧凑 8 页 / 深入 14 页 / 自定义`

Do not phrase the page-count item as only "建议 7-10 页，是否接受？"; that forces a yes/no answer and gives the user too little control.

Topic-only examples such as `@deckit 介绍一下 F-16 战斗机`, `@deckit 讲讲普卡拉战斗机`, or `@deckit explain quantum computing` should start a Deckit workflow:

1. Treat the topic as the source seed.
2. Run the preflight gate if the topic is high-risk vague; otherwise infer a reasonable audience and goal.
3. Create `work/deck-brief.md` with assumptions and fact-check needs.
4. Create `work/storyboard.md`.
5. Create `prompts/README.md` and `prompts/<slide-id>.md`.
6. Continue to `$imagegen`.
7. Package the generated slide images into the requested final delivery target when packaging is available and produce the standard preview image.

Do not stop at a prose explanation, outline, storyboard, or prompt pack to ask whether to continue. Explicit Deckit invocation plus the preflight answer/defaults already supplies the continuation intent.

Exceptions: answer directly when the user asks about Deckit's capabilities, installation, debugging, inspection, review output, or explicitly requests text-only output/no deck artifacts.

## Image-First Flow

Deckit v0.3 has one active route: `image-first`.

The default output sequence for explicit Deckit invocation is:

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md`
- `prompts/<slide-id>.md`
- `assets/generated-slides/<slide-id>.png` from `$imagegen`
- the requested final delivery target when packaging is available; default is `dist/<deck-name>.pptx` as a non-editable container around generated PNGs
- `dist/preview.png` as the standard medium-size vertical preview image

In this workflow, "image" means an actual image-generation step through the official `$imagegen` skill. A PowerPoint file with full-slide PNGs is only a delivery container after the PNGs are generated; it is not the production route. Do not interpret image-first as "draw slides with PIL/canvas/HTML/SVG and insert them into PPTX."

Do not offer alternate native-PowerPoint or mixed production routes as active choices. If the user asks for editable PowerPoint, explain that this plugin currently produces generated slide images, packaged into PPTX as non-editable full-slide images when packaging is available.

Do not delegate an Deckit run to installed presentation/PPTX skills or plugins, even if they are available locally. This includes Codex `Presentations` and Anthropic `pptx`. Those skills are native-PPTX assemblers and conflict with the active v0.3 route.

## Native PPTX Firewall

PPTX is allowed only as a container, never as a production method.

When the user says "make a PPT", "create a PowerPoint", "make slides", "produce a presentation", "制作 PPT", "做 PPT", "帮我做个演示文稿", or "生成 PowerPoint" without explicitly requiring editable objects, interpret the request as image-first slide generation. Do not ask the user to choose a production mode; native-PPTX is not an active Deckit option.

Allowed outputs:

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md`
- `prompts/<slide-id>.md`
- `assets/generated-slides/<slide-id>.png` from `$imagegen`
- `.pptx` package containing the generated PNG slides as full-slide images

Forbidden outputs and fallbacks:

- native editable PowerPoint decks
- PowerPoint shape-by-shape slide construction
- python-pptx scripts that build slide layouts, text boxes, charts, or shapes
- browser-rendered screenshots, SVG, HTML/CSS, PIL, or matplotlib slides pretending to be image-first generation
- hybrid decks that mix native editable PowerPoint layouts with image-first slides
- delegation to generic presentation/PPTX plugins during a Deckit run

If the user explicitly requires editable native PowerPoint text boxes, shapes, or charts, state that Deckit does not support editable native-PPTX production in the active route. Continue only if they accept image-first slides.

Visual polish does not make a deck image-first. A native PowerPoint deck with attractive backgrounds, text boxes, shapes, timelines, and images is still forbidden native-PPTX. If `$imagegen` is unavailable or fails and therefore cannot produce `assets/generated-slides/<slide-id>.png` for every storyboard slide, stop at the prompt pack; do not create a substitute visual PPTX. Do not choose this branch merely because the user has not written a separate "continue" message.

Do not create native-PPTX first and then backfill Deckit artifacts (`run.json`, `work/`, `prompts/`, or `dist/review.md`). Deckit artifacts must drive production before delivery.

## PPTX Container Packaging

If a `.pptx` deliverable is requested, generate slide PNGs first, then package those PNGs as full-slide images. The stable route is:

```powershell
deckit-dev package-images --run <run-folder>
```

Packaging requirements:

- Source images must come from `assets/generated-slides/<slide-id>.png`.
- There must be one PNG for every storyboard slide.
- The package must have one slide per storyboard slide, in storyboard order.
- Each PPTX slide should contain exactly one full-slide image and no editable native content.
- Do not hand-author minimal OpenXML packages for delivery; use the stable packaging command or an equivalent proven PPTX writer.
- Validate with `deckit-dev audit-pptx --pptx <file.pptx>` and `deckit-dev review --run <run-folder>` after packaging.

The PPTX audit passes only when each slide contains exactly one full-slide picture. Text boxes, PowerPoint shapes, lines, charts, tables, or multiple slide-canvas objects mean the file is native-PPTX and not a valid Deckit deliverable.

## PDF Delivery and Standard Preview

PDF delivery also packages generated PNGs and remains image-first:

- `pdf`: `deckit-dev package-pdf --run <run-folder>` creates an image-only PDF, one generated slide image per page.

Deckit should also produce a standard preview image after generated slide PNGs exist:

```powershell
deckit-dev package-preview --run <run-folder>
```

Preview requirements:

- Output path: `dist/preview.png`.
- Use generated slide PNGs in storyboard order.
- Stack pages vertically in a single top-to-bottom column for mobile-friendly scanning.
- Resize to a medium preview width so the image is not a full-resolution long-image deliverable; it only needs to show the overall deck flow clearly.

Do not use PDF or preview packaging to bypass `$imagegen`. The required source remains `assets/generated-slides/<slide-id>.png`.

## Debug Evidence

When a run fails, looks suspicious, or the user asks why a route was chosen, preserve a debug trail before changing artifacts. Capture the prompt, route, commands, tool outputs, review results, PPTX audit results, and paths to every intermediate artifact. Prefer `dist/debug-evidence.md` for this trace.

## Default Flow

1. `deck-producer` interprets the request, source, target output, and budget; if needed, it runs the preflight gate before artifact production. It records `production_mode: image-first`.
2. If the source is a `.pdf` or an `http(s)` URL, `document-ingestor` converts it into `source/input.md`.
3. `story-architect` creates `work/deck-brief.md` when the source needs argument shaping.
4. `slide-storyboarder` creates `work/storyboard.md`.
5. `visual-director` creates model-ready image prompts in `prompts/*.md`.
6. If Deckit was explicitly invoked and `$imagegen` is available, invoke `$imagegen` once per slide prompt and save the resulting PNGs under `assets/generated-slides/`. If `$imagegen` is unavailable, stop at the prompt pack and report that generated images are pending.
7. Package the generated PNGs according to `requested_output.delivery_target` after all expected PNGs exist when packaging is available. Use `package-images` for PPTX and `package-pdf` for PDF. Ensure `dist/preview.png` is produced as the standard preview artifact. Do not wait for a separate "continue" instruction during an explicit Deckit run.
8. `deck-producer` performs a final quality check (manual checklist or `deckit-dev review`) and summarizes deliverables.

## Source Inputs (V1)

V1 accepts three source kinds, all normalized into `source/input.md` inside the run folder:

- Text or Markdown files (`.md`, `.markdown`, `.txt`).
- `.pdf` files (text extraction; no OCR).
- `http(s)` URLs (HTML body → Markdown).

Standard run folder shape:

```text
<workdir>/outputs/<run-name>/
├── run.json
├── source/
│   └── input.md
├── work/
├── prompts/
├── assets/
│   └── generated-slides/
└── dist/
```

Output-root policy:

- Normal user runs must write artifacts under the user's active working directory, preferably `<workdir>/outputs/<run-name>/`.
- Do not write production outputs into the plugin installation directory, plugin cache, or Deckit development repository.
- Do not keep a second mirror copy of the same run under `local-runs/` when the requested deliverable already exists in the user's workspace.
- `local-runs/` is development-only scratch space for Deckit repo smoke tests.

Create the run folder with the development tool when available:

```powershell
cd <workdir>
uv --project <deckit-dev-repo>\tools run deckit-dev new-run --runs-dir .\outputs --source <text-or-pdf-or-url> --name <run-name> --budget <budget> --delivery-target <target> --target-slides <n>
```

Then produce artifacts inside that run folder:

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md` and `prompts/<slide-id>.md`
- `assets/generated-slides/<slide-id>.png` (only after actual image generation)

## Skip Rules

- If the source is already plain text or Markdown, skip `document-ingestor`.
- If the user already provides a strong deck brief, skip source analysis (`story-architect`).
- If the user only wants an outline, stop after `story-architect`.
- If the user wants slide planning but no visuals, stop after `slide-storyboarder`.
- If the user wants image prompts, run `visual-director`.
- If Deckit was explicitly invoked, or if the user wants generated slide images, run `visual-director` first, then invoke `$imagegen` for each prompt. Do not substitute local programmatic rendering.
- If the user asks for an editable PPTX, state the current limitation and continue only if they accept image-first, non-editable full-slide images.
- If Deckit was explicitly invoked, or if the user asks for generated images packaged as PPTX, generate PNGs first, then place those PNGs into a PPTX as a non-editable container when packaging is available.
- If the user asks for PDF output, still generate PNGs first, then package the PNGs into an image-only PDF.
- If the user asks for a PNG preview or long-image style overview, do not treat it as the final delivery target; produce the standard `dist/preview.png` from the generated slide PNGs and choose/ask for PPTX or PDF as the final package.
- If another installed presentation/PPTX skill offers to help, do not route to it. Keep the run inside Deckit's own skill chain and `$imagegen`.

## Artifact Paths

Use these paths by default inside the active project.

Always:

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md`
- `prompts/<slide-id>.md`
- `assets/generated-slides/<slide-id>.png` when actual image generation is performed
- `dist/<deck-name>.pptx` or `.pdf` when the generated PNGs are packaged for the requested final delivery target
- `dist/preview.png` as the standard medium-size vertical preview

Do not overwrite user-provided source files. If re-running, create a new run folder or ask before replacing artifacts.
