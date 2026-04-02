#!/usr/bin/env python3
"""Regenerate sitemap.xml (index), sitemap-pages.xml, and sitemap-products.xml."""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

BASE = "https://www.geosurveyhub.com"
ROOT = Path(__file__).resolve().parents[1]

PAGES: list[tuple[str, str, str]] = [
    ("/", "1.0", "weekly"),
    ("/pages/guide.html", "0.9", "monthly"),
    ("/pages/catalog.html", "0.95", "weekly"),
    ("/pages/glossary.html", "0.9", "monthly"),
    ("/pages/dictionary.html", "0.85", "monthly"),
    ("/pages/photogrammetry.html", "0.85", "monthly"),
    ("/pages/ppk-rtk-network.html", "0.85", "monthly"),
    ("/pages/total-stations.html", "0.8", "monthly"),
    ("/pages/mobile-mapping-slam.html", "0.8", "monthly"),
    ("/pages/point-cloud-processing.html", "0.8", "monthly"),
    ("/pages/surveying-accuracy.html", "0.8", "monthly"),
    ("/pages/surveying-license-us.html", "0.75", "monthly"),
    ("/pages/about.html", "0.6", "yearly"),
    ("/pages/learn.html", "0.75", "monthly"),
    ("/pages/equipment.html", "0.75", "monthly"),
    ("/pages/practice.html", "0.72", "monthly"),
    ("/pages/business.html", "0.72", "monthly"),
    ("/pages/wallace-web-workers.html", "0.55", "monthly"),
    ("/pages/ai-ml.html", "0.9", "monthly"),
    ("/pages/start-a-surveying-company.html", "0.95", "monthly"),
    ("/pages/lidar.html", "0.8", "monthly"),
    ("/pages/drones.html", "0.8", "monthly"),
    ("/pages/gnss-rtk.html", "0.8", "monthly"),
    ("/pages/sensors.html", "0.7", "monthly"),
    ("/pages/computers.html", "0.7", "monthly"),
    ("/pages/trucks.html", "0.7", "monthly"),
    ("/pages/news.html", "0.8", "weekly"),
    ("/pages/financing.html", "0.7", "monthly"),
    ("/pages/product.html", "0.5", "monthly"),
]


def url_entry(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return f"""  <url>
    <loc>{loc}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>"""


def main() -> None:
    today = date.today().isoformat()
    products = json.loads((ROOT / "content/products.json").read_text(encoding="utf-8"))

    lines_pages = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for path, pri, cf in PAGES:
        lines_pages.append(url_entry(BASE + path, today, cf, pri))
    lines_pages.append("</urlset>")
    (ROOT / "sitemap-pages.xml").write_text("\n".join(lines_pages) + "\n", encoding="utf-8")

    lines_prod = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for p in products:
        pid = p.get("id")
        if not pid:
            continue
        loc = f"{BASE}/pages/product.html?id={pid}"
        lines_prod.append(url_entry(loc, today, "monthly", "0.65"))
    lines_prod.append("</urlset>")
    (ROOT / "sitemap-products.xml").write_text("\n".join(lines_prod) + "\n", encoding="utf-8")

    index_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>{BASE}/sitemap-pages.xml</loc>
    <lastmod>{today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>{BASE}/sitemap-products.xml</loc>
    <lastmod>{today}</lastmod>
  </sitemap>
</sitemapindex>
"""
    (ROOT / "sitemap.xml").write_text(index_xml, encoding="utf-8")
    print(f"Wrote sitemap index + {len(PAGES)} page URLs + {len(products)} product URLs.")


if __name__ == "__main__":
    main()
