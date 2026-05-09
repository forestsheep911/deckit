# Any2PPT Workflow

## Default Flow

1. `deck-producer` interprets the request, source, target output, and budget.
2. `story-architect` creates `work/deck-brief.md` when the source needs argument shaping.
3. `slide-storyboarder` creates `work/storyboard.md`.
4. `visual-director` creates visual treatments or `prompts/*.md`.
5. `deck-producer` performs a final quality check and summarizes deliverables.

## Skip Rules

- If the user already provides a strong deck brief, skip source analysis.
- If the user only wants an outline, stop after `story-architect`.
- If the user wants slide planning but no visuals, stop after `slide-storyboarder`.
- If the user wants image prompts, run `visual-director`.
- If the user asks for PPTX, treat it as a future module unless a PPTX assembler is available in the current environment.

## Artifact Paths

Use these paths by default inside the active project:

- `work/deck-brief.md`
- `work/storyboard.md`
- `prompts/README.md`
- `prompts/<slide-id>.md`
- `dist/<deck-name>.pptx` when PPTX assembly exists

Do not overwrite user-provided source files. If re-running, create a new run folder or ask before replacing artifacts.
