# Odoo Enterprise Feature Matrix — acczed Implementation Roadmap

- **Odoo version:** 19.0 (fork: enjino/odoo-acczed, Community)
- **Date:** 2026-08-29
- **Status:** Research complete — feature inventory + implementation paths
- **Sources:** odoo.com/page/editions (official comparison), odoo.com/app/*-features pages,
  odoo.com/documentation/19.0 (official docs), GitHub API (OCA branch check),
  local verification: the acczed DB's `ir_module_module` (23 enterprise modules marked
  `uninstallable` by the Community build). All research done via the Camofox browser.

---

## How to read this document

Every app below is **Enterprise-only** unless marked otherwise. For each app:

- **What it does** — one-paragraph summary.
- **Features** — the concrete feature inventory (from Odoo's own pages/docs).
- **Keystone** — the core model/record that "starts everything else" in that app
  (the thing to build first if implementing from scratch).
- **Implement via** — the realistic paths to get this on Community:
  - `SUBSCRIPTION` — Odoo Enterprise subscription (all apps, per-user/month)
  - `OCA` — free OCA module with a 19.0 branch (verified 2026-08-29)
  - `CUSTOM` — build it as a module in this fork
  - `PARTIAL` — some features exist in Community already; only the listed extras are missing

---

## Summary table

| # | App | Category | OCA 19.0 alt | Build effort (custom) | Suggested priority |
|---|-----|----------|--------------|----------------------|--------------------|
| 1 | Accounting (full) | Finance | — | XL | P0 |
| 2 | Payroll | Finance | OCA/payroll | L | P0 |
| 3 | Documents | Productivity | OCA/knowledge (partial) | M | P1 |
| 4 | Sign | Finance | — | M | P1 |
| 5 | ESG | Finance | — | L | P3 |
| 6 | Subscriptions | Sales | — | M | P2 |
| 7 | Rental | Sales | — | M | P3 |
| 8 | Amazon Connector | Sales | — | M | P3 |
| 9 | PLM | Supply Chain | — | L | P3 |
| 10 | Quality | Supply Chain | — | M | P2 |
| 11 | Referrals | HR | — | S | P3 |
| 12 | Appraisals | HR | OCA/hr (check) | S | P2 |
| 13 | Social Marketing | Marketing | OCA/social | M | P2 |
| 14 | Marketing Automation | Marketing | — | L | P2 |
| 15 | Field Service | Services | OCA/field-service | M | P3 |
| 16 | Helpdesk | Services | OCA/helpdesk | M | P2 |
| 17 | Planning | Services | — | L | P3 |
| 18 | Appointments | Services | — | M | P2 |
| 19 | Approvals | Productivity | — | M | P1 |
| 20 | VoIP ("Phone" in 19) | Productivity | — | L | P3 |
| 21 | IoT | Productivity | OCA/iot | M | P3 |
| 22 | Knowledge | Productivity | OCA/knowledge | M | P1 |
| 23 | Studio | Customization | — (OCA/web partial) | XL | P2 |
| 24 | Mobile apps | Platform | — | XL | P2 |

Effort = honest estimate for a custom module build in this fork (S < 1 wk, M ≈ 1–3 wk, L ≈ 1–2 mo, XL = 3+ mo).
Priorities are SUGGESTIONS based on the acczed direction (Saudi accounting); adjust freely.

---

# PART A — ENTERPRISE-ONLY APPS

## 1. Accounting (full) — Finance — P0
**What:** The complete double-entry accounting app. Community has only the Invoicing
engine; Enterprise adds the professional accounting layer on top.
**Features:**
- General ledger, journal items, bank statement reconciliation (smart matching, ~95% auto)
- Analytic accounting: multiple plans, sub-plans, distributions, hierarchies, mass edit
- Vendor bill OCR (AI digitization from PDF/image)
- Budgets (financial + analytic) with variance reporting
- Check writing (batch checks with suggestions)
- Multi-company consolidation + intercompany rules (one subscription, all subsidiaries)
- Country fiscal localizations (chart of accounts, taxes, legal statements per country)
- Assets management: depreciation boards, automatic amortization entries
- Deferred revenue/expense recognition (multi-year contracts, cut-off, mass edition)
- Tax: advanced engine (grid, tax-on-tax, partial exemptions), tax reports (accrual/cash),
  tax audit report, cash-basis reporting, invoicing-switch threshold
- Bank feeds automation (sync from institutions), SEPA direct debit/credit, batch payments
- AvaTax integration (US/CA/BR)
**Keystone:** `account.move` (journal entries) + `account.journal`. Everything in the app
is an entry flow into these. Community already has both — the gap is the *layer* on top.
**Implement via:** `SUBSCRIPTION` (this is Odoo's flagship paid app — no OCA equivalent).
For acczed: the Saudi localization (l10n_sa) + ZATCA e-invoicing already exist in
Community; the missing pieces are OCR, bank feeds, consolidation, budgets, assets, SEPA.
Each of those is a buildable module (OCR → external API; bank feeds → OFX/CSV import
already partly in Community; consolidation → custom).

## 2. Payroll — Finance — P0
**What:** Salary computation: contracts, salary structures/rules, payslips, pay runs.
**Features:**
- Contracts & salaries (contract types, wage, benefits)
- Work entries (from hr_work_entry/attendance/time off) feeding gross computation
- Salary structures with rules (allowances, deductions, tax brackets, overtime)
- Payslips + pay runs (batches), commissions
- Payroll SEPA payments (direct deposit)
- Payslip reimbursements (from Expenses OCR)
- Time-off-to-pay integration
- Reports: payroll analysis, headcount, work-entry analysis
- Country localizations (rules per country); Saudi labor rules (GOSI, end-of-service) NOT
  in any public module — custom build or partner
**Keystone:** `hr.payslip` + `hr.salary.rule`. Rules engine evaluates structures per
employee/period — the "what starts everything" is the salary rule evaluation.
**Implement via:** `OCA` (github.com/OCA/payroll, 19.0 branch verified) → install
`payroll` + build Saudi rules (l10n_sa_hr_payroll does not exist publicly — verified).
**Note:** requires the HR modules already in this fork (hr, hr_work_entry, hr_holidays).

## 3. Documents — Productivity — P1
**What:** Central file hub with OCR, folder automation, spreadsheet/sign integration.
**Features:**
- Document storage: All/Recent/Trash views, folders (Company/My Drive), tags, search
- File operations: upload, download (.zip), rename, share w/ access rights, move to trash
- Automations: rules that act on documents (auto-tag, auto-folder, OCR, send, sign)
- OCR digitalization of incoming documents
- Spreadsheet integration (export/insert folders into spreadsheets)
- Sign integration (send a document for signature)
**Keystone:** `documents.document` + `documents.folder`; the automations engine.
**Implement via:** `OCA`/`CUSTOM` — OCA/knowledge covers part of the document management
space (19.0 verified) but not the full Documents app; OCR automation is a buildable
service (the user already runs an OCR stack — Label Studio).

## 4. Sign — Finance — P1
**What:** E-signature workflows on PDFs.
**Features:**
- Drag-and-drop signature fields (sign, initial, date, checkbox, text) onto PDFs
- Send for signature to one or many signers, from Sign or from any Odoo record
- Auto-complete fields populated from the database during signing
- Signature requests lifecycle (pending → signed), resend, reminder
**Keystone:** `sign.request` + `sign.item` (field definitions on the document).
**Implement via:** `SUBSCRIPTION` or `CUSTOM` (PDF form fields + a signing endpoint;
legally-binding e-signature for KSA needs a certified provider — worth checking
local providers like Nafath/ABS integration before building).

## 5. ESG — Finance — P3
**What:** Environmental/Social/Governance reporting — carbon footprint tracking.
**Features:**
- Carbon footprint: activity data × emission factors → kgCO2e
- Data sources: Accounting (fixed assets, expenses, cost of revenue), Fleet, manual inputs
- Employee commuting emissions (from Fleet + Employees: days × distance × 2 × CO2/vehicle)
- Reduction-action tracking, monitoring/refinement of sustainability strategy
**Keystone:** ESG activity records + emission factor catalog.
**Implement via:** `CUSTOM` (a small module: emission factors + activity models + reports;
Saudi ESG reporting is nascent — low demand signal).

## 6. Subscriptions — Sales — P2
**What:** Recurring billing (plans, renewals, upsells).
**Features:**
- Recurring plans (billing period, pricing) — sales orders with a plan become subscriptions
- Renewal flow: renew, upsell (same SO), close
- Self-service customer portal (portal users manage own subscriptions)
- eCommerce integration (subscription products on the store)
- Smart buttons from products/customers
**Keystone:** `sale.subscription` (a SO with a recurring plan) + `sale.subscription.plan`.
**Implement via:** `CUSTOM` (recurring plan on sale.order + cron-driven invoice
generation — a well-understood pattern; ~2 wk).

## 7. Rental — Sales — P3
**What:** Rental of products (physical + service) with pricing periods.
**Features:**
- Rental products (physical/service), rental pricing per period (1 day/3 days/1 week...)
- Pricelist integration (custom rental price per pricelist)
- Rental orders: reservations, price computing (cheapest line), deposits (refundable)
- Integration with Inventory (pickup/pack/shipping/return) and Sales
**Keystone:** `sale.rental` (rental order = SO with rental lines) + product rental pricing.
**Implement via:** `CUSTOM` (rental product type on product.template + rental lines in SO;
medium complexity — return flow is the tricky part).

## 8. Amazon Connector — Sales — P3
**What:** Sell on Amazon (FBA + FBM) from Odoo.
**Features:**
- Order sync: shipped/cancelled (FBA), unshipped/cancelled (FBM)
- Product sync: name/description/quantity, shipping cost, gift wrapping charges
- Stock sync Odoo→Amazon (FBM quantities), FBA stock via virtual location
- Shipment notification to Amazon (FBM) to get paid
- Regions: North America (amazon.ca/.com/.com.mx), Europe, etc.
**Keystone:** Amazon API credentials + `sale.order` mapping via Amazon order refs.
**Implement via:** `CUSTOM` (REST/MWS API client + webhooks; marketplace auth is the
bulk of the work). Only relevant if acczed customers sell on Amazon.

## 9. PLM — Supply Chain — P3
**What:** Product Lifecycle Management — engineering change control on BOMs.
**Features:**
- Engineering change orders (ECOs), ECO types and stages (draft → in progress → done)
- Change management: proposed changes reviewed with approvals by stakeholders
- Version control of BOMs/products
- Project management integration
**Keystone:** `mrp.eco` (engineering change order) + ECO type/stage model.
**Implement via:** `CUSTOM` (ECO model with states + BOM versioning on mrp.bom; L effort).
Relevant only if acczed clients manufacture.

## 10. Quality — Supply Chain — P2
**What:** Quality control in manufacturing and inventory flows.
**Features:**
- Quality control points (automate check creation at intervals/operations)
- Quality checks: pass/fail, measure, take-a-picture, instructions-based
- Quality alerts (defects found → corrective/preventive actions)
- Quality teams (unlimited, per-team workflows)
- Failure locations & check types
**Keystone:** `quality.check` + `quality.point` (triggers).
**Implement via:** `CUSTOM` (quality.point triggers on stock moves/mrp workorders;
M effort). Very buildable — the model is simple; UI work is the bulk.

## 11. Referrals — HR — P3
**What:** Gamified employee referral program.
**Features:**
- Browse open positions, promote on social media, refer friends
- Points accrual along the pipeline (referred → hired)
- Levels with avatars (gamified level-up)
- Rewards shop (redeem points for gifts), customized rewards
- Reports: employee referral analysis, rewards report, points report; alerts
**Keystone:** `hr.referral` (referral links + points) — gamification hooks onto hr.job.
**Implement via:** `CUSTOM` (S effort — points + levels + shop on top of hr.job).
Also overlaps with the user's love of gamified mechanics — nice showcase candidate.

## 12. Appraisals — HR — P2
**What:** Performance reviews (incl. 360 feedback).
**Features:**
- Schedule appraisals: automatic scheduling, plans, automation, or manual
- Conduct: employee self-assessment, manager feedback, ask-for-feedback, review
- Appraisal review: schedule review, review employee skills, final rating, private note
- Templates: modify/create appraisal templates
- 360 feedback: dashboard, request feedback, view results
- Goals: goals library (integration with gamification)
**Keystone:** `hr.appraisal` + `hr.appraisal.plan`.
**Implement via:** `OCA`/`CUSTOM` — check OCA/hr (19.0 verified) for hr_appraisal;
otherwise S–M custom (assessment forms + state machine).

## 13. Social Marketing — Marketing — P2
**What:** Social media publishing/monitoring from Odoo.
**Features:**
- Social posts: compose + publish to linked accounts (Facebook, Instagram, etc.)
- Social campaigns (multi-channel campaign management)
- Social streams: monitor accounts/followers/interactions on the dashboard
- Live chat requests from tracked pages
- Lead/opportunity creation from social interactions
**Keystone:** `social.post` + social account/stream records.
**Implement via:** `OCA/social` (19.0 verified) — covers messaging/social features.

## 14. Marketing Automation — Marketing — P2
**What:** Campaign automation: drip flows, lead scoring, lifecycle marketing.
**Features:**
- Campaigns: from scratch or templates (welcome flow, double opt-in, tag hot contacts,
  commercial prospection, schedule calls)
- Audience targeting (segment filters)
- Workflow activities (email/SMS/tag/score steps with delays and conditions)
- Testing/running: test mode, launch, campaign metrics
- CRM integration (lead scoring, schedule-call-on-lead)
**Keystone:** `marketing.campaign` + `marketing.activity` (the workflow engine).
**Implement via:** `CUSTOM` (cron-driven activity engine on mail.mass_mailing; L effort).

## 15. Field Service — Services — P3
**What:** On-site work orders, technician scheduling, worksheets.
**Features:**
- Field service tasks (from SOs or standalone) with itinerary planning
- Product management on tasks; worksheets (sign-off work performed)
- Integration with Planning (technician shifts), Project, Inventory
**Keystone:** `project.task` with field-service flags + `worksheet` templates.
**Implement via:** `OCA/field-service` (19.0 verified — the OCA project is mature).

## 16. Helpdesk — Services — P2
**What:** Support tickets, SLAs, help center.
**Features:**
- Helpdesk teams: visibility, auto-assignment (workload/expertise-based), follow-all
- Ticket lifecycle: receive (email/web), merge, convert to opportunity (CRM), archive
- SLAs: service level agreements with stages/policies
- Help Center (customer-facing knowledge base + ticket submission)
- Access rights management per team
**Keystone:** `helpdesk.ticket` + `helpdesk.team` + SLA policies.
**Implement via:** `OCA/helpdesk` (19.0 verified).

## 17. Planning — Services — P3
**What:** Team/schedule planning — shifts and resources.
**Features:**
- Roles (with property fields: accreditation, location, language) for auto-plan
- Employees: shifts, working hours/schedules, default roles
- Materials: assign roles + working time (like employees)
- Shift templates (role, project), auto-plan feature
- SMS planning integration
**Keystone:** `planning.slot` (shift) + `planning.role`.
**Implement via:** `CUSTOM` (L — the Gantt/auto-plan UI is the heavy part).

## 18. Appointments — Services — P2
**What:** Online booking: customers pick a time slot from your availability.
**Features:**
- Appointment types with scheduling windows, assignment methods (auto-assign, resources)
- Resource capacity + linked resources (auto-assign only)
- Schedule/Options/Questions/Messages tabs (questions = custom booking form fields)
- Customer-facing booking page (publishing), CRM integration
- Google Calendar sync
**Keystone:** `appointment.type` + `appointment.booking`.
**Implement via:** `CUSTOM` (M — calendar availability + booking form; Google Calendar
sync is a known pattern).

## 19. Approvals — Productivity — P1
**What:** Centralized approval requests hub.
**Features:**
- Requests from a central hub (approve referrals, rentals, procurement, contracts,
  payments — cross-app)
- Choose who decides: per-request approvers, rules
- Request types/categories, multi-step approval chains
**Keystone:** `approval.request` + `approval.category` (rules).
**Implement via:** `CUSTOM` (M — generic approval object + rules engine + chatter
integration). High leverage: one hub replacing per-app approval hacks.

## 20. VoIP ("Phone" in Odoo 19) — Productivity — P3
**What:** In-app telephony (WebRTC).
**Features:**
- Phone widget in the UI: click-to-call from any record
- Dial plans (routing rules), call reporting
- Access roles: No / Officer (view+report) / Administrator (manage)
- Provider integrations: Axivox, DIDWW, OnSIP (SIP over WebSocket + WebRTC)
**Keystone:** SIP/WebRTC client + call model (`voip.call`).
**Implement via:** `CUSTOM` (L) or external (Twilio/Asterisk gateway + widget).
KSA note: SIP providers region-specific; verify local providers first.

## 21. IoT — Productivity — P3
**What:** IoT box connecting hardware (printers, scales, cameras, HID) to Odoo.
**Features:**
- IoT box (Raspberry Pi-based) auto-discovered by Odoo
- Compatible devices: USB cameras/webcams (Logitech), HID (footswitch/keyboard),
  printers (USB/network), measurement tools (Sylvac calipers), weighing scales
  (Mettler Toledo Ariva-S)
- Used by POS (receipt printers), MRP (scales, measures), Quality (pictures)
**Keystone:** `iot.device` + IoT box server.
**Implement via:** `OCA/iot` (19.0 verified) for the server side; hardware cost
(~$100–300/box). Only if acczed targets physical retail/manufacturing.

## 22. Knowledge — Productivity — P1
**What:** Internal wiki/knowledge base with structured articles.
**Features:**
- Article creation: from scratch, templates, or AI-generated
- Rich editor: comments, commands, nested articles (index), item Kanban/calendar/cards
- Templates library, article properties
- Multi-user collaboration, permissions
**Keystone:** `knowledge.article` (hierarchical tree).
**Implement via:** `OCA/knowledge` (19.0 verified) or CUSTOM (M).

## 23. Studio — Customization — P2
**What:** No-code app builder inside Odoo.
**Features:**
- Build/modify models (fields, views) via drag-and-drop UI
- Automation rules, webhooks, approval rules, PDF reports
- Publish custom apps to users
**Keystone:** `ir.model` + `ir.ui.view` — Studio is a UI over Odoo's own metadata.
**Implement via:** `SUBSCRIPTION` (no OCA equivalent; OCA/web has related UI modules but
not a studio). For acczed: a developer fork doesn't need Studio — code is Studio.

## 24. Mobile apps — Platform — P2
**What:** Native Android/iOS apps for all enterprise apps.
**Features:** full mobile access to apps (optimized UIs, push notifications).
**Implement via:** `SUBSCRIPTION` (apps are enterprise-gated) or PWA/custom mobile
(Expo — the user already ships Expo (Astrolabe)). Community has no official mobile apps.

---

# PART B — ENTERPRISE-ONLY FEATURES INSIDE SHARED APPS

These apps exist in Community; the *listed extras* are enterprise-only:

| App (Community base) | Enterprise-only extras |
|----------------------|------------------------|
| Invoicing | Full accounting layer (see App #1): GL, reconciliation, analytic, OCR, budgets, checks, consolidation, localizations, assets, deferred revenue, bank feeds, SEPA |
| Expenses | OCR digitalization of receipts; reimbursement inside payslips |
| Inventory | Barcode app (scanner-driven ops, GS1/EAN13/EAN14) |
| Manufacturing | Shopfloor (tablet work-order UI), MRP Control Panel, advanced scheduling |
| Timesheet | Grid view, timer, reminders, timesheet validation |
| Fleet | (commuting data feed to ESG) |
| CRM/Website/etc. | No enterprise-gated features (verified on editions page) |

---

# PART C — IMPLEMENTATION PLANNING

## Path selection rules of thumb
1. **If the app is a revenue feature for acczed clients** → build custom (ownership, no
   per-user fees, fits the fork model).
2. **If it's table-stakes and OCA has a 19.0 branch** → install OCA first, customize later
   (payroll, field-service, helpdesk, social, iot, knowledge).
3. **If it's deep Odoo-platform magic** (Accounting advanced, Studio, Sign legality,
   mobile apps) → weigh subscription vs custom per deal.

## Suggested phases
- **P0 (core for a Saudi accounting product):**
  1. Accounting layer (custom, incremental: bank reconciliation → budgets → assets)
  2. Payroll (OCA/payroll + custom Saudi rules: GOSI, end-of-service)
- **P1 (productivity glue, cheap wins):**
  3. Approvals (custom — high leverage, M effort)
  4. Knowledge/Documents (OCA/knowledge; OCR automation rides the existing OCR stack)
  5. Sign (custom + KSA e-sign provider check)
- **P2 (growth):**
  6. Quality (custom), Appointments (custom), Helpdesk (OCA), Social (OCA),
     Marketing Automation (custom), Appraisals (OCA/hr check), Subscriptions (custom)
- **P3 (stretch / on-demand):** ESG, Rental, Amazon, PLM, Referrals, Planning, VoIP, IoT,
  Field Service (OCA if ever), Studio, Mobile

## Key risks / notes
- **Saudi payroll rules are a differentiator** — no public module exists (verified);
  building them (GOSI, EOS benefits, Saudization levies) is real product IP.
- **Sign in KSA** needs a certified e-signature provider (check Nafath/ABS/trust-service
  providers) — do not build raw PDF signing and call it legal.
- **OCA modules must be pinned per branch (19.0)** and added as a separate addons path
  (pattern already used for this fork); OCA quality varies — review before install.
- **The "uninstallable" list in the acczed DB is the ground truth of what's missing**:
  `accountant, appointment, helpdesk, hr_appraisal, industry_fsm, iot_box_image,
  iot_drivers, knowledge, marketing_automation, mrp_plm, mrp_workorder,
  payment_sepa_direct_debit, planning, quality_control, sale_amazon, sale_subscription,
  sign, social, stock_barcode, timesheet_grid, voip, web_mobile, web_studio`.

## Appendix — verification
- Editions matrix: https://www.odoo.com/page/editions (Community/Enterprise columns, 19.0)
- Feature pages: /app/{accounting,payroll,documents,sign,esg,subscriptions,rental,
  amazon-connector,plm,quality,referrals,appraisals,social-marketing,
  marketing-automation,field-service,helpdesk,planning,appointments,approvals,voip,
  iot-hardware,knowledge,studio}-features
- Docs: odoo.com/documentation/19.0/applications/...
- OCA 19.0 branches verified via GitHub API on 2026-08-29
