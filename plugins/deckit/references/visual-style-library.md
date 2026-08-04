# Visual Style Library

Deckit keeps reusable visual styles under `assets/visual-styles/`.

## Files

- `catalog.json` is the machine-readable index.
- Each style has one Markdown specification referenced by its catalog entry.
- Style specifications define visual behavior only; they must not invent deck claims, slide text, evidence, or narrative structure.

## Catalog schema

```json
{
  "schema_version": 1,
  "default_style_id": "adaptive-default",
  "styles": [
    {
      "id": "lowercase-kebab-case",
      "code": "SHORTCODE",
      "name": "User-facing name",
      "description": "One-sentence summary",
      "spec": "lowercase-kebab-case.md",
      "recommended_for": ["use case", "use case"]
    }
  ]
}
```

Rules:

- `id` values are stable, unique, lowercase kebab-case identifiers.
- `code` values are stable, unique, uppercase alphanumeric short codes used in preflight choices.
- `spec` is a filename inside the same `assets/visual-styles/` directory; paths may not escape that directory.
- `default_style_id` must refer to an existing style.
- A style spec must define intent, global prompt behavior, content constraints where relevant, and negative direction.

## Selection behavior

1. If the user names a library style or replies with its short code, use that style.
2. If the user supplies a custom visual prompt, treat it as a run-specific custom style and record `visual_style_id: custom` plus the prompt in the deck brief; do not silently rewrite it into a built-in preset.
3. If no style is specified, recommend the best matching library style when there is a clear fit; otherwise use `adaptive-default`.
4. Include the recommended style in Deckit's recommendation gate. In expanded preflight, show style short codes in the same compact block rather than adding another question or approval round.
5. Record the resolved ID in `run.json` as `visual_style_id` and in `work/deck-brief.md` Skill Notes.
6. `visual-director` loads the selected specification before writing `prompts/README.md` and repeats critical constraints in every per-slide prompt.

## Adding a style

1. Add a Markdown specification under `assets/visual-styles/`.
2. Add one catalog entry with a new stable ID and short code.
3. Run `deckit-dev list-styles` and the test suite.
4. Update examples or documentation only when the new style introduces a genuinely new teaching pattern.

Do not store generated slide images in the style library. Validation examples and full production runs belong outside plugin source; only durable, reusable prompt guidance belongs here.
