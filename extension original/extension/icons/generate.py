"""
Generate BlockSite icons: red circle with white 'stop hand' symbol.
All sizes pixel-perfect with supersampling.
"""
from PIL import Image, ImageDraw
import math


def draw_stop_hand_icon(size):
    """Red circle with white stop-hand gesture."""
    ss = 8 if size <= 32 else 4
    s = size * ss
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = s / 2, s / 2
    margin = s * 0.02

    # --- Red circle background ---
    r = s / 2 - margin
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(207, 54, 54, 255))

    # --- White stop hand ---
    # Hand is centered, slightly below center of circle
    hand_cx = cx
    hand_cy = cy + r * 0.06

    # Palm dimensions
    palm_w = r * 0.52   # half-width of palm
    palm_h = r * 0.38   # half-height of palm
    palm_top = hand_cy - palm_h * 0.3
    palm_bottom = hand_cy + palm_h * 1.1
    palm_radius = palm_w * 0.25  # corner rounding

    # Finger dimensions
    finger_w = r * 0.088  # half-width of each finger
    finger_gap = r * 0.028  # gap between fingers
    finger_round = finger_w * 0.85

    # Four fingers positions (index to pinky, left to right)
    finger_spacing = (finger_w * 2 + finger_gap)
    total_fingers_w = finger_spacing * 3
    finger_start_x = hand_cx - total_fingers_w / 2

    # Finger heights vary (middle longest, pinky shortest)
    finger_lengths = [r * 0.42, r * 0.48, r * 0.44, r * 0.33]  # index, middle, ring, pinky
    finger_bases = [palm_top + r * 0.05, palm_top, palm_top + r * 0.03, palm_top + r * 0.08]

    # Draw fingers (behind palm, extending upward)
    for i in range(4):
        fx = finger_start_x + i * finger_spacing
        f_top = finger_bases[i] - finger_lengths[i]
        f_bottom = finger_bases[i] + r * 0.12  # overlap into palm
        f_left = fx - finger_w
        f_right = fx + finger_w

        draw.rounded_rectangle(
            [f_left, f_top, f_right, f_bottom],
            radius=finger_round,
            fill=(255, 255, 255, 255)
        )

    # Draw palm (overlaps bottom of fingers)
    draw.rounded_rectangle(
        [hand_cx - palm_w, palm_top, hand_cx + palm_w, palm_bottom],
        radius=palm_radius,
        fill=(255, 255, 255, 255)
    )

    # Thumb — extends from right side of palm, going right & slightly down
    thumb_w = r * 0.075
    thumb_len = r * 0.26

    # Thumb base: right-center of palm
    tb_x = hand_cx + palm_w + r * 0.01
    tb_y = hand_cy + palm_h * 0.20

    # Thumb tip: to the right and slightly down
    angle_deg = 25
    tt_x = tb_x + thumb_len * math.cos(math.radians(angle_deg))
    tt_y = tb_y + thumb_len * math.sin(math.radians(angle_deg))

    # Draw as tapered capsule — thicker at base, thin rounded tip
    steps = 40
    for i in range(steps + 1):
        t = i / steps
        px = tb_x + (tt_x - tb_x) * t
        py = tb_y + (tt_y - tb_y) * t
        # Taper: base is full width, tip is 55%
        tw = thumb_w * (1.0 - t * 0.45)
        draw.ellipse([px - tw, py - tw, px + tw, py + tw], fill=(255, 255, 255, 255))

    # Small blend at base (subtle, not a big blob)
    blend_r = thumb_w * 1.1
    draw.ellipse(
        [tb_x - blend_r, tb_y - blend_r, tb_x + blend_r, tb_y + blend_r],
        fill=(255, 255, 255, 255)
    )

    # --- Finger separation lines (subtle red lines on palm area) ---
    # These give definition to where fingers meet the palm
    line_color = (207, 54, 54, 60)  # very subtle
    line_w_px = max(1, int(s * 0.004))
    for i in range(4):
        fx = finger_start_x + i * finger_spacing
        # Small line at the base of each finger gap
        if i > 0:
            gap_x = fx - finger_spacing / 2
            draw.line(
                [(gap_x, palm_top + r * 0.01), (gap_x, palm_top + r * 0.10)],
                fill=line_color, width=line_w_px
            )

    # Downsample with high-quality resampling
    img = img.resize((size, size), Image.LANCZOS)
    return img


if __name__ == '__main__':
    import os
    out_dir = os.path.dirname(os.path.abspath(__file__))

    for size in [16, 32, 48, 128]:
        icon = draw_stop_hand_icon(size)
        icon.save(os.path.join(out_dir, f'icon{size}.png'))
        print(f'icon{size}.png saved ({os.path.getsize(os.path.join(out_dir, f"icon{size}.png"))} bytes)')

    print('Done!')
