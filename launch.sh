#!/usr/bin/env bash
# OpenClaw Launcher — starts the Next.js server and opens the dashboard
# in a standalone browser window (no browser chrome).
#
# Usage:  ./launch.sh [--telegram] [--no-browser]
#   --telegram   also start the Telegram bot (needs TELEGRAM_BOT_TOKEN)
#   --no-browser skip opening the browser window

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${OPENCLAW_PORT:-3000}"
URL="http://localhost:$PORT"
START_TELEGRAM=false
OPEN_BROWSER=true

for arg in "$@"; do
  case $arg in
    --telegram)    START_TELEGRAM=true ;;
    --no-browser)  OPEN_BROWSER=false ;;
  esac
done

# ─── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}${BOLD}  🦾 OpenClaw Mission Control          ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo

# ─── Check .env.local ─────────────────────────────────────────────────────────
if [[ ! -f "$SCRIPT_DIR/.env.local" ]]; then
  echo -e "${YELLOW}⚠  .env.local not found.${NC}"
  echo -e "   Create it from the example:"
  echo -e "   ${BOLD}cp .env.local.example .env.local${NC}"
  echo -e "   Then add your OPENROUTER_API_KEY."
  echo
fi

# ─── Build if .next doesn't exist ─────────────────────────────────────────────
if [[ ! -d "$SCRIPT_DIR/.next" ]]; then
  echo -e "${YELLOW}⚙  First run — building Next.js app…${NC}"
  cd "$SCRIPT_DIR" && npm run build
fi

# ─── Start server ─────────────────────────────────────────────────────────────
cd "$SCRIPT_DIR"

# Kill any existing instance on the port
if lsof -ti ":$PORT" &>/dev/null; then
  echo -e "${YELLOW}⚠  Port $PORT in use — killing old process…${NC}"
  lsof -ti ":$PORT" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo -e "${GREEN}▶ Starting OpenClaw server on port $PORT…${NC}"
NODE_ENV=production PORT="$PORT" npm run start &>/tmp/openclaw-server.log &
SERVER_PID=$!
echo "  Server PID: $SERVER_PID"

# Wait for server to be ready
echo -n "  Waiting for server"
for i in $(seq 1 30); do
  if curl -s "$URL/api/stream" --max-time 1 -o /dev/null 2>&1; then
    break
  fi
  echo -n "."
  sleep 1
done
echo -e " ${GREEN}ready!${NC}"

# ─── Start Telegram bot (optional) ───────────────────────────────────────────
if [[ "$START_TELEGRAM" == "true" ]]; then
  if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
    echo -e "${RED}✗  TELEGRAM_BOT_TOKEN not set — skipping Telegram bot.${NC}"
  else
    echo -e "${GREEN}▶ Starting Telegram bot…${NC}"
    npx ts-node "$SCRIPT_DIR/services/telegram-bot.ts" &>/tmp/openclaw-telegram.log &
    TELEGRAM_PID=$!
    echo "  Telegram bot PID: $TELEGRAM_PID"
  fi
fi

# ─── Open browser window ──────────────────────────────────────────────────────
if [[ "$OPEN_BROWSER" == "true" ]]; then
  echo -e "${GREEN}▶ Opening dashboard…${NC}"

  # Try Chromium-based browsers first (--app mode = no chrome)
  OPENED=false
  for browser in google-chrome chromium chromium-browser google-chrome-stable brave-browser; do
    if command -v "$browser" &>/dev/null; then
      "$browser" --app="$URL" --window-size=1400,900 &>/dev/null &
      OPENED=true
      echo "  Opened with $browser"
      break
    fi
  done

  # Fall back to xdg-open / macOS open
  if [[ "$OPENED" == "false" ]]; then
    if command -v xdg-open &>/dev/null; then
      xdg-open "$URL" &>/dev/null &
    elif command -v open &>/dev/null; then
      open "$URL"
    else
      echo -e "${YELLOW}  Could not find a browser. Open manually: $URL${NC}"
    fi
  fi
fi

echo
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Dashboard : ${BOLD}$URL${NC}"
echo -e "  Logs      : ${BOLD}tail -f /tmp/openclaw-server.log${NC}"
if [[ "$START_TELEGRAM" == "true" && -n "${TELEGRAM_BOT_TOKEN:-}" ]]; then
  echo -e "  Telegram  : ${BOLD}tail -f /tmp/openclaw-telegram.log${NC}"
fi
echo -e "  Stop      : ${BOLD}kill $SERVER_PID${NC} or press Ctrl+C"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Keep script alive and forward Ctrl+C to child processes
trap "echo; echo 'Shutting down…'; kill $SERVER_PID 2>/dev/null; exit 0" INT TERM
wait $SERVER_PID
