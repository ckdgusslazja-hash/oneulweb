# -*- coding: utf-8 -*-
"""Patch _gen_all_it.py with full 5-demo generator."""
from pathlib import Path
import re

DIR = Path(r"C:\Users\User\Desktop\홈페이지\portfolio\demos")
GEN = DIR / "_gen_all_it.py"

def extract_var(src: str, name: str) -> str:
    m = re.search(rf"{name}\s*=\s*r'''\n(.*?)'''", src, re.S)
    if not m:
        raise ValueError(name)
    return m.group(1)

src = GEN.read_text(encoding="utf-8")
head_part = src[: src.index("CLOUDNINE_CSS")]
cloudnine_css = extract_var(src, "CLOUDNINE_CSS")
cloudnine_body = extract_var(src, "CLOUDNINE_BODY")

# --- builder tail (written as separate string file content below) ---
