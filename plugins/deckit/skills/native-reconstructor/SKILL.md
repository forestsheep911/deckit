---
name: native-reconstructor
description: Optional post-processing of approved Deckit slide bitmaps into editable PowerPoint objects. Use only when the user chooses element reconstruction, via GordenImage2PPTX from Gorden Super PPT Skills or Copilot inside Microsoft PowerPoint. Check dependencies, preserve the bitmap delivery, and verify structure, visual fidelity, and edit/save/reopen separately.
---

# Native Reconstructor

Use this skill after Deckit's image-first visual production and review. It is an optional downstream stage, never a substitute for `$imagegen` or the image-container delivery. Do not run it just because the user asks for a PPTX, selects premium quality, or says to use defaults.

Read [native reconstruction](../../references/native-reconstruction.md) for the choice flow, dependency checks, route instructions, prompt template, artifact contract, and acceptance checklist.

## Entry conditions

1. The user has explicitly requested editable elements or chosen reconstruction. If the request names the route, keep that choice; otherwise offer `GORDEN`, `COPILOT`, and `NONE` (cancel reconstruction).
2. The selected pages exist as generated PNGs and have passed visual review. Confirm the visual baseline before costly reconstruction if it has not already been approved; existing approval is sufficient. Continue independent bitmap production while a route or visual decision is pending.
3. Record the selected slide IDs and immutable source hashes. Default to all storyboard slides only when the user requested a whole editable deck; preserve narrower requests such as “only the last page.”
4. Verify the chosen route's dependencies. A prior chat's successful Copilot run does not establish availability in this user's current environment.

## Route boundaries

- `none`: finish the bitmap delivery, record the optional stage as skipped, and stop reconstruction.
- `gorden`: discover and read the installed `GordenImage2PPTX` skill and its references. It is the conversion component of Gorden Super PPT Skills; do not rerun `GordenImagePPTGen` or the whole `GordenSuperPPTSkill` to remake approved slides. This route yields native text and movable image layers; its default frame and chart graphics remain pictures.
- `powerpoint-copilot`: control the real PowerPoint application and submit the approved full-resolution slide image to its Copilot panel. Restore ordinary text and simple shapes; retain complex artwork as separate images where appropriate. Use current UI state and the supported computer-control tools; never reuse UI element IDs from another chat.

When the user lacks usable Microsoft 365 Copilot in PowerPoint, explicitly offer exactly the two fallback choices: **cancel reconstruction** or **use Gorden**. Do not switch automatically, assume that GitHub Copilot qualifies, or ask the user to buy a license. If Gorden is missing, explain its installation requirement before promising to run it.

## Execution and completion

- Work in a unique `work/native/<conversion-id>/` and deliver under `dist/native/<conversion-id>/`. Preserve the original PNGs, image PPTX/PDF, notes, and preview.
- Check one representative page first, then process the agreed scope with saved checkpoints. Inspect saved output before retrying a timed-out batch; retry only missing work to avoid duplicate objects.
- Keep `production_mode: image-first`; record reconstruction separately in `run.json.native_conversion` and the brief's Skill Notes. Keep conversion prompts/layouts/scripts inside `work/native/`, outside the image-generation prompt pack and the base `scripts/` directory.
- Audit the baseline PPTX with the existing one-picture-per-slide audit. Review the reconstructed derivative using the separate acceptance checklist; the image-container audit cannot accept a native deck and must not be weakened to do so.
- Compare the saved derivative with the approved PNGs; verify actual slide content, object types, intended edit targets, speaker notes, duplicate text, and crop edges. Object counts alone do not establish editability or fidelity.
- In an acceptance copy, edit an existing text object, move a separate object, save, close, reopen, and confirm both changes persist. Record each action's evidence. If PowerPoint is unavailable, deliver a structurally/visually reviewed candidate with application acceptance marked unverified.
- Call the conversion completed only after all requested pages and required acceptance checks pass. Report partial/blocked/failed checks honestly and preserve usable bitmap delivery and checkpoints. Do not promise all-vector artwork, native chart data, bound connectors, or animation without specific evidence.
