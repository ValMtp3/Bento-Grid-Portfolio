#!/usr/bin/env python3

from PIL import Image
from pathlib import Path
import shutil

SOURCE_DIR = "public/assets/assets_index"
SIZES = [400, 800, 1200]


def resize_and_convert(input_path, output_dir, width):
    output_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(input_path)

    aspect_ratio = img.height / img.width
    new_height = int(width * aspect_ratio)

    img_resized = img.resize((width, new_height), Image.Resampling.LANCZOS)

    output_filename = Path(input_path).stem + ".webp"
    output_path = output_dir / output_filename

    img_resized.save(output_path, "WEBP", quality=85)
    print(f"✓ {output_filename} → {width}px")


def main():
    source_path = Path(SOURCE_DIR)

    if not source_path.exists():
        print(f"❌ Le dossier '{SOURCE_DIR}' n'existe pas")
        return

    for size in SIZES:
        size_dir = source_path / str(size)
        if size_dir.exists():
            shutil.rmtree(size_dir)
            print(f"🗑️  Dossier {size}/ supprimé")

    print()

    image_files = [
        f
        for f in source_path.iterdir()
        if f.is_file()
        and f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]
    ]

    if not image_files:
        print(f"❌ Aucune image trouvée dans '{SOURCE_DIR}'")
        return

    print(f"📦 {len(image_files)} images trouvées\n")

    for size in SIZES:
        output_dir = source_path / str(size)

        for img_file in image_files:
            try:
                resize_and_convert(img_file, output_dir, size)
            except Exception as e:
                print(f"❌ Erreur avec {img_file.name}: {e}")

    print("\n✅ Traitement terminé")


if __name__ == "__main__":
    main()
