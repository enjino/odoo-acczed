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

---

## `verify-rtl.sh` — the RTL harness (ACC-E02 / ACC-E03)

```bash
bash tools/verify-rtl.sh            # every seam
bash tools/verify-rtl.sh --check 1  # one seam
```

Asserts that an Arabic-language user really gets a right-to-left session, at the four seams agreed for
phase E. Exit 1 if anything fails, so it can gate a commit. Every assertion has a **negative control**
(a case that must come out the other way) — without one, a check that always passes proves nothing.

| Seam | What it observes | Why it is the right seam |
|---|---|---|
| 1 | `/web/webclient/translations` → `lang_parameters.direction` | The endpoint whose value drives `o_rtl` client-side. Also proves the language is *active*: `webclient.py:59-60` drops any non-active `lang` to `None`. |
| 2+3 | Browser: portal `<html dir>`, backend `document.body.o_rtl` | `o_rtl` is added by JS after mount (`start.js:46`) and appears in **no** server response — only a browser can see it. |
| 4 | `res.lang` active flag + direction | Fastest pre-flight; asserts the row, not the behaviour. |

## `rtl-browser-check.js` — the browser half

```bash
ACCZED_LOGIN=arabic_test ACCZED_PASSWORD=arabic_test node tools/rtl-browser-check.js --expect rtl
node tools/rtl-browser-check.js --expect ltr      # negative control, as admin
```

Logs in the way `shot.js` does, then reads the live DOM on `/odoo` and `/my/home`. `--expect` makes the
same code check both directions, so one script proves the Arabic user is RTL *and* that an English user
is not.

### The four ACC-E03 layout seams

`direction: rtl` alone only reorders inline text — it does not prove the page *mirrors*. These read real
geometry from a real browser, and each is written so the LTR and RTL expectations are **opposite**,
which is what makes the pair falsifiable:

| Seam | Measured as | LTR | RTL |
|---|---|---|---|
| chrome sides | `.o_menu_systray` / `.o_navbar_apps_menu` horizontal half | systray right, apps left | **reversed** |
| list order | first 3 `.o_data_cell` centres monotonic | increasing | **decreasing** |
| kanban order | first 3 `.o_kanban_record` centres monotonic | increasing | **decreasing** |
| form sides | `.o_form_label` vs `.o_field_widget` | label left of field | **label right of field** |

Two deliberate choices: sides are asserted **by half (`x < W/2`), not by pixel**, so a change in Arabic
text length cannot break it; and sibling order is asserted as **monotonicity**, so a layout that merely
shifted everything sideways would not satisfy it.

## `i18n-coverage.py` — do the strings we authored have Arabic?

```bash
python3 tools/i18n-coverage.py /tmp/x.pot /tmp/x.po   # exit 1 if any term is untranslated
python3 tools/i18n-coverage.py --selftest             # proves the check can fail
```

Called by `verify-rtl.sh --check 5`. Odoo ships Arabic for its own labels; anything `acczed_theme`
invents is ours. Without this an authored string silently stays English inside an otherwise-Arabic
screen and **nothing fails** — which is why CONVENTIONS §8's Arabic check needed a mechanism rather
than a reminder.

The term list comes from Odoo's own extractor (`i18n export -l pot`), not a grep of ours, so its
definition of "translatable" cannot drift from Odoo's.

> **It reports `VACUOUS`, not `PASS`, when a module authors no strings** (which is `acczed_theme`'s
> state today — a 0-byte POT). An empty module must not read as a green tick.

`--selftest` runs 7 hand-written fixtures, three of which expect failure (untranslated term, partial
coverage, untranslated multi-line `msgid`). That is the point: a check that has never been seen to fail
is indistinguishable from one that cannot.

## `report-font-check.js` — reports must not fetch fonts from a third party

```bash
node tools/report-font-check.js          # exit 1 if any request leaves the instance
```

Called by `verify-rtl.sh --check 6`. Odoo's report bundle declares the Arabic face at
`https://fonts.odoocdn.com` (`addons/web/static/fonts/fonts.scss:27-36`). Printed PDFs are rendered
**server-side**, so an unreachable CDN means broken Arabic in a generated document — and for a product
sold as self-hosted, a third-party request at all is the wrong shape.

`acczed_theme` re-points the report font stack at a self-hosted family. The CDN `@font-face` stays
*declared* in the bundle, so **this cannot be checked by grepping the CSS for the URL** — it is about
*use*, not presence. The tool therefore logs in, loads a report, renders Arabic through the report's own
stack, and counts requests that leave the origin.

> **Do not try to fix this with an appended `@font-face`.** Measured in Chromium three times: with a
> second declaration of the same family, weight and unicode-range, the browser fetches **both**
> sources. Odoo's declaration cannot be out-voted — only left unreferenced.

> **Do not delete `fonts.scss` from the bundle either.** Report bodies use `'Lato'`
> (`…/reports/report.scss:16`), so removing the file drops Lato from reports too.

## Four traps these tools exist to avoid

1. **`<html dir="rtl">` is not where RTL shows up in the backend.** Measured on a working install:
   `dir=null`, `body.o_rtl=true`. `webclient_templates.xml:18` renders `<html t-att="html_data or {}">`
   and every `html_data` sets only `style`. Only the portal sets `dir` on `<html>`
   (`portal_templates.xml:5`). ACC-E03 originally expected the wrong thing.
2. **The portal's server-rendered `dir` is still not curl-checkable.** It reads `request.env.lang`, and
   a curl session that never runs the webclient's `session_info` RPC keeps a stale `en_US` context —
   measured `dir=ltr` by curl for a user a browser rendered `dir=rtl`. Check it in a browser.
3. **`grep rtlcss logs/odoo.log` proves nothing.** Odoo logs rtlcss **only on failure**
   (`assetsbundle.py:665-674`). A working install produced 0 matching lines. To prove mirroring, compare
   the served LTR and RTL bundles' directional property counts.
4. **After activating a language, restart the service.** `_get_active_by` caches with
   `cache='stable'` (`res_lang.py:315-316`), so a separate process's activation does not reach a
   running server — SQL says active while the server still answers `lang=null`.
