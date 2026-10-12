# Optional Bitmap-to-Element Reconstruction

Deckit produces and reviews full-slide bitmaps first. The user may then keep the image delivery or request a separate PowerPoint derivative with editable elements. Reconstruction is off by default and can apply to selected slides or the whole deck. It costs additional time; Gorden also makes additional image-generation calls.

## User choice

Mention the default in the initial recommendation: `拆元素：默认不拆；位图定稿后可选 Gorden 或 PowerPoint Copilot。` Keep it in the existing plan/options block, without adding a mandatory questionnaire.

If the user has not requested reconstruction, complete and deliver the bitmap deck. Offer the optional follow-up alongside that concrete result:

```text
位图版已完成。若需要后续改字、改数字或移动对象，可以选择：
NONE 不拆，保留位图版（默认）
GORDEN 用 Gorden Super PPT Skills 分层还原
COPILOT 在 PowerPoint 内用 Microsoft 365 Copilot 拆元素
也可以只指定需要加工的页。
```

This optional follow-up is not a continuation gate for bitmap generation or packaging. No reply means no conversion is started. “Use defaults” keeps reconstruction off unless the user also explicitly requested it. If the user already chose a route and approved the visuals, proceed without asking again. If they require an editable deck but did not choose a route, ask only for that route and continue independent bitmap work.

When Copilot is unavailable, use this fallback message and wait for the user's choice before changing routes:

```text
当前 PowerPoint 中没有可用的 Microsoft 365 Copilot，无法执行这条拆元素流程。
请选择：
NONE 取消拆元素，交付已完成的位图版
GORDEN 改用 Gorden Super PPT Skills（需可用的 GordenImage2PPTX 技能和图像生成能力）
```

If Copilot availability is unknown, inspect it or ask whether the user can use Copilot inside PowerPoint; mark it unknown rather than claiming the user has no license. If the app exists but automation cannot control it, explain that specific limitation and offer a manual prompt/checklist handoff, cancellation, or Gorden. A manual handoff remains pending until the resulting file is inspected.

## Prerequisites

| Route | Required capability | Result boundary |
| --- | --- | --- |
| None | Generated, reviewed slide images | Original bitmap PPTX/PDF and preview |
| Gorden | Installed `GordenImage2PPTX`, its scripts/references/dependencies, and working `$imagegen` | Editable ordinary text; movable background/frame/icon picture layers. Frame and chart graphics are pictures by default. |
| PowerPoint Copilot | PowerPoint, a signed-in account with usable Microsoft 365 Copilot editing in the app, image attachment support, and a working app-control session | Native ordinary text and suitable simple shapes; complex artwork may remain independent bitmaps. Actual capabilities are verified per file. |

Check the selected route only. Gorden does not require a Microsoft 365 Copilot subscription; application acceptance can be deferred if PowerPoint is unavailable. A PowerPoint installation, GitHub Copilot, browser Copilot chat, or an account/license label alone does not prove that Copilot can edit the current deck. Inspect the actual panel and editing/attachment capability. Do not request passwords or license keys in chat.

## Gorden route

Source: [Gorden Sun's GordenSuperPPTSkills](https://github.com/GordenSun/GordenSuperPPTSkills), conversion skill [GordenImage2PPTX](https://github.com/GordenSun/GordenSuperPPTSkills/blob/main/GordenImage2PPTX/SKILL.md). The earlier comparison used commit `8c05583dab8334182b71738e8dfbbec5c56a1951`; discover and record the version actually used instead of assuming that historical copy is current. These instructions coordinate the external skill; its scripts are not bundled in Deckit.

1. Resolve the skill through the available skill catalog or supported project/user skill locations; do not hardcode a previous project's path. Read its `SKILL.md` and required references before executing. If absent, explain that Gorden is not installed and offer to install it from the upstream repository or cancel reconstruction. Install only when authorized, using the supported skill installer and preserving attribution. Do not replace it with a generic PPTX assembler while calling the result Gorden.
2. Copy the approved source PNGs into a unique conversion task root inside `work/native/<conversion-id>/`, retain slide-ID mapping and hashes, and process one page at a time. Use the original slide image as the image-generation edit target, not merely a style reference or a text path.
3. Follow the skill's four-layer method: clean recreated background, transparent frame, extracted icons/decorations, and native ordinary text. Generate image layers through `$imagegen`; use its own chroma-key/slicing helpers for the generated layers. Do not leave the original full-slide image underneath native text. Do not substitute local rendering for the skill's image-generation steps.
4. Preserve the default whole-frame picture unless the user explicitly requests frame splitting. Frame parts remain movable pictures; do not label them native vector shapes. Reconcile extracted ordinary text with the approved storyboard; preserve intentional pseudo-text/artistic lettering as artwork when specified.
5. Keep image-call manifests, prompts, layout coordinates, and QA results in the conversion root. Use its layout/placement/visual comparison checks and revise until the reconstructed preview matches the baseline sufficiently for the agreed scope.
6. Package the derivative, preserve notes and page order, and run the shared acceptance checklist below. Label the output “原生文字＋可移动图片层” if that describes the actual structure.

## PowerPoint Copilot route

This is app-assisted reconstruction based on the project's observed workflow, not a guarantee of a universal one-click image conversion feature. Microsoft's [Copilot licensing guidance](https://support.microsoft.com/en-au/microsoft-365-copilot/what-copilot-license-do-i-have) explains that in-app access varies with subscription/license and organization settings; verify the actual editing capability in the user's environment.

1. Open a separate processing copy of the image PPTX in PowerPoint. For a PDF-first run, create an image PPTX processing copy from the same PNGs inside the conversion root; retain the requested PDF delivery. Do not operate on the only copy of the bitmap deck.
2. Start with one representative slide. Attach its original full-resolution PNG to the Copilot panel; verify the attachment appears. An uploaded screenshot/thumbnail is insufficient when the original is available. Failed attachment means the operation has not started.
3. Submit a scope-specific prompt, keeping original text, page order, dimensions, logos and notes. Use a prompt like this, replacing placeholders with the agreed slide IDs/numbers:

```text
只加工当前文件中的第 <N> 页，参考已附的该页高清定稿图片，不改其它页，不增加或删除页面。
把普通标题、正文、数字恢复成真正可编辑的 PowerPoint 文本框；卡片、标签、简单箭头和线条尽量恢复为原生形状。
复杂插图、照片、艺术字可以保留为独立高清图片，保持完整边缘和原有大小、位置，不强行矢量化。
准确保持文案、布局、配色和比例；标准品牌标志保持现有资源，不重新生成；保留演讲者备注。
删除已被新对象替代的整页底图和旧对象，不要把新文字叠在仍有旧字的整页图片上，不要重复添加对象。
原图中刻意保留的伪字/示例错误：<明确范围；没有则写无>，这部分保持图片，不自动纠错。
完成后保存这个加工副本，报告已完成的页、仍保留图片的内容和未完成部分。
```

4. Inspect the saved pilot and its preview before expanding to small batches of selected pages. Save and log after each batch. A Copilot “done” message or ongoing progress indicator is not completion evidence.
5. After timeout, partial completion, disconnection or lock screen, inspect the saved file and resume only missing pages. Do not resend a whole batch blindly; the observed workflow once produced three overlapping copies of objects after retries.
6. Check duplicates and image edges explicitly: removal of baked-in text can damage adjacent artwork (the observed example damaged a cat's ear). Correct affected pages from the original high-resolution baseline and reinspect. Small edits can remain in PowerPoint; major content/layout/style changes return to bitmap revision followed by reconstruction of those pages.
7. Save the reviewed derivative into the native delivery directory and complete the checks below. Record the app/model/version only if visible, without prescribing the model from an older run.

## Artifact and status contract

Keep `production_mode: image-first`. The optional stage is a separate `native_conversion` object in `run.json`; older manifests without it mean no conversion was requested. Preserve unrelated manifest fields.

```json
{
  "native_conversion": {
    "route": "none",
    "status": "not-requested",
    "slide_ids": []
  }
}
```

Routes are `none`, `gorden`, and `powerpoint-copilot`. After a conversion request, also record the conversion ID, requested scope, source artifact paths/SHA-256 values, capability check and observed dependency version, checkpoint pages, completed/failed/pending slide IDs, output paths and hashes, and separate structural/visual/application acceptance results. Use `awaiting-choice`, `queued`, `running`, `partial`, `blocked`, `completed`, or `skipped` as appropriate; record the concrete reason when blocked. Never turn an unknown/failed check into a pass.

Suggested paths:

```text
work/native/<conversion-id>/source/          # copies of approved PNGs and slide mapping
work/native/<conversion-id>/prompts/         # conversion instructions, separate from image prompts
work/native/<conversion-id>/checkpoints/     # saved processing copies
work/native/<conversion-id>/acceptance-copy.pptx
dist/native/<conversion-id>/<deck-name>-native.pptx
dist/native/<conversion-id>/preview/         # rendered from the saved derivative
dist/native/<conversion-id>/structure.json
dist/native/<conversion-id>/acceptance.md
```

Keep derivatives under `dist/native/`, not next to the base `dist/*.pptx`: the development helper's base review intentionally audits root PPTX files as one-picture image containers. Keep base `dist/preview.png` as the bitmap preview, and label derivative previews distinctly. Do not overwrite old conversions; revisions create a new conversion ID. For a selected-page rebuild of an existing native derivative, preserve untouched slide content, media, notes, and page order and verify the scope after saving.

## Shared acceptance checklist

1. **Provenance and scope**: source hashes match the approved PNGs; the saved derivative has the expected slide count/order and all requested pages processed; untouched pages and notes are preserved. Record partial scope explicitly.
2. **Structure and content**: inspect PPTX ZIP/XML or a reliable object API. Count text boxes, shapes, pictures, tables/charts and connectors separately; text runs are not text boxes. Verify the expected body text is in actual text objects, not just footer/title chrome or notes. Check picture relationships for an unchanged full-slide PNG under new objects. Count labels/headings against the intended copy to detect duplicate text; inspect grouped objects too. Chart labels do not prove native chart data, and drawn lines do not prove connector binding.
3. **Visual comparison**: render the saved derivative or inspect each processed page in PowerPoint beside the source PNG. Check exact copy, number values, repeated text, overlap, missing elements, crop damage, font substitution, line breaks, alignment and logos. A programmatic score or file structure alone does not pass this check.
4. **Real editing**: in a separate acceptance copy, select an existing reconstructed text object and make a small replacement (do not add an overlay), independently move one reconstructed object, save, close, reopen the same file, and verify both persisted with no repair prompt. Retain before/after evidence and identify representative pages; this proves the tested actions, not all conceivable edits. Keep the formal delivery unchanged.
5. **Delivery language**: report each gate as passed, failed or unverified. Use `completed` only when the requested scope passes all gates. Otherwise deliver the bitmap result plus a clearly labeled partial/candidate derivative, with remaining steps recorded. Do not claim full editability, all-vector reconstruction, native tables/charts or tested animation without corresponding evidence.

Baseline `audit-pptx` and `review` retain their strict image-container meaning. This native checklist is separate; do not pass the native derivative through the baseline audit or claim that placing it in a separate directory verifies it.
