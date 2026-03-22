#!/usr/bin/env bash
# Run from repo root: bash geosurveyhub/scripts/cloudflare-ci-deploy.sh
# Run with Root directory = geosurveyhub: bash scripts/cloudflare-ci-deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npx wrangler deploy
