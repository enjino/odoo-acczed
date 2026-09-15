#!/usr/bin/env bash
# ACC-E02 / ACC-E03 — RTL verification harness.
#
# Asserts that an Arabic-language user actually gets a right-to-left session, at the seams that
# Odoo really exposes. Written for ACC-E02 and reused verbatim by ACC-E03.
#
#   bash tools/verify-rtl.sh            # run every check
#   bash tools/verify-rtl.sh --check 1  # run one seam
#
# Seams (agreed 2026-09-15):
#   1. /web/webclient/translations  — the HTTP endpoint whose `direction` drives o_rtl client-side
#   2. portal <html dir="rtl">      — server-rendered direction, the only place <html> carries dir
#   3. backend webclient in a browser — the ONLY way to observe o_rtl (added by JS at start.js:46)
#   4. res.lang active flag         — the config row itself, fastest pre-flight
#
# Exit 1 if any check fails, so it can gate a commit.

set -uo pipefail

BASE="${ACCZED_BASE:-http://localhost:8069}"
DB="${ACCZED_DB:-acczed}"
EN_LOGIN="${ACCZED_LOGIN:-admin}"
EN_PASSWORD="${ACCZED_PASSWORD:-admin}"
AR_LOGIN="${ACCZED_AR_LOGIN:-arabic_test}"
AR_PASSWORD="${ACCZED_AR_PASSWORD:-arabic_test}"
ONLY="${2:-}"

# For seam 5 (i18n coverage), which shells out to odoo-bin.
REPO="${ACCZED_REPO:-$HOME/Desktop/Projects/odoo-acczed}"
VENV="${ACCZED_VENV:-$HOME/Desktop/Projects/odoo-acczed-venv/.venv}"
CONF="${ACCZED_CONF:-$REPO/odoo.conf}"
MODULE="${ACCZED_MODULE:-acczed_theme}"
HERE="$(cd "$(dirname "$0")" && pwd)"

PASS=0; FAIL=0
ok()  { printf '  \033[32mPASS\033[0m  %s\n' "$1"; PASS=$((PASS+1)); }
no()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAIL=$((FAIL+1)); }
say() { printf '\n\033[1m%s\033[0m\n' "$1"; }

want() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }

# --- helpers -----------------------------------------------------------------------------------

# login <login> <password> <jar>  -> 0 on success
#
# -L is required: GET /web/login?db=<db> 302s *to itself* to plant the `db` cookie in the session,
# and only the second hop renders the form (and therefore the csrf token). Without -L the body is
# empty, the token extracts as empty, and the POST below fails with a confusing 400/303.
login() {
  local l="$1" p="$2" jar="$3"
  rm -f "$jar"
  local csrf
  csrf=$(curl -sL -c "$jar" -b "$jar" "$BASE/web/login?db=$DB" \
         | grep -o '<input[^>]*csrf_token[^>]*>' | sed 's/.*value="\([^"]*\)".*/\1/' | head -1)
  [ -n "$csrf" ] || return 1
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -c "$jar" -b "$jar" \
         --data-urlencode "login=$l" --data-urlencode "password=$p" \
         --data-urlencode "csrf_token=$csrf" --data-urlencode "db=$DB" \
         "$BASE/web/login?db=$DB")
  [ "$code" = "303" ]
}

psql_q() { docker exec odoo-postgres psql -U odoo -d "$DB" -tAc "$1" 2>/dev/null; }

# --- seam 1: /web/webclient/translations --------------------------------------------------------

lang_probe() {
  # lang_probe <jar> <lang|-> -> "<activated-lang> <direction>"
  local jar="$1" lang="$2" url="$BASE/web/webclient/translations"
  [ "$lang" != "-" ] && url="$url?lang=$lang"
  curl -s -c "$jar" -b "$jar" "$url" | python3 -c "
import json,sys
try:
    d = json.load(sys.stdin)
    lp = d.get('lang_parameters') or {}
    print(d.get('lang') or 'null', lp.get('direction') or 'falsy')
except Exception as e:
    print('parse-error', e)
"
}

seam1() {
  say "Seam 1 — /web/webclient/translations (drives o_rtl client-side)"
  local jar="/tmp/acczed-verify-en.txt"

  if ! login "$EN_LOGIN" "$EN_PASSWORD" "$jar"; then
    no "cannot log in as '$EN_LOGIN' — stack down or wrong ACCZED_PASSWORD"
    return
  fi

  # 1a. Odoo refuses any language that is not active: webclient.py:59-60 drops an unknown/inactive
  #     `lang` to None and silently falls back. So this asserts the activation itself, not the user.
  local got dir
  read -r got dir < <(lang_probe "$jar" ar_001)
  if [ "$got" = "ar_001" ] && [ "$dir" = "rtl" ]; then
    ok "ar_001 accepted by the endpoint and direction = rtl"
  elif [ "$got" = "null" ]; then
    no "ar_001 rejected (lang=null, direction=$dir) — not an active language (ACC-E02 step 1)"
  else
    no "ar_001 activated but direction = $dir — expected rtl (check res_lang.direction)"
  fi

  # 1b. The dedicated Arabic user must default to rtl with NO lang param — i.e. their stored
  #     preference, not a per-request override. This is what ACC-E02 step 3 actually buys, and what
  #     ACC-E03 will screenshot.
  local arjar="/tmp/acczed-verify-ar.txt"
  if ! login "$AR_LOGIN" "$AR_PASSWORD" "$arjar"; then
    no "cannot log in as '$AR_LOGIN' — user missing (ACC-E02 step 3)"
    return
  fi
  read -r got dir < <(lang_probe "$arjar" -)
  [ "$dir" = "rtl" ] && ok "'$AR_LOGIN' defaults to direction = rtl (lang $got)" \
                     || no "'$AR_LOGIN' defaults to direction = $dir — expected rtl (res.users lang)"
}

# --- seam 2+3: the browser (portal dir + backend o_rtl) ------------------------------------------
#
# The portal's `<html dir>` is server-rendered (portal_templates.xml:5) so it *looks* curl-checkable —
# but it is not: the value comes from request.env.lang, and a curl session that never runs the
# webclient's session_info RPC keeps a stale `en_US` context and reports ltr for an Arabic user.
# Measured 2026-09-15: curl said dir=ltr while a real browser said dir=rtl for the same user. So the
# portal seam is checked HERE, in the browser, where it is authoritative — not with a second curl.

seam_browser() {
  say "Seams 2+3 — browser: portal <html dir> and backend body.o_rtl"
  local script="$(dirname "$0")/rtl-browser-check.js"

  if ACCZED_LOGIN="$AR_LOGIN" ACCZED_PASSWORD="$AR_PASSWORD" \
       node "$script" --expect rtl --base "$BASE" >/tmp/rtl-ar.out 2>&1; then
    ok "arabic: $(grep -E '^portal|^chrome' /tmp/rtl-ar.out | tr '\n' ' ')"
    ok "arabic layout: $(grep -E '^list|^kanban|^form' /tmp/rtl-ar.out | tr '\n' ' ')"
  else
    no "arabic user is not RTL in a browser — $(tail -1 /tmp/rtl-ar.out)"
  fi

  # Negative control. Without it a check that always passes proves nothing; this also catches a
  # theme that forces RTL for everyone.
  if ACCZED_LOGIN="$EN_LOGIN" ACCZED_PASSWORD="$EN_PASSWORD" \
       node "$script" --expect ltr --base "$BASE" >/tmp/rtl-en.out 2>&1; then
    ok "english control: $(grep -E '^portal|^chrome' /tmp/rtl-en.out | tr '\n' ' ')"
    ok "english layout: $(grep -E '^list|^kanban|^form' /tmp/rtl-en.out | tr '\n' ' ')"
  else
    no "english control is RTL — RTL is being forced on everyone — $(tail -1 /tmp/rtl-en.out)"
  fi
}

# --- seam 4: res.lang pre-flight -----------------------------------------------------------------

seam_config() {
  say "Seam 4 — res.lang configuration (the row, not the behaviour)"
  local row
  row=$(psql_q "select active from res_lang where code='ar_001'")
  case "$row" in
    t) ok "ar_001 is active" ;;
    f|"") no "ar_001 is not active (got '$row') — ACC-E02 step 1" ;;
    *) no "unexpected ar_001 active value: '$row'" ;;
  esac

  # Negative control: a language we did NOT activate must still read inactive, or the query above
  # is not actually discriminating.
  row=$(psql_q "select active from res_lang where code='ar_SY'")
  case "$row" in
    t) no "ar_SY is active but was never activated — query not discriminating" ;;
    *) ok "control: ar_SY remains inactive (got '${row:-null}')" ;;
  esac

  local dir
  dir=$(psql_q "select direction from res_lang where code='ar_001'")
  [ "$dir" = "rtl" ] && ok "ar_001 direction = rtl" || no "ar_001 direction = '$dir'"
}

# --- seam 5: do the strings WE authored carry an Arabic translation? ------------------------------
#
# Odoo ships Arabic for its own labels; anything acczed_theme invents is ours to translate. The term
# list comes from Odoo's own extractor (`i18n export -l pot`) rather than a grep of ours, so "what
# counts as a translatable string" is Odoo's definition and cannot drift from it.

seam_i18n() {
  say "Seam 5 — authored strings carry an Arabic translation (ACC-E04)"
  local pot=/tmp/acczed-i18n.pot po=/tmp/acczed-i18n-ar.po
  rm -f "$pot" "$po"

  local odoo=("$VENV/bin/python" "$REPO/odoo-bin" i18n export -c "$CONF" -d "$DB")
  if ! env -u PYTHONPATH "${odoo[@]}" -l pot -o "$pot" "$MODULE" >/tmp/acczed-i18n-exp.log 2>&1; then
    no "i18n export failed — $(tail -1 /tmp/acczed-i18n-exp.log)"
    return
  fi
  # Exporting the language may produce nothing at all when the template is empty; the checker wants
  # a readable file either way.
  env -u PYTHONPATH "${odoo[@]}" -l ar -o "$po" "$MODULE" >/dev/null 2>&1
  [ -f "$po" ] || : > "$po"

  local out rc=0
  out=$(python3 "$HERE/i18n-coverage.py" "$pot" "$po") || rc=$?
  case "$rc" in
    0) if printf '%s' "$out" | grep -q VACUOUS; then
         ok "0 authored terms — nothing to translate yet (vacuous, not a pass)"
       else
         ok "$(printf '%s' "$out" | sed 's/^  PASS     //')"
       fi ;;
    1) no "$(printf '%s' "$out" | sed 's/^  FAIL     //' | tr '\n' ' ')" ;;
    *) no "i18n-coverage.py failed: $out" ;;
  esac
}

# --- report --------------------------------------------------------------------------------------

say "ACC-E02/E03/E04 verification — $BASE (db $DB)"
want 1 && seam1
want 2 && seam_browser
want 4 && seam_config
want 5 && seam_i18n

printf '\n\033[1m%d passed, %d failed\033[0m\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
