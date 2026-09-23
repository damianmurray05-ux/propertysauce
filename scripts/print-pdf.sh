#!/bin/sh
# Prints every .html in a folder to .pdf with headless Chrome. Usage: scripts/print-pdf.sh out/statements/<landlord>-<month>
set -e
DIR="$(cd "$1" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in "$DIR"/*.html; do
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="${TMPDIR:-/tmp}/chrome-ops10" --print-to-pdf="${f%.html}.pdf" "file://$f" >/dev/null 2>&1 || echo "failed: $f"
done
ls -la "$DIR"/*.pdf
