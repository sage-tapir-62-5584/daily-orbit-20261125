#!/usr/bin/env python3
"""Publish the entry image for make.fun's "Sum up 25 November's world news
in one image" bounty.

The poster is a finished PNG stored in this repository at
``assets/entry.png``. Running this program places it as the entry image: it
copies those exact bytes to ``entry.png`` in the output directory — the
directory named by the ``MAKEFUN_OUTPUT_DIR`` environment variable when that
is set, and ``/output`` otherwise. The copy is a plain byte-for-byte
transfer, with no decoding or re-encoding, so every run writes an identical
file. Standard library only; no network access.
"""

import os
import shutil
from pathlib import Path


def publish() -> Path:
    repo_root = Path(__file__).resolve().parent
    poster = repo_root / "assets" / "entry.png"
    target_dir = Path(os.environ.get("MAKEFUN_OUTPUT_DIR") or "/output")
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / "entry.png"
    shutil.copyfile(poster, target)
    return target


if __name__ == "__main__":
    publish()
