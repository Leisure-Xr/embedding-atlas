#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
BACKEND_DIR="$REPO_ROOT/packages/backend"

DATASET="wine"
TEXT_COLUMN=""
X_COLUMN="projection_x"
Y_COLUMN="projection_y"
NEIGHBORS_COLUMN="neighbors"
HOST="127.0.0.1"
BACKEND_PORT="5055"
FRONTEND_PORT="5173"

usage() {
  cat <<'EOF'
Usage:
  packages/backend/examples/local_parquet/start_local_parquet.sh [wine|medmcqa|/path/to/data.parquet] [options]

Options:
  --text COLUMN       Text column used for search and tooltips.
  --x COLUMN          Precomputed x coordinate column. Default: projection_x
  --y COLUMN          Precomputed y coordinate column. Default: projection_y
  --neighbors COLUMN  Precomputed nearest-neighbors column. Default: neighbors
  --host HOST         Host for local servers. Default: 127.0.0.1
  --frontend-port N   Viewer dev server port. Default: 5173
  -h, --help          Show this help.

Examples:
  packages/backend/examples/local_parquet/start_local_parquet.sh wine
  packages/backend/examples/local_parquet/start_local_parquet.sh medmcqa
  packages/backend/examples/local_parquet/start_local_parquet.sh /path/to/data.parquet \
    --text text --x projection_x --y projection_y --neighbors neighbors

Ports:
  Backend is fixed to 5055 because the viewer dev app reads
  http://localhost:5055/data/ in development mode.
  Viewer defaults to 5173 and can be changed with --frontend-port.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --text)
      TEXT_COLUMN="$2"
      shift 2
      ;;
    --x)
      X_COLUMN="$2"
      shift 2
      ;;
    --y)
      Y_COLUMN="$2"
      shift 2
      ;;
    --neighbors)
      NEIGHBORS_COLUMN="$2"
      shift 2
      ;;
    --host)
      HOST="$2"
      shift 2
      ;;
    --frontend-port)
      FRONTEND_PORT="$2"
      shift 2
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
    *)
      DATASET="$1"
      shift
      ;;
  esac
done

case "$DATASET" in
  wine|wine-reviews|wine_reviews)
    DATASET_PATH="$SCRIPT_DIR/wine_reviews_sample.parquet"
    TEXT_COLUMN="${TEXT_COLUMN:-description}"
    ;;
  medmcqa)
    DATASET_PATH="$SCRIPT_DIR/medmcqa_sample.parquet"
    TEXT_COLUMN="${TEXT_COLUMN:-question}"
    ;;
  *)
    DATASET_PATH="$DATASET"
    TEXT_COLUMN="${TEXT_COLUMN:-text}"
    ;;
esac

if [[ ! -f "$DATASET_PATH" ]]; then
  echo "Dataset not found: $DATASET_PATH" >&2
  exit 1
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required. Install it from https://docs.astral.sh/uv/." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js/npm first." >&2
  exit 1
fi

echo "Starting Embedding Atlas backend with:"
echo "  dataset:   $DATASET_PATH"
echo "  text:      $TEXT_COLUMN"
echo "  x/y:       $X_COLUMN / $Y_COLUMN"
echo "  neighbors: $NEIGHBORS_COLUMN"
echo
echo "Backend: http://$HOST:$BACKEND_PORT"
echo "Viewer:  http://$HOST:$FRONTEND_PORT"
echo

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

(
  cd "$BACKEND_DIR"
  uv run embedding-atlas "$DATASET_PATH" \
    --text "$TEXT_COLUMN" \
    --x "$X_COLUMN" \
    --y "$Y_COLUMN" \
    --neighbors "$NEIGHBORS_COLUMN" \
    --disable-projection \
    --cors \
    --host "$HOST" \
    --port "$BACKEND_PORT" \
    --no-auto-port \
    --static ../viewer
) &
BACKEND_PID=$!

sleep 3

cd "$REPO_ROOT"
npm run dev -w @embedding-atlas/viewer -- --host "$HOST" --port "$FRONTEND_PORT"
