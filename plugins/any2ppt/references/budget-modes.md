# Budget Modes

## quick

Use for early exploration or when the user values speed.

Default scope:

- Deck brief.
- Slide storyboard.
- No image generation.
- No multi-pass critique.

## balanced

Use as the default mode.

Default scope:

- Deck brief.
- Slide storyboard.
- Visual direction.
- Per-slide image prompts when requested.
- Lightweight quality check.

## premium

Use when the user explicitly asks for high quality and accepts higher time or token cost.

Default scope:

- Deck brief.
- Slide storyboard.
- Visual direction.
- Generated images or PPTX assembly when tools are available.
- Render or screenshot review.
- Iteration on weak slides.

## Downgrade Choices

When the budget is tight, prefer to reduce:

- Number of slides.
- Visual complexity.
- Number of generated image attempts.
- Critique passes.

Do not quietly reduce argument quality. If the source needs more thinking, say so and propose a smaller deck.
