#!/usr/bin/env bash
# Odoo 19.0 (fork enjino/odoo-acczed) — isolated local run script.
# Odoo 19 runs TWO processes:
#   1) odoo-bin            -> HTTP server on :8069 (threaded)
#   2) odoo-bin gevent     -> longpolling/evented server on :8072 (bus, live updates)
# Usage: bash run-odoo.sh [start|stop|status|logs]   (default: start)
set -euo pipefail

REPO="$HOME/Desktop/Projects/odoo-acczed"
VENV="$HOME/Desktop/Projects/odoo-acczed-venv/.venv"
CONF="$REPO/odoo.conf"
HTTP_PID="$REPO/logs/odoo-http.pid"
GEVENT_PID="$REPO/logs/odoo-gevent.pid"
LOGFILE="$REPO/logs/odoo.log"

mkdir -p "$REPO/logs"

is_running() { [ -f "$1" ] && kill -0 "$(cat "$1")" 2>/dev/null; }

start() {
  # PYTHONPATH is exported by Hermes; Odoo must NOT inherit it.
  if ! is_running "$HTTP_PID"; then
    env -u PYTHONPATH "$VENV/bin/python" "$REPO/odoo-bin" -c "$CONF" >> "$LOGFILE" 2>&1 &
    echo $! > "$HTTP_PID"
    echo "HTTP server starting (pid $!) -> http://localhost:8069"
  else
    echo "HTTP server already running (pid $(cat "$HTTP_PID"))."
  fi
  if ! is_running "$GEVENT_PID"; then
    env -u PYTHONPATH "$VENV/bin/python" "$REPO/odoo-bin" gevent -c "$CONF" >> "$LOGFILE" 2>&1 &
    echo $! > "$GEVENT_PID"
    echo "Longpolling server starting (pid $!) -> :8072"
  else
    echo "Longpolling server already running (pid $(cat "$GEVENT_PID"))."
  fi
  for i in $(seq 1 45); do
    if grep -q "HTTP service (werkzeug) running" "$LOGFILE" 2>/dev/null \
       && grep -q "Evented Service (longpolling) running" "$LOGFILE" 2>/dev/null; then
      echo "Ready after ${i}s."
      return 0
    fi
    sleep 1
  done
  echo "Not confirmed ready yet — tail the log: tail -20 $LOGFILE"
}

stop() {
  for pidfile in "$HTTP_PID" "$GEVENT_PID"; do
    if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
      kill "$(cat "$pidfile")" && echo "Stopped $(basename "$pidfile") (pid $(cat "$pidfile"))."
    fi
    rm -f "$pidfile"
  done
  pkill -f "odoo-bin gevent -c $CONF" 2>/dev/null || true
  pkill -f "odoo-bin -c $CONF" 2>/dev/null || true
  echo "Odoo stopped."
}

status() {
  if is_running "$HTTP_PID"; then
    echo "HTTP: running (pid $(cat "$HTTP_PID")) http://localhost:8069"
    curl -s -o /dev/null -w '  login page: HTTP %{http_code}\n' http://localhost:8069/web/login || true
  else
    echo "HTTP: not running"
  fi
  if is_running "$GEVENT_PID"; then
    echo "Longpolling: running (pid $(cat "$GEVENT_PID")) :8072"
  else
    echo "Longpolling: not running"
  fi
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  logs) tail -f "$LOGFILE" ;;
  *) echo "Usage: $0 [start|stop|status|logs]"; exit 1 ;;
esac
