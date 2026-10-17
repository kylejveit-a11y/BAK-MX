"""Six orthographic views of the actual mesh, using a CPU depth buffer.

node --experimental-strip-types scripts/render-bike-review.mjs | \
  python scripts/render-bike-review.py review.png --views-dir review-views

Input is an array of triangle records: c is an sRGB hex color, v contains three
world-space positions, and optional n contains three world-space vertex normals.
Optional doubleSided and side='back' preserve non-default material sidedness.
This deliberately omits invented textures, photography, and PBR reflections.
"""
import argparse
import json
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


VIEWS = [
    ('right', 'RIGHT', (0, 0, 1)),
    ('left', 'LEFT', (0, 0, -1)),
    ('front', 'FRONT', (1, 0, 0)),
    ('rear', 'REAR', (-1, 0, 0)),
    ('top', 'TOP', (0, 1, 0)),
    ('three-quarter', 'THREE-QUARTER', (1, .55, 1)),
]
BACKGROUND = (237, 239, 240)
TEXT = (39, 48, 55)
MUTED = (92, 103, 111)


def normalized(value):
    return value / np.maximum(np.linalg.norm(value, axis=-1, keepdims=True), 1e-12)


def srgb_to_linear(value):
    return np.where(value <= .04045, value / 12.92, ((value + .055) / 1.055) ** 2.4)


def linear_to_srgb(value):
    value = np.clip(value, 0, 1)
    return np.where(value <= .0031308, value * 12.92, 1.055 * value ** (1 / 2.4) - .055)


def font(size):
    path = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    return ImageFont.truetype(str(path), size) if path.is_file() else ImageFont.load_default()


def render_view(vertices, normals, face_normals, colors, double_sided, back_side, direction, is_top, width, height, supersample, common_scale):
    direction = normalized(np.array(direction, dtype=float))
    up = np.array((1, 0, 0) if is_top else (0, 1, 0), dtype=float)
    right = normalized(np.cross(up, direction))
    up = np.cross(direction, right)
    projected = np.stack([vertices @ right, vertices @ up], axis=-1)
    lo, hi = projected.min(axis=(0, 1)), projected.max(axis=(0, 1))
    scale = min((width - 90) / max(hi[0] - lo[0], 1e-6), (height - 130) / max(hi[1] - lo[1], 1e-6))
    if not is_top:
        scale = common_scale
    xy = (projected - (lo + hi) / 2) * scale
    xy[:, :, 1] *= -1
    xy += np.array((width / 2, height / 2 + 13))
    xy *= supersample
    pixel_width, pixel_height = width * supersample, height * supersample
    pixels = np.empty((pixel_height, pixel_width, 3), dtype=np.uint8)
    pixels[:] = BACKGROUND
    depth = np.full((pixel_height, pixel_width), -np.inf, dtype=np.float32)
    z = vertices @ direction
    # Camera-relative lights keep both sides equally readable for shape review.
    key = normalized(direction + up * .8 - right * .5)
    fill = normalized(direction - up * .25 + right * .75)
    facing = face_normals @ direction
    visible = (facing > 1e-10) | double_sided
    visible = np.where(back_side, facing < -1e-10, visible)
    for i in np.flatnonzero(visible):
        triangle = xy[i]
        xmin = max(0, int(np.floor(triangle[:, 0].min())))
        xmax = min(pixel_width - 1, int(np.ceil(triangle[:, 0].max())))
        ymin = max(0, int(np.floor(triangle[:, 1].min())))
        ymax = min(pixel_height - 1, int(np.ceil(triangle[:, 1].max())))
        if xmax < xmin or ymax < ymin:
            continue
        a, b, c = triangle
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-9:
            continue
        yy, xx = np.mgrid[ymin:ymax + 1, xmin:xmax + 1]
        xx, yy = xx + .5, yy + .5
        w0 = ((b[1] - c[1]) * (xx - c[0]) + (c[0] - b[0]) * (yy - c[1])) / den
        w1 = ((c[1] - a[1]) * (xx - c[0]) + (a[0] - c[0]) * (yy - c[1])) / den
        w2 = 1 - w0 - w1
        zz = w0 * z[i, 0] + w1 * z[i, 1] + w2 * z[i, 2]
        region = depth[ymin:ymax + 1, xmin:xmax + 1]
        mask = (w0 >= -1e-7) & (w1 >= -1e-7) & (w2 >= -1e-7) & (zz > region)
        if not np.any(mask):
            continue
        region[mask] = zz[mask]
        normal = normalized(w0[mask, None] * normals[i, 0] + w1[mask, None] * normals[i, 1] + w2[mask, None] * normals[i, 2])
        if facing[i] < 0:
            normal *= -1
        shade = .34 + .53 * np.maximum(normal @ key, 0) + .13 * np.maximum(normal @ fill, 0)
        color = linear_to_srgb(colors[i] * shade[:, None])
        pixels[ymin:ymax + 1, xmin:xmax + 1][mask] = np.rint(color * 255).astype(np.uint8)
    return Image.fromarray(pixels).resize((width, height), Image.Resampling.LANCZOS)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path, help='Six-view contact sheet PNG')
    parser.add_argument('--views-dir', type=Path, help='Also save each labeled view as a PNG')
    parser.add_argument('--width', type=int, default=1000, help='Individual view width (default: 1000)')
    parser.add_argument('--height', type=int, default=680, help='Individual view height (default: 680)')
    parser.add_argument('--supersample', type=int, choices=(1, 2, 3), default=2)
    args = parser.parse_args()
    if args.width < 320 or args.height < 240:
        parser.error('Individual views must be at least 320 by 240 pixels')
    faces = json.load(sys.stdin)
    if not faces:
        parser.error('Input mesh has no triangles')
    vertices = np.array([f['v'] for f in faces], dtype=float)
    if vertices.shape != (len(faces), 3, 3) or not np.isfinite(vertices).all():
        parser.error('Each triangle must have three finite world-space XYZ positions')
    face_normals = normalized(np.cross(vertices[:, 1] - vertices[:, 0], vertices[:, 2] - vertices[:, 0]))
    normals = normalized(np.array([f.get('n', [face_normals[i]] * 3) for i, f in enumerate(faces)], dtype=float))
    if normals.shape != vertices.shape or not np.isfinite(normals).all():
        parser.error('Vertex normals must contain three finite XYZ vectors per triangle')
    colors = srgb_to_linear(np.array([[int(f['c'][i:i + 2], 16) for i in (1, 3, 5)] for f in faces]) / 255)
    double_sided = np.array([bool(f.get('doubleSided', False)) for f in faces])
    back_side = np.array([f.get('side') == 'back' for f in faces])
    # Match scale across elevations, so front/rear width cannot be exaggerated.
    scales = []
    for key, _, view in VIEWS:
        if key == 'top':
            continue
        direction = normalized(np.array(view, dtype=float))
        right = normalized(np.cross((0, 1, 0), direction))
        up = np.cross(direction, right)
        extent = np.ptp(np.stack([vertices @ right, vertices @ up], axis=-1), axis=(0, 1))
        scales.append(min((args.width - 90) / max(extent[0], 1e-6), (args.height - 130) / max(extent[1], 1e-6)))
    contact = Image.new('RGB', (args.width * 2, args.height * 3 + 70), BACKGROUND)
    if args.views_dir:
        args.views_dir.mkdir(parents=True, exist_ok=True)
    for index, (key, label, direction) in enumerate(VIEWS):
        view = render_view(vertices, normals, face_normals, colors, double_sided, back_side, direction, key == 'top', args.width, args.height, args.supersample, min(scales))
        draw = ImageDraw.Draw(view)
        draw.text((28, 20), label, font=font(22), fill=TEXT)
        draw.text((28, 49), '2025 KTM 450 SX-F | original exterior study', font=font(15), fill=MUTED)
        draw.text((28, args.height - 29), 'Actual mesh | estimated contours | not OEM verified', font=font(14), fill=MUTED)
        if args.views_dir:
            view.save(args.views_dir / f'{key}.png')
        contact.paste(view, ((index % 2) * args.width, (index // 2) * args.height))
    ImageDraw.Draw(contact).text((28, args.height * 3 + 23), 'CPU geometry review with depth and vertex-normal shading. Not a WebGL lighting or device-performance test.', font=font(16), fill=MUTED)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    contact.save(args.output)
    print(f'Saved six-view geometry review: {args.output}', file=sys.stderr)


if __name__ == '__main__':
    main()
