from __future__ import annotations

import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from deckit_dev.cli import new_run
from deckit_dev.visual_styles import load_visual_style_catalog, resolve_visual_style


REPO_ROOT = Path(__file__).resolve().parents[2]
PLUGIN = REPO_ROOT / "plugins" / "deckit"


class VisualStyleLibraryTests(unittest.TestCase):
    def test_catalog_is_valid_and_default_resolves(self) -> None:
        catalog = load_visual_style_catalog(PLUGIN)
        default_style = resolve_visual_style(PLUGIN, catalog["default_style_id"])
        self.assertEqual(default_style["id"], "adaptive-default")

    def test_short_code_resolves_case_insensitively(self) -> None:
        style = resolve_visual_style(PLUGIN, "hand")
        self.assertEqual(style["id"], "notability-handwritten-cn")

    def test_handwritten_style_contains_required_contracts(self) -> None:
        style = resolve_visual_style(PLUGIN, "notability-handwritten-cn")
        spec_path = PLUGIN / "assets" / "visual-styles" / style["spec"]
        text = spec_path.read_text(encoding="utf-8")
        self.assertIn("## Color roles", text)
        self.assertIn("## Content contract", text)
        self.assertIn("## Negative direction", text)
        self.assertIn("One slide answers one question", text)

    def test_new_run_records_resolved_style_id(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            source = temp_root / "source.md"
            source.write_text("# Test source\n", encoding="utf-8")
            with redirect_stdout(io.StringIO()):
                new_run(
                    str(source),
                    "style-smoke",
                    temp_root / "outputs",
                    False,
                    "image-first",
                    "quick",
                    "pptx",
                    5,
                    "hand",
                )
            manifest = json.loads(
                (temp_root / "outputs" / "style-smoke" / "run.json").read_text(encoding="utf-8")
            )
            self.assertEqual(manifest["visual_style_id"], "notability-handwritten-cn")


if __name__ == "__main__":
    unittest.main()
