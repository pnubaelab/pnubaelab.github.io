#!/bin/bash
# Run pre-build generators, then Jekyll build
set -euo pipefail

echo "[prebuild] Generating collaboration graph JSON..."
python3 generate_collabo_graph.py

echo "[prebuild] Generating publication counts..."
python3 generate_pub_count.py

echo "[build] Running Jekyll build..."
bundle exec jekyll build "$@"
