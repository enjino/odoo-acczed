#!/usr/bin/env bash
# acczed local run script — works on BOTH branches of the fork:
#   branch 19.0 (production parity) and branch 20.0 (the platform move, ACC-J02).
# Both run TWO processes:
#   1) odoo-bin            -> HTTP server on :8069 (threaded)
#   2) odoo-bin gevent     -> longpolling/evented server on :8072 (bus, live updates)
# Usage: bash run-odoo.sh [start|stop|status|logs]   (default: start)
#
# The venv is per platform: Odoo 20 wants Python 3.12-3.14 and its own requirements
# (odoo/release.py:39-40). Pick it with ODOO_VENV; the default is the 19 venv, so nothing
# changes for the branch production runs.
#   branch 19.0 -> ODOO_VENV=~/Desktop/Projects/odoo-acczed-venv/.venv      (default)
#   branch 20.0 -> ODOO_VENV=~/Desktop/Projects/odoo-acczed-venv20/.venv
set -euo pipefail

REPO="$HOME/Desktop/Projects/odoo-acczed"
VENV="${ODOO_VENV:-$HOME/Desktop/Projects/odoo-acczed-venv/.venv}"
CONF="$REPO/odoo.conf"
HTTP_PID="$REPO/logs/odoo-http.pid"
GEVENT_PID="$REPO/logs/odoo-gevent.pid"
LOGFILE="$REPO/logs/odoo.log"

mkdir -p "$REPO/logs"

is_running() { [ -f "$1" ] && kill -0 "$(cat "$1")" 2>/dev/null; }

# Is a TCP port accepting connections? Used to prove the gevent server is bound.
port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

# Readiness is proved by the ports, not by log strings alone (ACC-J03).
# Odoo 19 logs "HTTP service (werkzeug) running on ..." and "Evented Service (longpolling) running on ...".
# Odoo 20 dropped the "(werkzeug)" and DELETED the longpolling announcement — its GeventServer still
# binds config['gevent_port'], it just never says so. Waiting on log strings alone therefore spins the
# full 45 s on 20 and reports a false negative while both servers are up. Accept both spellings, and
# fall back to probing :8072 directly. The grep reads the log's tail only: the log is appended across
# runs, so a whole-file match would be satisfied by a previous run's line.
wait_ready() {
  local http_ok=0 gevent_ok=0 i
  for i in $(seq 1 45); do
    if [ "$http_ok" = 0 ] && tail -n 200 "$LOGFILE" 2>/dev/null | grep -qE "HTTP service (\(werkzeug\) )?running on"; then
      http_ok=1
    fi
    if [ "$gevent_ok" = 0 ] && { tail -n 200 "$LOGFILE" 2>/dev/null | grep -q "Evented Service (longpolling) running on" || port_open 8072; }; then
      gevent_ok=1
    fi
    if [ "$http_ok" = 1 ] && [ "$gevent_ok" = 1 ]; then
      echo "Ready after ${i}s (http :8069, longpolling :8072)."
      return 0
    fi
    sleep 1
  done
  echo "Not confirmed ready yet (http=$http_ok gevent=$gevent_ok) — tail the log: tail -20 $LOGFILE"
  return 1
}

start() {
  echo "venv: $VENV"
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
  wait_ready
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
