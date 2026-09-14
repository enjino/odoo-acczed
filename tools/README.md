# tools/ — evidence capture

Helpers for producing the before/after screenshots that `docs/plans/CONVENTIONS.md` §7.5 requires for
every visual change.

## `shot.js` — screenshot an Odoo page

```bash
# public page (login)
node tools/shot.js "http://localhost:8069/web/login?db=acczed" \
  docs/plans/evidence/before-login.png --wait ".oe_login_form:not(.d-none)"

# authenticated backend page — logs in first, then navigates
node tools/shot.js "http://localhost:8069/odoo/apps" \
  docs/plans/evidence/before-backend-home.png --login --wait ".o_kanban_view"

node tools/shot.js "http://localhost:8069/odoo/action-base.action_res_users" \
  docs/plans/evidence/before-backend-list.png --login --wait ".o_list_view"

# production (public page, no login needed)
node tools/shot.js "https://backend.acczed.online/web/login" \
  docs/plans/evidence/before-login-prod.png --wait ".oe_login_form:not(.d-none)"
```

| Option | Meaning |
|---|---|
| `--wait <selector>` | Wait for this element to be **visible** before shooting. Always pass the thing you expect to see. |
| `--login` | Log in first (local instances only). |
| `--width` / `--height` | Viewport size, default 1600x1000. |
| `--settle <ms>` | Extra settle time after the wait, default 2500. |

Env: `ACCZED_LOGIN` / `ACCZED_PASSWORD` (default `admin`/`admin` — **local dev only**, never
production), `ACCZED_DB` (default `acczed`), `ACCZED_CHROMIUM` (override the browser binary).

Exits **1** and saves **nothing** if `--wait` never appears — a screenshot that silently records a
blank page is worse than no screenshot.

## Three traps this tool exists to avoid

1. **`google-chrome --headless --screenshot` does not work against Odoo.** The login form ships as
   `.oe_login_form.d-none` and is revealed by an OWL component, and the backend is a JS-rendered SPA.
   A plain headless capture records an empty card and still "succeeds". `--virtual-time-budget` does
   not fix it. Hence the mandatory `--wait`.
2. **Never use `networkidle`.** The authenticated webclient keeps the bus/longpolling connection
   open, so the network never goes idle; `waitUntil: 'networkidle'` hangs until timeout. The tool uses
   `domcontentloaded` plus an explicit selector wait.
3. **Log in at a db-pinned URL, not at the target.** An unauthenticated `/odoo/...` redirects to
   `/web/login` *without* `?db=`, which lands on the database selector (this instance sets
   `db_name = False` with `list_db = True`) — a page with no login form. `--login` therefore goes to
   `/web/login?db=acczed` first, then navigates to the target.

## Requirements

`playwright` must be resolvable — from `NODE_PATH`, or from a standard install on the machine. The
browser is Playwright's bundled Chromium; override with `ACCZED_CHROMIUM` if needed.

```bash
NODE_PATH=/path/to/node_modules node tools/shot.js ...
```

## Verifying a capture

A PNG existing proves nothing. Check the file size changes when the page changes, and open it. Two
captures of the same page should be near byte-identical — `before-backend-home.png` reproduces at
exactly 210110 bytes.
