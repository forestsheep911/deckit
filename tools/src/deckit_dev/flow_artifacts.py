"""Validate the narrowly selected complex-flow PNG exception to imagegen."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


def scan_flow_artifacts(run_dir: Path, slides: list[tuple[str, str]]) -> list[tuple[str, str, str]]:
    findings = []
    selected = set()
    for slide_id, body in slides:
        method = re.search(r"^-\s+\*\*Visual method\*\*:\s*(\S+)", body, re.M | re.I)
        if not method or method.group(1) == "imagegen":
            continue
        if method.group(1) != "complex-flow":
            findings.append(("error", "FLOW-METHOD", f"{slide_id}: unknown visual method"))
            continue
        selected.add(slide_id)
        try:
            reason = re.search(r"^-\s+\*\*Routing reason\*\*:\s*(.+)", body, re.M | re.I)
            if not reason:
                raise ValueError("storyboard routing reason is missing")
            work = run_dir / "work" / "diagrams" / slide_id
            receipt = json.loads((work / "render.json").read_text(encoding="utf-8"))
            if not isinstance(receipt, dict):
                raise ValueError("receipt must be a JSON object")
            expected_png = f"assets/generated-slides/{slide_id}.png"
            if (receipt.get("renderer"), receipt.get("delivery"), receipt.get("slide_id"), receipt.get("png")) != (
                "deckit-complex-flow", "bitmap-only", slide_id, expected_png
            ):
                raise ValueError("receipt does not identify this bitmap page")
            if not isinstance(receipt.get("reason"), str) or not receipt["reason"].strip():
                raise ValueError("receipt has no routing reason")
            source = (run_dir / receipt["source"]).resolve()
            if not source.is_relative_to(run_dir.resolve()):
                raise ValueError("source escapes run directory")
            png = (run_dir / expected_png).resolve()
            if not png.is_relative_to(run_dir.resolve()):
                raise ValueError("image escapes run directory")
            for file, expected in [(source, receipt["source_sha256"]), (png, receipt["png_sha256"])]:
                if hashlib.sha256(file.read_bytes()).hexdigest() != expected:
                    raise ValueError(f"{file.name} has changed since browser capture")
            qa = receipt["browser_check"]
            if (qa["width"], qa["height"]) != (1600, 900) or not qa["titleFits"] or qa["overflow"] or qa["horizontalOverflow"]:
                raise ValueError("browser layout check did not pass")
            if qa["minNodePx"] < 18 or qa["minTextPx"] < 12:
                raise ValueError("browser readability check did not pass")
            from PIL import Image
            with Image.open(png) as image:
                image.load()
                if image.format != "PNG" or image.size != (3200, 1800):
                    raise ValueError("expected a fully decodable 3200 x 1800 PNG")
        except (OSError, ValueError, KeyError, TypeError) as error:
            findings.append(("error", "FLOW-ARTIFACT", f"{slide_id}: {error}"))
    for receipt in (run_dir / "work" / "diagrams").glob("*/render.json"):
        if receipt.parent.name not in selected:
            findings.append(("error", "FLOW-UNSELECTED", f"{receipt.parent.name}: render receipt exists without a selected complex-flow storyboard page"))
    return findings


def require_flow_artifacts(run_dir: Path, slides: list[tuple[str, str]]) -> None:
    errors = scan_flow_artifacts(run_dir, slides)
    if errors:
        raise ValueError("; ".join(message for _, _, message in errors))
