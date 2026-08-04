from __future__ import annotations

import json
import re
from pathlib import Path


STYLE_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
STYLE_CODE_PATTERN = re.compile(r"^[A-Z0-9]+$")


def load_visual_style_catalog(plugin: Path) -> dict[str, object]:
    plugin = plugin.resolve()
    styles_dir = plugin / "assets" / "visual-styles"
    catalog_path = styles_dir / "catalog.json"
    if not catalog_path.is_file():
        raise FileNotFoundError(f"visual style catalog not found: {catalog_path}")

    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if not isinstance(catalog, dict):
        raise ValueError("visual style catalog must be a JSON object")
    if catalog.get("schema_version") != 1:
        raise ValueError("visual style catalog schema_version must be 1")

    styles = catalog.get("styles")
    if not isinstance(styles, list) or not styles:
        raise ValueError("visual style catalog must contain a non-empty styles list")

    ids: set[str] = set()
    codes: set[str] = set()
    for index, style in enumerate(styles):
        if not isinstance(style, dict):
            raise ValueError(f"visual style entry {index} must be an object")
        for field in ("id", "code", "name", "description", "spec", "recommended_for"):
            if field not in style:
                raise ValueError(f"visual style entry {index} is missing {field}")

        style_id = style["id"]
        code = style["code"]
        if not isinstance(style_id, str) or not STYLE_ID_PATTERN.fullmatch(style_id):
            raise ValueError(f"invalid visual style id: {style_id!r}")
        if not isinstance(code, str) or not STYLE_CODE_PATTERN.fullmatch(code):
            raise ValueError(f"invalid visual style code: {code!r}")
        if style_id in ids:
            raise ValueError(f"duplicate visual style id: {style_id}")
        if code in codes:
            raise ValueError(f"duplicate visual style code: {code}")
        ids.add(style_id)
        codes.add(code)

        recommended_for = style["recommended_for"]
        if not isinstance(recommended_for, list) or not recommended_for or not all(
            isinstance(item, str) and item.strip() for item in recommended_for
        ):
            raise ValueError(f"visual style {style_id} recommended_for must be a non-empty string list")

        spec = style["spec"]
        if not isinstance(spec, str) or not spec.endswith(".md"):
            raise ValueError(f"visual style {style_id} spec must be a Markdown filename")
        spec_path = (styles_dir / spec).resolve()
        if spec_path.parent != styles_dir.resolve():
            raise ValueError(f"visual style {style_id} spec escapes the style directory")
        if not spec_path.is_file():
            raise FileNotFoundError(f"visual style {style_id} spec not found: {spec_path}")

    default_style_id = catalog.get("default_style_id")
    if default_style_id not in ids:
        raise ValueError(f"default_style_id does not reference a catalog style: {default_style_id!r}")

    return catalog


def resolve_visual_style(plugin: Path, style_id_or_code: str) -> dict[str, object]:
    catalog = load_visual_style_catalog(plugin)
    query = style_id_or_code.strip()
    query_code = query.upper()
    for style in catalog["styles"]:
        if style["id"] == query or style["code"] == query_code:
            return style
    valid = ", ".join(f"{style['id']} ({style['code']})" for style in catalog["styles"])
    raise ValueError(f"unknown visual style {style_id_or_code!r}; choose one of: {valid}")
