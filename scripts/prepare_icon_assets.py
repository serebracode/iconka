#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-action"

MAIN_LONG = 1400
PREVIEW_SIZE = 160
LOADING_LONG = 48
CUTOUT_LONG = 900

MAIN_LIMIT = 400 * 1024
PREVIEW_LIMIT = 15 * 1024
LOADING_LIMIT = 2 * 1024
CANDLE_LIMIT = 300 * 1024
CUTOUT_WARN = 1500 * 1024

RATIO_TOLERANCE = 0.005


def die(message: str) -> None:
    raise RuntimeError(message)


def opened(path: Path) -> Image.Image:
    image = Image.open(path)
    image.load()
    return ImageOps.exif_transpose(image)


def ratio(image: Image.Image) -> float:
    return image.width / image.height


def fit_long(image: Image.Image, long_side: int) -> Image.Image:
    scale = long_side / max(image.size)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def save_jpeg_under(image: Image.Image, path: Path, limit: int, start_quality: int) -> int:
    image = image.convert("RGB")
    for quality in range(start_quality, 69, -2):
        image.save(path, "JPEG", quality=quality, optimize=True, progressive=True, subsampling="4:2:0")
        if path.stat().st_size <= limit:
            return quality
    die(f"{path.name}: cannot reach {limit // 1024} KB without dropping JPEG quality below 70")


def save_webp_under(image: Image.Image, path: Path, limit: int) -> int:
    for quality in range(84, 69, -2):
        image.save(path, "WEBP", quality=quality, method=6)
        if path.stat().st_size <= limit:
            return quality
    die(f"{path.name}: cannot reach {limit // 1024} KB without dropping WebP quality below 70")


def has_real_alpha(image: Image.Image) -> bool:
    if image.mode not in ("RGBA", "LA") and "transparency" not in image.info:
        return False
    alpha = image.convert("RGBA").getchannel("A")
    lo, hi = alpha.getextrema()
    return lo < 255 and hi > 0


def process(slug: str) -> None:
    jpg_path = SOURCE / f"{slug}.jpg"
    png_path = SOURCE / f"{slug}.png"
    square_path = SOURCE / f"{slug}_square.jpg"

    missing = [p.name for p in (jpg_path, png_path, square_path) if not p.exists()]
    if missing:
        die(f"{slug}: missing source file(s): {', '.join(missing)}")

    main_src = opened(jpg_path)
    cutout_src = opened(png_path)
    square_src = opened(square_path)

    if max(main_src.size) < MAIN_LONG:
        die(f"{slug}: main JPG is too small ({main_src.width}x{main_src.height}); long side must be at least {MAIN_LONG}px")
    if max(cutout_src.size) < MAIN_LONG:
        die(f"{slug}: alpha PNG is too small ({cutout_src.width}x{cutout_src.height}); long side must be at least {MAIN_LONG}px")
    if square_src.width != square_src.height:
        die(f"{slug}: square JPG must be exactly 1:1, got {square_src.width}x{square_src.height}")
    if min(square_src.size) < PREVIEW_SIZE:
        die(f"{slug}: square JPG must be at least {PREVIEW_SIZE}x{PREVIEW_SIZE}")
    if abs(ratio(main_src) - ratio(cutout_src)) / ratio(main_src) > RATIO_TOLERANCE:
        die(f"{slug}: JPG and PNG aspect ratios differ by more than {RATIO_TOLERANCE * 100:.1f}%")
    if not has_real_alpha(cutout_src):
        die(f"{slug}: PNG has no meaningful alpha channel")

    main = fit_long(main_src, MAIN_LONG)
    alpha_main = fit_long(cutout_src.convert("RGBA"), MAIN_LONG)
    preview = square_src.resize((PREVIEW_SIZE, PREVIEW_SIZE), Image.Resampling.LANCZOS)
    loading = fit_long(main_src, LOADING_LONG)
    cutout = fit_long(cutout_src.convert("RGBA"), CUTOUT_LONG)

    out_main = ROOT / "icons" / f"{slug}.jpg"
    out_preview = ROOT / "icons" / "preview" / f"{slug}_preview.jpg"
    out_loading = ROOT / "icons" / "loading" / f"{slug}_loading.jpg"
    out_candle = ROOT / "icons" / "candle" / f"{slug}.webp"
    out_cutout = ROOT / "icons" / "png" / f"{slug}.png"

    for p in (out_main, out_preview, out_loading, out_candle, out_cutout):
        p.parent.mkdir(parents=True, exist_ok=True)

    main_q = save_jpeg_under(main, out_main, MAIN_LIMIT, 86)
    preview_q = save_jpeg_under(preview, out_preview, PREVIEW_LIMIT, 84)
    loading_q = save_jpeg_under(loading, out_loading, LOADING_LIMIT, 76)
    candle_q = save_webp_under(alpha_main, out_candle, CANDLE_LIMIT)

    cutout.save(out_cutout, "PNG", optimize=True, compress_level=9)
    if out_cutout.stat().st_size > CUTOUT_WARN:
        print(f"WARNING: {out_cutout.name}: optimized PNG is {out_cutout.stat().st_size / 1024:.1f} KB; review if over {CUTOUT_WARN // 1024} KB")

    expected_loading = fit_long(main, LOADING_LONG).size
    checks = [
        (out_main, main.size, MAIN_LIMIT),
        (out_preview, (PREVIEW_SIZE, PREVIEW_SIZE), PREVIEW_LIMIT),
        (out_loading, expected_loading, LOADING_LIMIT),
        (out_candle, main.size, CANDLE_LIMIT),
        (out_cutout, cutout.size, None),
    ]
    for path, expected_size, byte_limit in checks:
        with Image.open(path) as check:
            if check.size != expected_size:
                die(f"{path.name}: output dimensions {check.size} != expected {expected_size}")
        if path.stat().st_size > byte_limit:
            die(f"{path.name}: output exceeds size limit")

    print(f"\n{slug}")
    print(f"  main     {main.size[0]}x{main.size[1]}  {out_main.stat().st_size / 1024:.1f} KB  JPEG q={main_q}")
    print(f"  preview  160x160  {out_preview.stat().st_size / 1024:.1f} KB  JPEG q={preview_q}")
    print(f"  loading  {expected_loading[0]}x{expected_loading[1]}  {out_loading.stat().st_size} B  JPEG q={loading_q}")
    print(f"  candle   {main.size[0]}x{main.size[1]}  {out_candle.stat().st_size / 1024:.1f} KB  WebP q={candle_q}")
    print(f"  cutout   {cutout.size[0]}x{cutout.size[1]}  {out_cutout.stat().st_size / 1024:.1f} KB  PNG")


def discover() -> list[str]:
    if not SOURCE.exists():
        die("source-action/ does not exist")
    slugs = []
    for path in sorted(SOURCE.glob("*.jpg")):
        if path.stem.endswith("_square"):
            continue
        slug = path.stem
        if (SOURCE / f"{slug}.png").exists() and (SOURCE / f"{slug}_square.jpg").exists():
            slugs.append(slug)
    return slugs


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Iconka assets from source-action masters")
    parser.add_argument("--slug", default="all", help="slug to process, or 'all'")
    args = parser.parse_args()

    slugs = discover() if args.slug == "all" else [args.slug]
    if not slugs:
        die("No complete source sets found in source-action/")

    for slug in slugs:
        process(slug)

    print(f"\nPrepared {len(slugs)} icon set(s).")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
