#!/usr/bin/env python3
"""
Worker Python persistant pour la suppression d'arrière-plan via rembg.

Ce worker est appelé par le processor Go. Il charge le modèle rembg une seule
fois, puis écoute les demandes sur stdin au format JSON ligne par ligne :

    {"input": "path/to/input.png", "output": "path/to/output.png"}

Il répond sur stdout au format JSON :

    {"status": "ok"}
    {"status": "error", "message": "..."}

Usage:
    python image_processor_worker.py --model u2net
"""

import argparse
import json
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove


def main():
    parser = argparse.ArgumentParser(
        description="Worker rembg persistant pour le processor Go"
    )
    parser.add_argument(
        "--model",
        default="u2net",
        choices=["u2net", "u2netp", "u2net_human_seg"],
        help="Modèle rembg à utiliser",
    )
    args = parser.parse_args()

    try:
        session = new_session(args.model)
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Chargement modèle: {e}"}))
        sys.exit(1)

    # Signal de prêt
    print(json.dumps({"status": "ready"}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
            input_path = Path(request["input"])
            output_path = Path(request["output"])

            img = Image.open(input_path)
            output_img = remove(img, session=session)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_img.save(output_path)

            print(json.dumps({"status": "ok"}), flush=True)
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}), flush=True)


if __name__ == "__main__":
    main()
