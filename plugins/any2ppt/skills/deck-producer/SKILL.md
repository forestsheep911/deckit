---
name: deck-producer
description: Main Any2PPT coordinator for budget-aware presentation production. Use when Codex needs to turn source material, transcripts, notes, or outlines into a deck workflow; choose quick, balanced, or premium scope; coordinate story architecture, slide storyboarding, visual direction, and delivery artifacts.
---

# Deck Producer

Act as the production owner for Any2PPT deck work. Optimize for a usable presentation under real constraints: source quality, token budget, time, image generation cost, and requested output.

## Workflow

1. Identify the user's source material and desired output.
2. Choose a budget mode: `quick`, `balanced`, or `premium`.
3. Select the minimum specialist workflow needed.
4. Keep intermediate artifacts in predictable paths.
5. Apply quality gates before calling the work done.

Use `../../references/workflow.md` for the production flow and `../../references/budget-modes.md` for budget decisions.

## Text Input V1

For `.md`, `.markdown`, or `.txt` sources, prefer the standard local run shape:

- `source/input.md` or `source/input.txt`
- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md`
- `prompts/<slide-id>.md`
- `dist/`

When the repository development tool is available, create the run folder with:

```powershell
cd tools
uv run any2ppt-dev new-run --source ..\path\to\source.md --name run-name
```

Use the run folder as the working root for specialist outputs.

## Specialist Routing

- Use `story-architect` when raw source material needs a deck-level thesis and narrative structure.
- Use `slide-storyboarder` when a brief or outline needs page-by-page slide planning.
- Use `visual-director` when a storyboard needs visual treatment or image prompts.

Do not run every specialist by default. Skip steps that the user's input already satisfies.

## Default Artifacts

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md`
- `prompts/<slide-id>.md`

For v1, prefer these text artifacts over heavy automation. Do not require PPTX assembly, YouTube ingestion, document parsing, or a local UI unless the user explicitly asks for that expansion.

## Quality Gates

Before delivery, verify that:

- The deck has one clear central thesis.
- Each slide has one primary job.
- Slide titles are specific and presentable.
- The sequence has a logical arc.
- Visual direction supports the argument.
- The chosen workflow fits the user's budget and timing.
