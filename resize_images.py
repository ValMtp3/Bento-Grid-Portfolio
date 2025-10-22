#!/usr/bin/env python3

from PIL import Image
from pathlib import Path
import shutil
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, as_completed
import argparse

try:
    from tqdm import tqdm

    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    print("⚠️  tqdm non installé - barre de progression désactivée")
    print("   Installez avec: pip install tqdm")

SOURCE_DIR = "public/assets/assets_index"
SIZES = [400, 800, 1200]


def get_optimal_webp_quality(width):
    """
    Retourne la qualité optimale WebP basée sur la largeur de l'image.
    Plus l'image est petite, plus on peut compresser agressivement.
    """
    if width <= 400:
        return 75  # Forte compression pour petites images
    elif width <= 800:
        return 80  # Compression équilibrée pour moyennes images
    else:
        return 85  # Qualité élevée pour grandes images


def process_image_task(input_path, output_dir, width):
    """
    Fonction de traitement d'image sérialisable pour le multiprocessing.
    Retourne les informations nécessaires pour l'affichage.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(input_path)

    # Nettoyer les métadonnées EXIF pour réduire la taille
    try:
        img.info.pop("exif", None)
    except:
        pass

    # Gérer les modes d'image - WebP supporte la transparence !
    if img.mode == "P":  # Palette -> convertir en RGB
        img = img.convert("RGB")
    elif img.mode == "LA":  # Luminance + Alpha -> convertir en RGBA
        img = img.convert("RGBA")
    # Garder RGBA tel quel - WebP gère la transparence parfaitement

    aspect_ratio = img.height / img.width
    new_height = int(width * aspect_ratio)

    img_resized = img.resize((width, new_height), Image.Resampling.LANCZOS)

    output_filename = Path(input_path).stem + ".webp"
    output_path = output_dir / output_filename

    # Utiliser la qualité optimale prédéfinie
    quality = get_optimal_webp_quality(width)
    img_resized.save(
        output_path,
        "WEBP",
        quality=quality,
        method=6,
        lossless=False,
        exact=False,
    )
    file_size = output_path.stat().st_size

    # Retourner les infos pour l'affichage (pas d'affichage ici pour éviter les conflits)
    return {
        "filename": output_filename,
        "width": width,
        "file_size": file_size,
        "path": str(input_path),
    }


def resize_and_convert(input_path, output_dir, width):
    """
    Fonction wrapper pour compatibilité - utilise process_image_task
    """
    result = process_image_task(input_path, output_dir, width)

    # Affichage conditionnel
    file_size_kb = result["file_size"] / 1024
    if not HAS_TQDM or (global_args and global_args.verbose):
        print(f"✓ {result['filename']} → {result['width']}px ({file_size_kb:.1f} KB)")

    return result["file_size"]


def main():
    parser = argparse.ArgumentParser(
        description="Optimiser et redimensionner les images en WebP"
    )
    parser.add_argument(
        "--no-parallel",
        action="store_true",
        help="Désactiver le traitement parallèle (plus lent mais plus stable)",
    )
    parser.add_argument(
        "--quiet", action="store_true", help="Mode silencieux - moins de messages"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Affichage détaillé même avec la barre de progression",
    )
    global global_args
    global_args = parser.parse_args()
    args = global_args

    source_path = Path(SOURCE_DIR)

    if not source_path.exists():
        print(f"❌ Le dossier '{SOURCE_DIR}' n'existe pas")
        return

    # Calculer la taille totale des images originales
    original_total_size = 0
    image_files = [
        f
        for f in source_path.iterdir()
        if f.is_file()
        and f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]
    ]

    for img_file in image_files:
        original_total_size += img_file.stat().st_size

    for size in SIZES:
        size_dir = source_path / str(size)
        if size_dir.exists():
            shutil.rmtree(size_dir)
            print(f"🗑️  Dossier {size}/ supprimé")

    print()

    if not image_files:
        print(f"❌ Aucune image trouvée dans '{SOURCE_DIR}'")
        return

    print(f"📦 {len(image_files)} images trouvées\n")

    # Tracker la taille totale des images générées
    generated_total_size = 0

    # Utiliser le nombre de CPU disponibles pour le parallélisme
    use_parallel = not args.no_parallel
    max_workers = min(mp.cpu_count(), 4) if use_parallel else 1

    # Calculer le nombre total d'images à traiter
    total_images = len(image_files) * len(SIZES)

    # Initialiser la barre de progression si tqdm est disponible
    if HAS_TQDM:
        progress_bar = tqdm(total=total_images, desc="🖼️  Conversion WebP", unit="img")
    else:
        progress_bar = None
        if not args.quiet:
            print(f"📊 Traitement de {total_images} images...")

    for size in SIZES:
        output_dir = source_path / str(size)

        if use_parallel:
            # Préparer les tâches pour le traitement parallèle
            tasks = [(img_file, output_dir, size) for img_file in image_files]

            # Traiter les images en parallèle
            with ProcessPoolExecutor(max_workers=max_workers) as executor:
                future_to_task = {
                    executor.submit(process_single_image, task): task for task in tasks
                }

                for future in as_completed(future_to_task):
                    task = future_to_task[future]
                    try:
                        result = future.result()
                        # result est maintenant un dictionnaire avec file_size
                        generated_total_size += result["file_size"]
                        if progress_bar:
                            progress_bar.update(1)
                        elif not args.quiet:
                            # Afficher progression simple sans tqdm
                            processed = sum(
                                1 for f in future_to_task.keys() if f.done()
                            )
                            print(
                                f"📊 {processed}/{len(tasks)} images traitées pour {size}px",
                                end="\r",
                            )
                    except Exception as e:
                        img_file, _, _ = task
                        if progress_bar:
                            progress_bar.write(f"❌ Erreur avec {img_file.name}: {e}")
                        else:
                            print(f"❌ Erreur avec {img_file.name}: {e}")
                        if progress_bar:
                            progress_bar.update(1)
        else:
            # Traitement séquentiel (plus lent mais plus stable)
            for img_file in image_files:
                try:
                    result = process_image_task(img_file, output_dir, size)
                    generated_total_size += result["file_size"]
                    if progress_bar:
                        progress_bar.update(1)
                    elif not args.quiet and (not HAS_TQDM or args.verbose):
                        file_size_kb = result["file_size"] / 1024
                        print(
                            f"✓ {result['filename']} → {result['width']}px ({file_size_kb:.1f} KB)"
                        )
                except Exception as e:
                    if progress_bar:
                        progress_bar.write(f"❌ Erreur avec {img_file.name}: {e}")
                    else:
                        print(f"❌ Erreur avec {img_file.name}: {e}")
                    if progress_bar:
                        progress_bar.update(1)

    if progress_bar:
        progress_bar.close()
    elif not args.quiet:
        print()  # Nouvelle ligne après la progression simple

    # Calculer et afficher les économies
    original_total_kb = original_total_size / 1024
    generated_total_kb = generated_total_size / 1024
    savings_kb = original_total_kb - generated_total_kb
    savings_percent = (
        (savings_kb / original_total_kb * 100) if original_total_kb > 0 else 0
    )

    if not args.quiet:
        print("\n✅ Traitement terminé")
        print("📊 Résumé des économies :")
        print(f"   • Taille originale : {original_total_kb:.1f} KB")
        print(f"   • Taille générée : {generated_total_kb:.1f} KB")
        print(f"   • Économie : {savings_kb:.1f} KB ({savings_percent:.1f}%)")
        print(f"   • Mode : {'Parallèle' if use_parallel else 'Séquentiel'}")
    else:
        # Affichage minimal en mode silencieux
        print(f"✅ Terminé - Économie: {savings_kb:.1f} KB ({savings_percent:.1f}%)")


def process_single_image(task):
    """
    Fonction wrapper pour le traitement parallèle d'une seule image.
    Utilise process_image_task pour éviter les problèmes de sérialisation.
    """
    img_file, output_dir, size = task
    return process_image_task(img_file, output_dir, size)


if __name__ == "__main__":
    main()
