# Evidence — before / after

Every screenshot and recorded command output that proves a task belongs here. Names are fixed so the pairs
line up across phases; never use `screenshot1.png`.

| Before | After | Task(s) |
|---|---|---|
| `before-login.png` | `after-login.png` | ACC-A02 → ACC-D02 |
| `before-login-prod.png` | `after-c06-login-prod.png` | ACC-A04 → ACC-C06 |
| `before-backend-home.png` | `after-c01-backend-home.png` | ACC-A03 → ACC-C01 |
| `before-backend-list.png` | `after-c03-backend-list.png` | ACC-A03 → ACC-C03 |
| — | `after-b05-backend-home.png`, `after-b05-backend-list.png` | ACC-B06 (negative control: must be identical to the `before-*` pair) |
| — | `after-c05-side-by-side.png` | ACC-C05 (site next to backend) |
| — | `after-backend-ar-list.png`, `after-backend-ar-form.png` | ACC-E03 |
| — | `after-token-sync-site.png`, `after-token-sync-odoo.png` | ACC-F03 |

**Text evidence:** `evidence.log` — one line per check: `date | command | short output`.
Commands worth recording verbatim: `curl` titles and status codes, the `ir_module_module` queries, the
`res_lang` active/direction query, `rtlcss --version`, and `systemctl status` output on the droplet.

Screenshots are taken with the browser tooling, full page, no cropping (comparable pairs).
