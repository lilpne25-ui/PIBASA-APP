"""Genera PNG con transparencia de los logos VLUX (JPG con fondo negro) para integrarlos sin placa.

Metodo: el logo es luz sobre negro, asi que el alfa = brillo maximo del pixel y el color se
"des-premultiplica" (rgb / alfa). Sobre un fondo oscuro se ve igual que el original, sin el cuadro negro.
Uso: python scripts/generar_logo_vlux.py   (requiere Pillow y numpy)
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "brand" / "vlux" / "app-icon-neon-con-vlux.jpg"
OUT = ROOT / "public" / "brand" / "vlux"


def to_alpha(img: Image.Image, floor: float = 0.04) -> Image.Image:
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    a = rgb.max(axis=2)
    a = np.clip((a - floor) / (1 - floor), 0, 1)  # recorta el ruido JPG del fondo
    safe = np.maximum(a, 1e-4)[..., None]
    color = np.clip(rgb / np.maximum(rgb.max(axis=2, keepdims=True), 1e-4), 0, 1)
    out = np.dstack([color, a[..., None]]) * 255
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def main() -> None:
    full = to_alpha(Image.open(SRC))
    # Marca completa (icono + palabra VLUX)
    mark = full.crop((100, 200, 925, 1120))
    mark.thumbnail((512, 512), Image.LANCZOS)
    mark.save(OUT / "vlux-mark.png", optimize=True)
    # Solo el icono (para el pie)
    icon = full.crop((100, 200, 925, 960))
    icon.thumbnail((192, 192), Image.LANCZOS)
    icon.save(OUT / "vlux-icon.png", optimize=True)
    print("OK", (OUT / "vlux-mark.png").stat().st_size, (OUT / "vlux-icon.png").stat().st_size)


if __name__ == "__main__":
    main()
