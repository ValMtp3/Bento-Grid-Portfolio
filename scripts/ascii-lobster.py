"""Version finale : silhouette symetrisee avant conversion, pour supprimer le
bruit de rendu de l'emoji et obtenir un homard net."""

from PIL import Image, ImageDraw, ImageFilter, ImageFont

EMOJI = "\U0001f99e"
FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"


def render() -> Image.Image:
    font = ImageFont.truetype(FONT, 160)
    image = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
    ImageDraw.Draw(image).text((100, 100), EMOJI, font=font, embedded_color=True)
    return image.crop(image.getbbox())


def symmetrize(image: Image.Image) -> Image.Image:
    width, height = image.size
    half = width // 2
    left = image.crop((0, 0, half, height))
    out = Image.new("RGBA", (half * 2, height), (0, 0, 0, 0))
    out.paste(left, (0, 0))
    out.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (half, 0))
    return out


def art(image, cols, ramp, aspect, blur, cut, shade):
    ratio = image.size[1] / image.size[0]
    rows = max(1, round(cols * ratio * aspect))
    work = image.filter(ImageFilter.GaussianBlur(blur * image.size[0] / cols / 2))
    small = work.resize((cols, rows), Image.LANCZOS)

    lines = []
    for y in range(rows):
        row = []
        for x in range(cols):
            r, g, b, a = small.getpixel((x, y))
            if a / 255 < cut:
                row.append(" ")
                continue
            luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
            row.append(ramp[min(len(ramp) - 1, int((1 - luma * shade) * len(ramp)))])
        lines.append("".join(row).rstrip())
    return lines


if __name__ == "__main__":
    base = symmetrize(render())
    variants = [
        ("S34 a50", 34, " :*#", 0.50, 2.6, 0.55, 0.8),
        ("S36 a50", 36, " :*#", 0.50, 2.6, 0.55, 0.8),
        ("S38 ramp5", 38, " .:*#", 0.44, 2.4, 0.52, 0.8),
        ("S42 ramp5", 42, " .:*#", 0.42, 2.4, 0.52, 0.85),
        ("S30 ramp3", 30, " *#", 0.48, 2.8, 0.55, 0.9),
    ]
    for name, cols, ramp, aspect, blur, cut, shade in variants:
        lines = art(base, cols, ramp, aspect, blur, cut, shade)
        print(f"--- {name} ({len(lines)} lignes) ---")
        print("\n".join(lines))
        print()
