#!/usr/bin/env python3
# =============================================================================
# Image Processor - Outil de traitement d'images pour le portfolio
# =============================================================================
#
# DESCRIPTION:
#   Ce script traite les images du dossier public/assets/assets_index/ en les
#   redimensionnant en plusieurs tailles (responsive) et en supprimant
#   optionnellement l'arrière-plan via rembg (IA). Les images sont converties
#   en WebP avec une qualité optimale selon la taille.
#
# UTILISATION:
#   uv run image_processor.py [OPTIONS]
#
# PARAMÈTRES DISPONIBLES:
#   --resize-only      Redimensionner uniquement, sans supprimer l'arrière-plan.
#                      Utile pour les images qui doivent garder leur fond.
#
#   --force            Forcer le retraitement de TOUTES les images, même si les
#                      fichiers de sortie existent déjà. Sans ce flag, le script
#                      ne traite que les images nouvelles ou modifiées.
#
#   --model MODEL      Choisir le modèle rembg pour la suppression d'arrière-plan.
#                      Valeurs possibles : u2net (défaut), u2netp (plus rapide),
#                      u2net_human_seg (optimisé pour les humains).
#
#   --no-parallel      Désactiver le traitement parallèle (multiprocessing).
#                      Plus lent mais plus stable en cas de problème mémoire.
#
#   --quiet            Mode silencieux, affiche uniquement le résultat final.
#
#   --verbose          Affichage détaillé de chaque image traitée.
#
#   --skip-install     Ne pas installer automatiquement rembg si absent.
#
# EXEMPLES:
#   uv run image_processor.py                     # Traiter les nouvelles images
#   uv run image_processor.py --force             # Retraiter TOUTES les images
#   uv run image_processor.py --resize-only       # Redimensionner sans suppr. fond
#   uv run image_processor.py --force --resize-only  # Tout retraiter, sans fond
#   uv run image_processor.py --model u2netp      # Modèle plus rapide
#
# FICHIERS:
#   - Source : public/assets/assets_index/ (images originales)
#   - Sortie : public/assets/assets_index/{360,400,640,800,1200,1400}/
#   - Exclusions : exclude_bg_removal.txt (images à ne pas détacher du fond)
#
# TAILLES GÉNÉRÉES: 360px, 400px, 640px, 800px, 1200px, 1400px
# FORMAT DE SORTIE: WebP (qualité adaptative selon la taille)
# =============================================================================

import argparse
import multiprocessing as mp
import os
import shutil
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

try:
    from tqdm import tqdm

    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    print("⚠️  tqdm non installé - barre de progression désactivée")
    print("   Installez avec: pip install tqdm")

SOURCE_DIR = "public/assets/assets_index"
SIZES = [360, 400, 640, 800, 1200, 1400]
DEFAULT_MODEL = "u2net"
EXCLUDE_FILE = "exclude_bg_removal.txt"


def check_rembg_installed():
    """
    Vérifie si rembg est installé et disponible
    """
    try:
        result = subprocess.run(
            [sys.executable, "-c", "import rembg"], capture_output=True, text=True
        )
        return result.returncode == 0
    except:
        return False


def install_rembg():
    """
    Installe rembg si nécessaire en utilisant uv
    """
    print("📦 Installation de rembg avec uv...")
    try:
        # Vérifier si uv est disponible
        uv_check = subprocess.run(["uv", "--version"], capture_output=True, text=True)
        if uv_check.returncode != 0:
            print("❌ uv n'est pas installé. Veuillez installer uv d'abord.")
            return False

        # Ajouter rembg aux dépendances et installer
        subprocess.run(["uv", "add", "rembg[cpu]"], check=True)
        print("✅ rembg installé avec succès via uv")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Échec de l'installation de rembg avec uv: {e}")
        return False


def remove_background(input_path, output_path, model=DEFAULT_MODEL):
    """
    Supprime l'arrière-plan d'une image en utilisant rembg
    """
    try:
        session = new_session(model)
        img = Image.open(input_path)
        output_img = remove(img, session=session)
        output_img.save(output_path)
        return True
    except Exception as e:
        print(f"❌ Erreur rembg pour {input_path.name}: {e}")
        return False


def load_exclude_list():
    """
    Charge la liste des images à exclure de la suppression d'arrière-plan
    """
    exclude_path = Path(EXCLUDE_FILE)
    if not exclude_path.exists():
        return set()
    with open(exclude_path, "r", encoding="utf-8") as f:
        # Supprimer les espaces et lignes vides, prendre le nom sans extension
        return {line.strip().rsplit(".", 1)[0] for line in f if line.strip()}


def process_image_task(
    input_path,
    output_dir,
    width,
    model=DEFAULT_MODEL,
    resize_only=False,
    exclude_list=None,
):
    """
    Fonction de traitement d'image sérialisable pour le multiprocessing.
    """
    if exclude_list is None:
        exclude_list = set()

    output_dir.mkdir(parents=True, exist_ok=True)

    # Vérifier si l'image doit être exclue de la suppression d'arrière-plan
    image_stem = input_path.stem
    is_excluded = image_stem in exclude_list

    if resize_only or is_excluded:
        # Utiliser directement l'image originale
        img = Image.open(input_path)
    else:
        # D'abord supprimer l'arrière-plan
        temp_path = output_dir / f"temp_{input_path.stem}.png"

        if not remove_background(input_path, temp_path, model):
            return None

        # Ensuite redimensionner et convertir en WebP
        img = Image.open(temp_path)

    # Nettoyer les métadonnées EXIF
    try:
        img.info.pop("exif", None)
    except:
        pass

    # Gérer les modes d'image - WebP supporte la transparence
    if img.mode == "P":
        if "transparency" in img.info:
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
    elif img.mode == "LA":  # Luminance + Alpha -> convertir en RGBA
        img = img.convert("RGBA")
    # Garder RGBA tel quel - WebP gère la transparence parfaitement

    aspect_ratio = img.height / img.width
    new_height = int(width * aspect_ratio)

    img_resized = img.resize((width, new_height), Image.Resampling.LANCZOS)

    output_filename = Path(input_path).stem + ".webp"
    output_path = output_dir / output_filename

    # Utiliser une qualité optimale
    quality = (
        get_optimal_webp_quality(width) if (resize_only or is_excluded) else 85
    )  # Qualité élevée pour la transparence
    img_resized.save(
        output_path,
        "WEBP",
        quality=quality,
        method=6,
        lossless=False,
        exact=False,
    )

    file_size = output_path.stat().st_size

    # Supprimer le fichier temporaire si utilisé
    if not (resize_only or is_excluded):
        temp_path.unlink()

    return {
        "filename": output_filename,
        "width": width,
        "file_size": file_size,
        "path": str(input_path),
    }


def get_optimal_webp_quality(width):
    """
    Retourne la qualité optimale WebP basée sur la largeur de l'image.
    """
    if width <= 360:
        return 70  # Très forte compression pour très petites images
    elif width <= 400:
        return 75  # Forte compression pour petites images
    elif width <= 800:
        return 80  # Compression équilibrée pour moyennes images
    elif width <= 1200:
        return 85  # Qualité élevée pour grandes images
    else:
        return 90  # Qualité très élevée pour très grandes images


def main():
    parser = argparse.ArgumentParser(
        description="Traiter les images : supprimer l'arrière-plan ou seulement redimensionner"
    )
    parser.add_argument(
        "--resize-only",
        action="store_true",
        help="Seulement redimensionner les images sans supprimer l'arrière-plan",
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
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Ne pas installer automatiquement rembg si absent",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        choices=["u2net", "u2netp", "u2net_human_seg"],
        help=f"Modèle rembg à utiliser (défaut: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Forcer le retraitement de toutes les images, même si déjà traitées",
    )

    args = parser.parse_args()

    resize_only = args.resize_only

    # Charger la liste d'exclusion
    exclude_list = load_exclude_list()

    # Vérifier si rembg est installé seulement si on supprime l'arrière-plan et qu'il y a des images à traiter
    need_rembg = not resize_only and any(
        img.stem not in exclude_list
        for img in Path(SOURCE_DIR).iterdir()
        if img.is_file()
        and img.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]
    )
    if need_rembg:
        if not check_rembg_installed():
            if not args.skip_install:
                if not install_rembg():
                    print(
                        "❌ rembg est requis pour ce script. Utilisez --skip-install pour ignorer."
                    )
                    print(
                        "   Vous pouvez aussi installer manuellement avec: uv add rembg"
                    )
                    return
            else:
                print(
                    "❌ rembg n'est pas installé. Utilisez 'uv add rembg' ou retirez --skip-install"
                )
                return

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

    # Toujours sauvegarder dans les dossiers de base
    output_base_dir = source_path
    subfolder_name = ""

    if not args.force:
        for size in SIZES:
            size_dir = output_base_dir / str(size)
            size_dir.mkdir(exist_ok=True)  # Ne pas supprimer si on ne force pas
    else:
        for size in SIZES:
            size_dir = output_base_dir / str(size)
            if size_dir.exists():
                shutil.rmtree(size_dir)
                if not args.quiet:
                    print(f"🗑️  Dossier {subfolder_name}{size}/ supprimé")

    if not args.quiet:
        print()

    if not image_files:
        print(f"❌ Aucune image trouvée dans '{SOURCE_DIR}'")
        return

    # Filtrer les images à traiter si --force n'est pas utilisé
    images_to_process = {}
    total_images = 0
    for size in SIZES:
        output_dir = output_base_dir / str(size)
        images_to_process[size] = []
        for img_file in image_files:
            output_filename = Path(img_file).stem + ".webp"
            output_path = output_dir / output_filename
            if (
                args.force
                or not output_path.exists()
                or output_path.stat().st_mtime < img_file.stat().st_mtime
            ):
                images_to_process[size].append(img_file)
                total_images += 1

    if not args.quiet:
        processed_count = sum(len(imgs) for imgs in images_to_process.values())
        action = "redimensionner" if resize_only else "traiter"
        if processed_count == 0:
            print(
                f"✅ Toutes les {len(image_files)} images sont déjà à jour ({len(SIZES)} tailles chacune).\n"
            )
            print(
                "💡 Utilisez --force pour forcer le retraitement de toutes les images."
            )
            print(f"   Exemple : uv run image_processor.py --force")
            return
        print(
            f"📦 {processed_count} images à {action} (sur {len(image_files) * len(SIZES)} total)\n"
        )

    # Précharger le modèle seulement si nécessaire
    if need_rembg:
        if not args.quiet:
            print("📥 Chargement du modèle rembg...")
        try:
            session = new_session(args.model)
            if not args.quiet:
                print("✅ Modèle chargé avec succès\n")
        except Exception as e:
            print(f"❌ Erreur lors du chargement du modèle: {e}")
            return

    # Tracker la taille totale des images générées
    generated_total_size = 0
    generated_with_bg_size = 0
    generated_without_bg_size = 0

    # Utiliser le nombre de CPU disponibles pour le parallélisme
    use_parallel = not args.no_parallel
    max_workers = (
        mp.cpu_count() if use_parallel else 1
    )  # Utiliser tous les CPU pour plus de vitesse

    # Initialiser la barre de progression si tqdm est disponible
    desc = "🖼️  Redimensionnement" if resize_only else "🖼️  Suppression arrière-plan"
    if HAS_TQDM:
        progress_bar = tqdm(total=total_images, desc=desc, unit="img")
    else:
        progress_bar = None
        if not args.quiet:
            print(f"📊 Traitement de {total_images} images...")

    for size in SIZES:
        output_dir = output_base_dir / str(size)
        current_images = images_to_process[size]

        if not current_images:
            continue  # Rien à traiter pour cette taille

        if use_parallel:
            # Préparer les tâches pour le traitement parallèle
            with ProcessPoolExecutor(max_workers=max_workers) as executor:
                future_to_task = {
                    executor.submit(
                        process_image_task,
                        img_file,
                        output_dir,
                        size,
                        args.model,
                        resize_only,
                        exclude_list,
                    ): (
                        img_file,
                        size,
                    )
                    for img_file in current_images
                }

                for future in as_completed(future_to_task):
                    img_file, size = future_to_task[future]
                    try:
                        result = future.result()
                        if result:
                            if size == 400:
                                generated_total_size += result["file_size"]
                                # Déterminer si avec ou sans bg
                                img_stem = img_file.stem
                                if img_stem in exclude_list:
                                    generated_with_bg_size += result["file_size"]
                                else:
                                    generated_without_bg_size += result["file_size"]
                            if progress_bar:
                                progress_bar.update(1)
                            elif not args.quiet:
                                processed = sum(
                                    1 for f in future_to_task.keys() if f.done()
                                )
                                print(
                                    f"📊 {processed}/{len(current_images)} images traitées pour {size}px",
                                    end="\r",
                                )
                    except Exception as e:
                        if progress_bar:
                            progress_bar.write(f"❌ Erreur avec {img_file.name}: {e}")
                        else:
                            print(f"❌ Erreur avec {img_file.name}: {e}")
                        if progress_bar:
                            progress_bar.update(1)
        else:
            # Traitement séquentiel
            for img_file in current_images:
                try:
                    result = process_image_task(
                        img_file,
                        output_dir,
                        size,
                        args.model,
                        resize_only,
                        exclude_list,
                    )
                    if result:
                        if size == 400:
                            generated_total_size += result["file_size"]
                            # Déterminer si avec ou sans bg
                            img_stem = img_file.stem
                            if img_stem in exclude_list:
                                generated_with_bg_size += result["file_size"]
                            else:
                                generated_without_bg_size += result["file_size"]
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

    # Économie de la suppression d'arrière-plan
    bg_savings_kb = generated_with_bg_size / 1024 - generated_without_bg_size / 1024
    bg_savings_percent = (
        (bg_savings_kb / (generated_with_bg_size / 1024) * 100)
        if generated_with_bg_size > 0
        else 0
    )

    if not args.quiet:
        print("\n✅ Traitement terminé")
        print("📊 Résumé des économies :")
        print(f"   • Taille originale : {original_total_kb:.1f} KB")
        print(f"   • Taille générée (400px) : {generated_total_kb:.1f} KB")
        print(f"   • Économie totale : {savings_kb:.1f} KB ({savings_percent:.1f}%)")
        if (
            exclude_list
            and generated_with_bg_size > 0
            and generated_without_bg_size > 0
        ):
            print(
                f"   • Économie suppression arrière-plan : {bg_savings_kb:.1f} KB ({bg_savings_percent:.1f}%)"
            )
        print(f"   • Mode : {'Parallèle' if use_parallel else 'Séquentiel'}")
        if need_rembg:
            print(f"   • Modèle : {args.model}")
        print(f"   • Dossier de sortie : {output_base_dir}")
        if exclude_list:
            print(
                f"   • Images exclues de la suppression d'arrière-plan : {len(exclude_list)}"
            )
    else:
        # Affichage minimal en mode silencieux
        print(f"✅ Terminé - Économie: {savings_kb:.1f} KB ({savings_percent:.1f}%)")


if __name__ == "__main__":
    main()
