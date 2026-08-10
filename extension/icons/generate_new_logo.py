"""
Generate BlockSite modern brand logo:
Vibrant rounded gradient badge with a sleek glowing shield & zen focus star emblem.
"""
from PIL import Image, ImageDraw, ImageFilter
import math

def draw_modern_shield_logo(size):
    ss = 8 if size <= 32 else 4
    s = size * ss
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = s / 2, s / 2
    r = s * 0.46

    # 1. Background Rounded Shield / Circle with Gradient
    # Gradient interpolation from Violet-Blue (#6366f1) to Emerald (#10b981)
    for i in range(int(r), 0, -1):
        t = 1 - (i / r)
        # Interpolate color (Violet -> Emerald)
        red = int(99 + (16 - 99) * t)
        green = int(102 + (185 - 102) * t)
        blue = int(241 + (129 - 241) * t)
        alpha = 255
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(red, green, blue, alpha))

    # 2. Outer Glow Ring
    draw.ellipse([cx - r * 0.95, cy - r * 0.95, cx + r * 0.95, cy + r * 0.95], outline=(255, 255, 255, 120), width=int(s * 0.03))

    # 3. Inner White Shield Symbol
    shield_w = r * 0.65
    shield_h = r * 0.75
    
    # Shield Path
    top_y = cy - shield_h * 0.55
    mid_y = cy - shield_h * 0.1
    bot_y = cy + shield_h * 0.55

    points = [
        (cx, top_y + shield_h * 0.15),
        (cx + shield_w, top_y),
        (cx + shield_w, mid_y),
        (cx, bot_y),
        (cx - shield_w, mid_y),
        (cx - shield_w, top_y),
    ]

    draw.polygon(points, fill=(255, 255, 255, 240))

    # 4. Central Inner Emblem: Cutout Zen Star (Indigo fill inside white shield)
    star_r = shield_w * 0.45
    star_points = []
    for i in range(8):
        angle = i * (math.pi / 4)
        dist = star_r if i % 2 == 0 else star_r * 0.45
        sx = cx + dist * math.cos(angle)
        sy = (cy + shield_h * 0.05) + dist * math.sin(angle)
        star_points.append((sx, sy))

    draw.polygon(star_points, fill=(79, 70, 229, 255))

    # Center glowing dot
    dot_r = star_r * 0.22
    draw.ellipse([cx - dot_r, cy + shield_h * 0.05 - dot_r, cx + dot_r, cy + shield_h * 0.05 + dot_r], fill=(52, 211, 153, 255))

    # Resample with LANCZOS for crystal sharp output
    return img.resize((size, size), Image.Resampling.LANCZOS)

def generate_all_icons():
    sizes = [16, 32, 48, 64, 128]
    for sz in sizes:
        icon = draw_modern_shield_logo(sz)
        icon.save(f"icon{sz}.png")
        icon.save(f"icon{sz}_active.png")
    
    master = draw_modern_shield_logo(128)
    master.save("master_active_128.png")
    master.save("master_off_128.png")
    print("ALL_NEW_ICONS_GENERATED_SUCCESSFULLY")

if __name__ == "__main__":
    generate_all_icons()
