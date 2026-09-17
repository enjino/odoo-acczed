# Evidence — before / after

Every screenshot and recorded command output that proves a task belongs here. Names are fixed so the pairs
line up across phases; never use `screenshot1.png`.

| Before | After | Task(s) |
|---|---|---|
| `before-login.png` | `after-login.png` | ACC-A02 → ACC-D02 |
| `before-login-prod.png` | `after-c06-login-prod.png` | ACC-A04 → ACC-C06 |
| `before-backend-home.png` | `after-c01-backend-home.png` | ACC-A03 → ACC-C01 — **withdrawn 2026-09-17**: the phase-C theme was reverted; kept as the record of what was removed |
| `before-backend-list.png` | `after-c03-chrome-list.png` | ACC-A03 → ACC-C03 — **withdrawn 2026-09-17** (name corrected: the file on disk is `after-c03-chrome-list.png`) |
| — | `after-b05-backend-home.png`, `after-b05-backend-list.png` | ACC-B06 (negative control: must be identical to the `before-*` pair) |
| `after-c01-backend-home.png` (themed) | `after-c-revert-backend-home.png` (stock Odoo) | ACC-C01…C04 → **reverted 2026-09-17** — the before/after pair of the removal itself |
| — | `after-c05-side-by-side.png` | ACC-C05 (site next to backend) |
| — | `after-backend-ar-list.png`, `after-backend-ar-form.png` | ACC-E03 |
| — | `after-token-sync-site.png`, `after-token-sync-odoo.png` | ACC-F03 |
| — | `i04-01` … `i04-09` (10 files — `07` ships two variants: annotated + density) | ACC-I04 — **the withdrawn rail design**: rail of sections + panel of apps, rendered 2026-09-15 morning. Kept as the record of what was reviewed and removed |
| — | `i04b-01` … `i04b-09` (9 files) | ACC-I04 — **current design, rail-less**: one sidebar (section headings → apps → inline trees) · today dataset · Settings tree · full install expanded · 1366px squeeze with chatter (172px) · RTL · desaturated · narrow · floating + measurements · 1920. From `mockups/acczed-shell-mockup.html?<state>` |

**Text evidence:** `evidence.log` — one line per check: `date | command | short output`.
Commands worth recording verbatim: `curl` titles and status codes, the `ir_module_module` queries, the
`res_lang` active/direction query, `rtlcss --version`, and `systemctl status` output on the droplet.

Screenshots are taken with the browser tooling, full page, no cropping (comparable pairs).
