#!/usr/bin/env python3
"""Create the four production assets for one Iconka icon.

Example:
  python3 scripts/prepare_icon_assets.py \
    --slug troica_rublev --source /path/to/troica.jpg
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import deque
from pathlib import Path
from urllib.parse import urlsplit

import numpy as np
from PIL import Image, ImageFilter


DISPLAY_MAX = 600
CANDLE_MAX = 480
PREVIEW_SIZE = 160
PREVIEW_OVERSCAN = 1.10
LOADING_MAX = 48


def fit_max(image: Image.Image, maximum: int) -> Image.Image:
    """Downscale only: never invent pixels by enlarging a source."""
    width, height = image.size
    scale = min(1.0, maximum / max(width, height))
    size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS) if size != image.size else image.copy()


def make_preview(image: Image.Image) -> Image.Image:
    """Cover a square and overscan by 10%, then crop centrally to 160 px."""
    target = round(PREVIEW_SIZE * PREVIEW_OVERSCAN)
    scale = max(target / image.width, target / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - PREVIEW_SIZE) // 2
    top = (resized.height - PREVIEW_SIZE) // 2
    return resized.crop((left, top, left + PREVIEW_SIZE, top + PREVIEW_SIZE))


def make_loading_image(image: Image.Image) -> Image.Image:
    """Make a full-frame low-resolution image for progressive loading.

    Unlike the square catalogue preview, it retains the full board and aspect
    ratio. The UI deliberately enlarges it with `image-rendering: pixelated`.
    """
    width, height = image.size
    scale = min(1.0, LOADING_MAX / max(width, height))
    size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(size, Image.Resampling.BOX)


def edge_connected_black_alpha(image: Image.Image, black_threshold: int) -> Image.Image:
    """Make only edge-connected near-black canvas pixels transparent.

    It deliberately keeps black paint inside the board: a pixel is removed only
    when it is near black *and* connected to the outer image boundary.
    """
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
    candidate = rgb.max(axis=2) <= black_threshold
    height, width = candidate.shape
    exterior = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        if candidate[y, x] and not exterior[y, x]:
            exterior[y, x] = True
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                add(nx, ny)

    alpha = np.where(exterior, 0, 255).astype(np.uint8)
    # A fractional pixel softens only the physical board edge, not the image.
    return Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(0.45))


def write_assets(root: Path, slug: str, source: Path, black_threshold: int) -> dict[str, str]:
    display_path = root / "icons" / f"{slug}.jpg"
    preview_path = root / "icons" / "preview" / f"{slug}_preview.jpg"
    loading_path = root / "icons" / "loading" / f"{slug}_loading.jpg"
    candle_path = root / "icons" / "candle" / f"{slug}.webp"
    alpha_path = root / "icons" / "png" / f"{slug}.png"
    for path in (display_path, preview_path, loading_path, candle_path, alpha_path):
        path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as opened:
        display = fit_max(opened.convert("RGB"), DISPLAY_MAX)

    display.save(display_path, "JPEG", quality=60, optimize=True, progressive=True)
    make_preview(display).save(preview_path, "JPEG", quality=78, optimize=True, progressive=True)
    make_loading_image(display).save(loading_path, "JPEG", quality=58, optimize=True)

    alpha = edge_connected_black_alpha(display, black_threshold)
    # The PNG is intentionally alpha-only. CSS turns it black for the shadow,
    # so storing colour there would only waste download bytes.
    alpha_master = Image.new("LA", display.size, (0, 0))
    alpha_master.putalpha(alpha)
    alpha_master.save(alpha_path, "PNG", optimize=True)

    candle = fit_max(display.convert("RGBA"), CANDLE_MAX)
    candle_alpha = alpha.resize(candle.size, Image.Resampling.LANCZOS)
    candle.putalpha(candle_alpha)
    candle.save(candle_path, "WEBP", quality=60, method=6, lossless=False)

    return {
        "image": f"./icons/{slug}.jpg",
        "preview_image": f"./icons/preview/{slug}_preview.jpg",
        "loading_image": f"./icons/loading/{slug}_loading.jpg",
        "candle_image": f"./icons/candle/{slug}.webp",
        "cutout_master": f"./icons/png/{slug}.png",
    }


def refresh_loading_image(root: Path, slug: str) -> dict[str, str]:
    """Create only the progressive-loading derivative from the display JPEG."""
    source = root / "icons" / f"{slug}.jpg"
    if not source.is_file():
        raise SystemExit(f"Display image not found: {source}")
    loading_path = root / "icons" / "loading" / f"{slug}_loading.jpg"
    loading_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        make_loading_image(image.convert("RGB")).save(loading_path, "JPEG", quality=58, optimize=True)
    return {"loading_image": f"./icons/loading/{slug}_loading.jpg"}


def add_cache_keys(root: Path, paths: dict[str, str]) -> dict[str, str]:
    """Use content hashes so Safari cannot keep a replaced asset forever."""
    keyed = {}
    for field, relative in paths.items():
        file_path = root / relative.removeprefix("./")
        digest = hashlib.sha256(file_path.read_bytes()).hexdigest()[:10]
        keyed[field] = f"{relative}?v={digest}"
    return keyed


def update_catalog(catalog: Path, slug: str, paths: dict[str, str]) -> None:
    data = json.loads(catalog.read_text(encoding="utf-8"))
    expected = f"icons/{slug}.jpg"
    matches = []
    for icon in data.get("icons", []):
        image_path = urlsplit(icon.get("image", "")).path.lstrip("./")
        if image_path == expected:
            matches.append(icon)
    if len(matches) != 1:
        raise SystemExit(f"Expected one catalog entry for {expected}, found {len(matches)}")
    matches[0].update(paths)
    catalog.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare an Iconka asset set")
    parser.add_argument("--slug", required=True, help="Filename slug, e.g. troica_rublev")
    parser.add_argument("--source", type=Path, help="Original image, kept untouched")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Project root")
    parser.add_argument("--black-threshold", type=int, default=30, help="0–255; external near-black cutout threshold")
    parser.add_argument("--skip-json", action="store_true", help="Create files without changing data/icons.json")
    parser.add_argument(
        "--refresh-loading",
        action="store_true",
        help="Create only the low-resolution loading JPEG from icons/<slug>.jpg",
    )
    args = parser.parse_args()
    if not args.refresh_loading and (not args.source or not args.source.is_file()):
        raise SystemExit(f"Source not found: {args.source}")
    if not 0 <= args.black_threshold <= 255:
        raise SystemExit("--black-threshold must be between 0 and 255")

    root = args.root.resolve()
    paths = (refresh_loading_image(root, args.slug)
             if args.refresh_loading
             else write_assets(root, args.slug, args.source, args.black_threshold))
    if not args.skip_json:
        update_catalog(root / "data" / "icons.json", args.slug, add_cache_keys(root, paths))
    print("Created:")
    for field, path in paths.items():
        print(f"  {field}: {path}")


if __name__ == "__main__":
    main()
