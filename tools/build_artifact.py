"""Đóng gói ứng dụng thành 1 file HTML (CSS/JS nội tuyến) để xem trước trên claude.ai.

    python3 tools/build_artifact.py <đường-dẫn-file-ra.html>
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "pv-handover.html"

html = (ROOT / "index.html").read_text(encoding="utf-8")
head = html[html.index("<!--ARTIFACT-HEAD-START-->") + 26 : html.index("<!--ARTIFACT-HEAD-END-->")].strip()
fonts = "\n".join(re.findall(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts[^>]*>', html))
body = html[html.index("<body>") + 6 : html.index("</body>")]

css = (ROOT / "css/app.css").read_text(encoding="utf-8")
body = body.replace('<script src="js/checklist.js"></script>', "<script>window.__ARTIFACT__=true;</script>\n<script src=\"js/checklist.js\"></script>")
for src in re.findall(r'<script src="(js/[^"]+)"></script>', body):
    js = (ROOT / src).read_text(encoding="utf-8")
    body = body.replace(f'<script src="{src}"></script>', f"<script>\n{js}\n</script>")

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(f"{head}\n{fonts}\n<style>\n{css}\n</style>\n{body.strip()}\n", encoding="utf-8")
print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")
