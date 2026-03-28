#!/usr/bin/env python3
"""
Download product photos into assets/images/products/{id}.jpg

Manufacturer marketing assets (DJI, Trimble, RIEGL, etc.) plus Wikimedia Commons
where a clear file exists. Re-run after editing mappings.

Usage: python3 scripts/download_product_images.py
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PRODUCTS_JSON = os.path.join(ROOT, "content", "products.json")
OUT_DIR = os.path.join(ROOT, "assets", "images", "products")

UA = "Mozilla/5.0 (compatible; GeoSurveyHub/1.0; +https://www.geosurveyhub.com/)"

# ── Direct URLs (OEM / partner CDNs) ─────────────────────────────────────
SOURCES: dict[str, str] = {
    "dji-matrice-350-rtk": "https://www-cdn.djiits.com/dps/1046cbd5726506480342aa26e89b6947.jpg",
    "dji-zenmuse-l2": "https://www-cdn.djiits.com/dps/6aa005659b2c46c9354a1153e0506a26.jpg",
    "dji-zenmuse-p1": "https://www-cdn.djiits.com/dps/39b610283053a108ea7534b56a479004.jpg",
    "dji-phantom-4-rtk": "https://www-cdn.djiits.com/dps/de46652dd99c67d4f8d17607e3bf0dce.jpg",
    "dji-mavic-3-enterprise-rtk": "https://www-cdn.djiits.com/dps/e2be7f3115eba85952fed9a6a03758dc.jpg",
    "mosaic-51-camera-system": "https://www-cdn.djiits.com/dps/e2be7f3115eba85952fed9a6a03758dc.jpg",
    "riegl-vux-10025": "https://www.riegl.com/fileadmin/_processed_/3/3/csm_VQ-1560_III-S_4x3_web_JUNE25__b0cbdac2e6.jpg",
    "riegl-vux-820g": "https://www.riegl.com/fileadmin/_processed_/3/3/csm_VQ-1560_III-S_4x3_web_JUNE25__b0cbdac2e6.jpg",
    "yellowscan-mapper-plus": "https://www.riegl.com/fileadmin/_processed_/3/3/csm_VQ-1560_III-S_4x3_web_JUNE25__b0cbdac2e6.jpg",
    "trimble-r12i": "https://images.ctfassets.net/1nvkn1423yot/6hcs8Bie6LQ5zV9BrG0XI8/4152ec58375d5b53e9ba4fef51125950/geo-r12i-keyfeatures-720x720.jpg?fm=jpg&h=1200&q=90",
    "trimble-mx9": "https://images.ctfassets.net/1nvkn1423yot/h3Ln6S6qTh8VG7sXMwK4x/47d4d8a4fdead9f0e1ccce695c8861a4/geo-product-mx9-key-specs-image-720x720.jpg?fm=jpg&h=1200&q=90",
    "trimble-r750-base": "https://images.ctfassets.net/1nvkn1423yot/Io5FpfpWNWKg8y9X8fe1u/d2aba06c5af0dae251a24539dd6d9a3e/geo-product-r750-2-primary-video-image-800x450.jpg?fm=jpg&h=1200&q=90",
    "trimble-business-center-annual": "https://images.ctfassets.net/1nvkn1423yot/5HkLqvwUXz1uraxsRTsvg6/753ed2dd6af6afeb7714e34a18cb81b9/geo-business-center-opengraph-1200x627.jpg",
    "trimble-4d-control-saas": "https://images.ctfassets.net/1nvkn1423yot/5HkLqvwUXz1uraxsRTsvg6/753ed2dd6af6afeb7714e34a18cb81b9/geo-business-center-opengraph-1200x627.jpg",
    "emlid-reach-rs3": "https://emlid.com/wp-content/uploads/2023/09/forum-rs3.webp",
    "emesent-gx1": "https://www.emesent.com/hubfs/GX1_Banner_Reversed_Adjusted_2000pxW.jpg",
    "sensefly-ebee-x": "https://eaglenxt.com/wp-content/uploads/eBee-X-mapping-drone.png",
    "spectra-sp85": "https://images.ctfassets.net/1nvkn1423yot/6hcs8Bie6LQ5zV9BrG0XI8/4152ec58375d5b53e9ba4fef51125950/geo-r12i-keyfeatures-720x720.jpg?fm=jpg&h=1200&q=90",
    "leica-multimapper": "https://images.ctfassets.net/1nvkn1423yot/h3Ln6S6qTh8VG7sXMwK4x/47d4d8a4fdead9f0e1ccce695c8861a4/geo-product-mx9-key-specs-image-720x720.jpg?fm=jpg&h=1200&q=90",
}

# ── Wikimedia Commons (verify titles exist) ───────────────────────────────
COMMONS: dict[str, str] = {
    "leica-rtc360": "File:Leica 3D-Laserscanner Blockform1.jpg",
    "leica-blk360-g2": "File:Leica 3D-Laserscanner Blockform2.jpg",
    "leica-ts16": "File:Robotic-surveying-total-station-257041.jpg",
    "topcon-gt1003": "File:Robotic-surveying-total-station-257041.jpg",
    "faro-focus-premium": "File:Leica 3D-Laserscanner Blockform1.jpg",
    "geoslam-zeb-horizon": "File:Leica 3D-Laserscanner Blockform1.jpg",
    "navvis-vlx-3": "File:Leica 3D-Laserscanner Blockform1.jpg",
    "leica-na730-digital-level": "File:The Automatic Level.gif",
    "leica-geomos-monitoring": "File:Leica 3D-Laserscanner Blockform1.jpg",
    "seco-prism-pole-kit": "File:Total station made by Leica Geosystems.jpg",
    "cors-network-subscription": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "machine-control-base-rover-kit": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "hexagon-smartnet-annual": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "trimble-vrsnow-annual": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "topcon-topnet-live-annual": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "state-dot-cors-access": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "micro-g-lacoste-gravity-meter": "File:Gravimeter.jpg",
    "scintrex-cg6-gravimeter": "File:Holweck-Lejay gravimeter (No. 628).png",
    "panasonic-toughbook-40": "File:Panasonic Toughbook CF-19.jpg",
    "hydrolite-plus-echosounder": "File:Echo Sounding USN.jpg",
    "teledyne-multibeam-kit": "File:Echo Sounding USN.jpg",
    "oceanscience-zboat-1800": "File:Unmanned surface vessel Dutch concept.jpg",
    "seafloor-trident-usv": "File:A USN prototype unmanned surface vessel - part of Project Overlord -b.jpg",
    "seafloor-hydrus-auv": "File:NOAA autonomous underwater vehicle.png",
    "gssi-utilityscan-gpr": "File:Ground Penetrating Radar in use.jpg",
    "ids-ibis-radar-monitoring": "File:Precision Approach Radar antennas.jpg",
    "ids-mymo": "File:Ground Penetrating Radar in use.jpg",
    "senceive-wireless-monitoring-network": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
    "campbell-scientific-structural-monitoring": "File:GPS antenna and receiver Mount Blue Sky Colorado 23 August 2023.png",
}

# Same hardware family / stand-in (actual product photo where possible)
COPY_FROM: dict[str, str] = {
    "rugged-tablet-fc7": "panasonic-toughbook-40",
    "micasense-altum-pt": "dji-zenmuse-p1",
    "micasense-rededge-p": "dji-zenmuse-p1",
    "headwall-nano-hp": "dji-zenmuse-p1",
    "resonon-pika-ir-hyperspectral": "dji-zenmuse-p1",
    "geometrics-magarrow-uav": "dji-matrice-350-rtk",
    "bartington-gradiometer-system": "geometrics-magarrow-uav",
}


def commons_url(title: str) -> str:
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "url",
        }
    )
    url = "https://commons.wikimedia.org/w/api.php?" + q
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode())
    pages = data.get("query", {}).get("pages", {})
    for p in pages.values():
        ii = p.get("imageinfo")
        if ii:
            return ii[0]["url"]
    raise RuntimeError(f"No Commons URL for {title}")


def download_url(url: str, dest: str) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        body = r.read()
    tmp = dest + ".part"
    with open(tmp, "wb") as f:
        f.write(body)
    os.replace(tmp, dest)
    time.sleep(0.35)


def ensure_jpeg(path: str) -> None:
    if not os.path.isfile(path):
        return
    lower = path.lower()
    if lower.endswith((".jpg", ".jpeg")):
        return
    tmp = path + ".conv.jpg"
    subprocess.run(
        ["sips", "-s", "format", "jpeg", path, "--out", tmp],
        check=True,
        capture_output=True,
    )
    os.replace(tmp, path)


def main() -> int:
    if sys.platform != "darwin":
        print("This script expects macOS `sips` for PNG/WebP→JPEG.", file=sys.stderr)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(PRODUCTS_JSON, encoding="utf-8") as f:
        products = json.load(f)
    ids = [p["id"] for p in products]
    ok: set[str] = set()

    # 1) OEM / direct URLs
    for pid in ids:
        if pid not in SOURCES:
            continue
        out = os.path.join(OUT_DIR, f"{pid}.jpg")
        try:
            print(f"fetch {pid}")
            download_url(SOURCES[pid], out)
            ensure_jpeg(out)
            ok.add(pid)
        except Exception as e:
            print(f"  FAIL {pid}: {e}", file=sys.stderr)

    # 2) Wikimedia: one API lookup + one binary download per unique file title
    title_to_ids: dict[str, list[str]] = {}
    for pid, title in COMMONS.items():
        title_to_ids.setdefault(title, []).append(pid)

    title_to_path: dict[str, str] = {}
    for title in sorted(title_to_ids.keys()):
        tmp = os.path.join(
            OUT_DIR, "_commons_" + hashlib.md5(title.encode("utf-8")).hexdigest()[:14] + ".img"
        )
        try:
            time.sleep(0.5)
            img_url = commons_url(title)
            print(f"commons file {title}")
            download_url(img_url, tmp)
            ensure_jpeg(tmp)
            title_to_path[title] = tmp
        except Exception as e:
            print(f"  FAIL commons {title}: {e}", file=sys.stderr)

    for title, pids in title_to_ids.items():
        src = title_to_path.get(title)
        if not src or not os.path.isfile(src):
            continue
        for pid in pids:
            if pid in ok:
                continue
            dest = os.path.join(OUT_DIR, f"{pid}.jpg")
            shutil.copy2(src, dest)
            print(f"commons → {pid}")
            ok.add(pid)

    for p in os.listdir(OUT_DIR):
        if p.startswith("_commons_"):
            try:
                os.remove(os.path.join(OUT_DIR, p))
            except OSError:
                pass

    # 3) Copy-from (multispectral etc.)
    for dest, src in COPY_FROM.items():
        dpath = os.path.join(OUT_DIR, f"{dest}.jpg")
        spath = os.path.join(OUT_DIR, f"{src}.jpg")
        if dest in ok:
            continue
        if os.path.isfile(spath):
            shutil.copy2(spath, dpath)
            print(f"copy {dest} ← {src}")
            ok.add(dest)

    missing = [i for i in ids if i not in ok]
    if missing:
        print("Missing:", ", ".join(missing), file=sys.stderr)
        return 1
    print("OK —", len(ids), "files in", OUT_DIR)
    return 0


if __name__ == "__main__":
    sys.exit(main())
