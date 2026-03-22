#!/usr/bin/env bash
# Run from repo root: bash geosurveyhub/scripts/cloudflare-ci-build.sh
# Run with Root directory = geosurveyhub: bash scripts/cloudflare-ci-build.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
node scripts/inject-news-config.mjs
