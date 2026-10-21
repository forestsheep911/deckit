# Selected complex workflow pages

Deckit normally uses official image generation. Use `complex-flow` only on a page where exact flow relationships are important and would be unreliable in a generated picture: several decision outcomes, a merge after parallel/alternative work, a retry or rejection loop, or cross-role handoffs that need swimlanes. A simple linear three-to-five-step process, a decorative arrow, a timeline or a basic comparison stays on imagegen when it can express the content adequately. Node count alone does not decide.

Make this decision while storyboarding, page by page. For example, a sales deck can keep its cover, problem, benefits and closing as generated images while one middle page uses a complex-flow screenshot. Do not select the renderer for a whole deck merely because one page needs it; a specifically requested all-process document can select its actual complex pages independently. Honor an explicit request to keep a page generated.

For an exceptional page, record:

```text
- **Visual method**: complex-flow
- **Routing reason**: Three roles, approval/rejection branches and a resubmission loop must retain exact connections.
```

Default/missing visual method is `imagegen`. Keep slide IDs, narrative, accepted style and notes. `visual-director` supplies the global palette and page treatment for both methods, but writes an imagegen prompt only for ordinary pages. `complex-flow` then retains an explicit workflow graph and produces the selected page's full-slide PNG. Rendering a PNG does not count as an imagegen call: disclose each page's actual method in the storyboard, page treatment and review. Keep `production_mode: image-first`; this exception changes the source of selected bitmaps, not the container contract.

Read the `complex-flow` skill only after selecting a page. It bundles a pinned Archify workflow renderer and browser capture adapter; no global Archify skill or paid service is required. Its first release supports static 16:9 PNG delivery. Match the surrounding slides' palette using theme and optional `--accent #RRGGBB`; if that treatment cannot fit the accepted visual style, record the mismatch and revise before delivery.

Quality requirements remain slide-oriented: preserve meaning, inspect the actual PNG, and view it at presentation size with adjacent slides. Automated geometry/readability checks cannot establish that the flow is true or that its Chinese glyphs look right. Keep the source JSON, PNG hash, layout/browser receipt and visual review. If adding an overview/detail page changes the accepted page count, record the reason and honor strict user limits.

The packaged PPTX must still contain exactly one full-slide picture on every page, in storyboard order with speaker notes. No native nodes, text boxes, connectors or charts are added by this route. Ordinary pages still require actual imagegen; the diagram exception cannot be used to bypass missing image generation for the rest of the deck. An unavailable renderer leaves the affected page pending rather than weakening checks. Later native-shape export is research, separate from this release and from existing optional Gorden/Copilot reconstruction.
