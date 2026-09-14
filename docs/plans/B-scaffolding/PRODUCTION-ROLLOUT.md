# Production rollout runbook — acczed-addons

Written by ACC-B07 (2026-09-14). **Nothing in this file has been executed against production.** It is
the script for ACC-C06, so that the first real deployment is mechanical rather than improvised.

## Target

| Thing | Path / value | Status |
|---|---|---|
| Droplet | `odoo-acczed` (46.101.146.87, user `root`) | verified — `~/.ssh/config`, SSH works (ACC-A04) |
| Repo | `/opt/odoo-acczed` | **from ACC-B07's task context, not independently verified** |
| venv | `/opt/odoo-acczed-venv` | as above |
| Config | `/opt/odoo-acczed/odoo.conf` | as above |
| Services | `odoo-http`, `odoo-gevent` (systemd, user `odoo`) | as above |
| TLS | Caddy → `backend.acczed.online` | verified (ACC-A04: HTTP/2 200, `via: 1.1 Caddy`) |
| DB | `acczed` in container `odoo-postgres` | verified (ACC-A04 read) |

> ⚠️ The four paths above marked "not independently verified" come from the task brief. **Confirm them
> on the droplet before step 1** — `ls -d /opt/odoo-acczed /opt/odoo-acczed-venv` and
> `systemctl status odoo-http` — rather than trusting this table.

---

## The rollout

### 1. Fetch the module repo

```bash
ssh odoo-acczed
sudo -u odoo git clone <acced-addons-remote> /opt/acczed-addons
# or, if it already exists:
sudo -u odoo git -C /opt/acczed-addons pull --ff-only
```

**Verify:** `ls /opt/acczed-addons/acczed_theme/__manifest__.py` exists and is owned by `odoo`
(`stat -c '%U' …`). If it is owned by root, module discovery still works but the next `pull` will fail.

### 2. Put the path first in addons_path

```bash
sudo cp /opt/odoo-acczed/odoo.conf /opt/odoo-acczed/odoo.conf.bak-$(date +%F)
sudoedit /opt/odoo-acczed/odoo.conf
```

Set (single line, comma separated, **no spaces** — a space silently breaks discovery):

```
addons_path = /opt/acczed-addons,/opt/odoo-acczed/addons,/opt/odoo-acczed/odoo/addons
```

Ours goes **first**, so a fork module of the same name cannot shadow a product module.

**Verify:** the backup exists, and the line has no spaces:
`grep '^addons_path' /opt/odoo-acczed/odoo.conf | grep -q ' ' && echo "SPACE — fix it"`

### 3. Ensure rtlcss is on the services' PATH (phase E)

```bash
# Must be visible to the *service user*, not just an interactive root shell — systemd does not
# inherit your login PATH.
sudo systemctl edit odoo-http     # and odoo-gevent
# add:
#   [Service]
#   Environment=PATH=/usr/local/bin:/usr/bin:/bin
```

**Verify:** `sudo -u odoo env PATH=/usr/local/bin:/usr/bin:/bin which rtlcss` prints a path.
Without this, Arabic asset mirroring fails *at runtime* while every other step looks green.

### 4. Install or upgrade the module

```bash
sudo -u odoo env -u PYTHONPATH /opt/odoo-acczed-venv/bin/python \
  /opt/odoo-acczed/odoo-bin -c /opt/odoo-acczed/odoo.conf -d acczed \
  -u acczed_theme --stop-after-init
```

`-u` (upgrade), not `-i` (install): on a re-run, `-i` is a no-op and will silently deploy nothing.
`env -u PYTHONPATH` is mandatory — the fork assumes it is unset.

**Verify:** exit code `0`, and the log ends with `Modules loaded.` plus `Registry loaded`. Any
`ERROR` line here means stop before step 5.

### 5. Restart the services

```bash
sudo systemctl restart odoo-http odoo-gevent
```

**Verify:** `systemctl is-active odoo-http odoo-gevent` prints `active` twice.

### 6. Confirm it serves

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://backend.acczed.online/web/login
```

**Verify:** `200`.

> On production the **unqualified** URL is correct — production has a database configured, so it does
> not redirect to the selector the way the local instance does. Do not "fix" a 200 here.

---

## Rollback

The module install is **additive and inert** — an empty module that installs no data. Rolling back is
therefore cheap:

```bash
# 1. remove our path from addons_path (restore the backup)
sudo cp /opt/odoo-acczed/odoo.conf.bak-<date> /opt/odoo-acczed/odoo.conf

# 2. restart
sudo systemctl restart odoo-http odoo-gevent
```

**Result:** the app returns to its pre-rollout behaviour. The `acczed_theme` row stays in
`ir_module_module` as `installed` but is simply no longer loaded — harmless, and it keeps its version
so a later re-add upgrades cleanly rather than reinstalling.

For a **phase C/D** rollout (real SCSS and view overrides), the same two steps still work, but the
consequence is larger: any *view* the module replaced reverts to upstream, and any asset bundle it
contributed is dropped. That is the intended blast radius — the module never edits fork files
(CONVENTIONS rule 3), so removing it cannot leave a half-edited fork behind.

```bash
# fuller rollback, if ever needed (uninstalls and drops the module's data):
sudo -u odoo env -u PYTHONPATH /opt/odoo-acczed-venv/bin/python \
  /opt/odoo-acczed/odoo-bin -c /opt/odoo-acczed/odoo.conf -d acczed \
  --stop-after-init -u base   # then uninstall acczed_theme from the Apps list
```

Prefer the addons_path rollback. Uninstalling is the heavier hammer and is rarely what you want.

---

## Gotchas from Phase A/B that apply in production

1. **`db_name = False` in `odoo.conf` is a no-op.** Odoo logs
   `option db_name reads 'False' … isn't a boolean option, skip`. If production's config carries the
   same line, it is not doing anything — the database resolves because production has *one* database,
   not because of that setting. Do not rely on it.
2. **`run-odoo.sh`-style readiness checks are unsound.** The local script greps the whole append-only
   log, so *historical* markers satisfy it and it reports ready even on a failed start. In production,
   trust `systemctl is-active` and the `curl` in step 6, never a log-line grep.
3. **Take before/after screenshots** (CONVENTIONS rule 5) — `before-login-prod.png` already exists from
   ACC-A04, so phase C's production deploy has its "before" side ready.
4. **Never screenshot with plain `google-chrome --headless --screenshot`** — it silently captures a
   blank page against Odoo. Use `tools/shot.js`.
5. **Production and local differ on the login page.** Production shows no Database field and no
   "Manage Databases" link (it runs with `list_db` off). Verify branding changes against the local
   instance, or a production-only check will look pre-passed.
