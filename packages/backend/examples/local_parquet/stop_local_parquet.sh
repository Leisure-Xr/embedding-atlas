#!/usr/bin/env bash
set -euo pipefail

PORTS=(5055 5173)

usage() {
  cat <<'EOF'
Usage:
  packages/backend/examples/local_parquet/stop_local_parquet.sh [ports...]

Examples:
  packages/backend/examples/local_parquet/stop_local_parquet.sh
  packages/backend/examples/local_parquet/stop_local_parquet.sh 5055 5173
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -gt 0 ]]; then
  PORTS=("$@")
fi

for port in "${PORTS[@]}"; do
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    echo "Port $port: no listening process found."
    continue
  fi

  echo "Port $port: stopping process(es) $pids"
  kill $pids 2>/dev/null || true
done
