#!/usr/bin/env python3
"""The Daily Orbit — 25 November 2026.

Ships the finished poster for the make.fun news-image-20261125 bounty.
The poster itself lives in assets/entry.png (a 1024x1024 PNG summing up
25 November 2026's world news). This program's whole job is to check
that image is intact and well formed, then place an identical copy at
<output>/entry.png so the grader sees exactly those bytes.

Run it with MAKEFUN_OUTPUT_DIR set, or pass --output <dir>:
    MAKEFUN_OUTPUT_DIR=out python3 main.py
    python3 main.py --output out
"""

import argparse
import hashlib
import os
import struct
import sys
import zlib

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
MAX_BYTES = 1_048_576          # 1 MiB, the competition's file cap
EXPECTED_WIDTH = 1024
EXPECTED_HEIGHT = 1024
ENTRY_NAME = "entry.png"


def resolve_output_dir(argv):
    """Decide where the entry goes: --output wins, then the env var."""
    parser = argparse.ArgumentParser(
        description="Ship the 25 November 2026 news poster to the output directory."
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output directory (overrides MAKEFUN_OUTPUT_DIR)",
    )
    args = parser.parse_args(argv)
    chosen = args.output or os.environ.get("MAKEFUN_OUTPUT_DIR") or "/output"
    return os.path.abspath(chosen)


def _read_chunk(blob, offset):
    """Read one PNG chunk at offset; return (type, data, next_offset)."""
    if offset + 8 > len(blob):
        raise ValueError("truncated PNG: chunk header runs past the file end")
    length, = struct.unpack(">I", blob[offset:offset + 4])
    ctype = blob[offset + 4:offset + 8]
    end = offset + 12 + length
    if end > len(blob):
        raise ValueError(f"truncated PNG: {ctype.decode('latin1')} chunk overruns the file")
    data = blob[offset + 8:offset + 8 + length]
    stored_crc, = struct.unpack(">I", blob[offset + 8 + length:end])
    actual_crc = zlib.crc32(ctype + data) & 0xFFFFFFFF
    if stored_crc != actual_crc:
        raise ValueError(f"PNG chunk {ctype.decode('latin1')} fails its checksum")
    return ctype, data, end


def png_info(blob):
    """Walk the whole PNG, verifying every chunk, and return (width, height).

    Raises ValueError on anything malformed: bad signature, missing or
    misplaced IHDR, a non-IHDR chunk before IHDR, or a missing IEND.
    """
    if len(blob) < 8 or blob[:8] != PNG_SIGNATURE:
        raise ValueError("not a PNG: bad signature")
    offset = 8
    width = height = None
    seen_idat = False
    seen_iend = False
    first = True
    while offset < len(blob):
        ctype, data, offset = _read_chunk(blob, offset)
        if first and ctype != b"IHDR":
            raise ValueError("PNG must start with an IHDR chunk")
        first = False
        if ctype == b"IHDR":
            if len(data) != 13:
                raise ValueError("IHDR chunk has the wrong length")
            width, height = struct.unpack(">II", data[:8])
            bit_depth, color_type = data[8], data[9]
            if bit_depth not in (1, 2, 4, 8, 16):
                raise ValueError(f"unsupported PNG bit depth: {bit_depth}")
            if color_type not in (0, 2, 3, 4, 6):
                raise ValueError(f"unsupported PNG color type: {color_type}")
            if data[10] != 0 or data[11] != 0 or data[12] != 0:
                raise ValueError("PNG uses an unsupported compression, filter or interlace method")
        if ctype == b"IDAT":
            seen_idat = True
        if ctype == b"IEND":
            seen_iend = True
            if offset != len(blob):
                raise ValueError("trailing bytes after the IEND chunk")
            break
    if width is None:
        raise ValueError("PNG has no IHDR chunk")
    if not seen_idat:
        raise ValueError("PNG has no image data (no IDAT chunk)")
    if not seen_iend:
        raise ValueError("PNG has no IEND chunk")
    return width, height


def check_entry(path):
    """Load assets/entry.png and enforce the competition's limits."""
    if not os.path.isfile(path):
        raise FileNotFoundError(f"missing entry image: {path}")
    size = os.path.getsize(path)
    if size > MAX_BYTES:
        raise ValueError(f"entry.png is {size} bytes, over the 1 MiB cap")
    with open(path, "rb") as handle:
        blob = handle.read()
    width, height = png_info(blob)
    if (width, height) != (EXPECTED_WIDTH, EXPECTED_HEIGHT):
        raise ValueError(
            f"entry.png is {width}x{height}, expected "
            f"{EXPECTED_WIDTH}x{EXPECTED_HEIGHT}"
        )
    return blob, hashlib.sha256(blob).hexdigest()


def copy_entry(source_blob, destination_dir):
    """Write the validated bytes to <destination>/entry.png, deterministically."""
    os.makedirs(destination_dir, exist_ok=True)
    target = os.path.join(destination_dir, ENTRY_NAME)
    # Write to a temp name and rename so a partial write never masquerades
    # as the entry.
    tmp_target = target + ".tmp"
    with open(tmp_target, "wb") as handle:
        handle.write(source_blob)
    os.replace(tmp_target, target)
    return target


def main(argv=None):
    output_dir = resolve_output_dir(argv if argv is not None else sys.argv[1:])
    repo_root = os.path.dirname(os.path.abspath(__file__))
    source_path = os.path.join(repo_root, "assets", ENTRY_NAME)
    try:
        blob, digest = check_entry(source_path)
    except (OSError, ValueError) as problem:
        print(f"error: {problem}", file=sys.stderr)
        return 1
    target = copy_entry(blob, output_dir)
    size = os.path.getsize(target)
    print(
        f"Wrote {target} ({EXPECTED_WIDTH}x{EXPECTED_HEIGHT} PNG, "
        f"{size} bytes, sha256 {digest})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
