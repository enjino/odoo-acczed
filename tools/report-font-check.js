#!/usr/bin/env node
// ACC-E05 — the report bundle must not fetch fonts from a third-party origin.
//
// Why this exists: `web.report_assets_common` includes `web/static/fonts/fonts.scss`, which declares
// the 'Odoo Unicode Support Noto' family for Arabic at https://fonts.odoocdn.com (fonts.scss:27-36).
// For a product sold as self-hosted that is a third-party request on every Arabic report — and PDFs
// are rendered server-side, so an unreachable CDN means broken Arabic in a generated document.
//
// acczed_theme re-points the report font stack at a self-hosted family instead. The CDN @font-face
// stays in the stylesheet, so this check is about *use*, not presence: it asserts that rendering
// Arabic with the report's own stack resolves to our family and contacts nobody.
//
//   node tools/report-font-check.js
//
// Env: ACCZED_BASE, ACCZED_DB, ACCZED_LOGIN / ACCZED_PASSWORD, ACCZED_CHROMIUM, NODE_PATH.
// Exit 0 only if no request left the instance while rendering Arabic.

const path = require('path');

function loadPlaywright() {
  const candidates = [];
  if (process.env.NODE_PATH) candidates.push(...process.env.NODE_PATH.split(path.delimiter));
  candidates.push(
    path.join(process.env.HOME || '', '.hermes/hermes-agent/node_modules'),
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, '..', 'node_modules'),
  );
  for (const c of candidates) {
    if (!c) continue;
    try { return require(require.resolve('playwright', { paths: [c] })); } catch (_) { /* next */ }
  }
  try { return require('playwright'); } catch (_) { /* fall through */ }
  console.error('ERROR: playwright not found. Set NODE_PATH to a node_modules containing it.');
  process.exit(1);
}

const base = process.env.ACCZED_BASE || 'http://localhost:8069';
const db = process.env.ACCZED_DB || 'acczed';
const user = process.env.ACCZED_LOGIN || 'admin';
const pass = process.env.ACCZED_PASSWORD || 'admin';
const REPORT = process.env.ACCZED_REPORT || '/report/html/base.report_ir_model_overview/1';
const ARABIC = 'مرحبا بالعالم';

(async () => {
  const { chromium } = loadPlaywright();
  const launch = { headless: true };
  if (process.env.ACCZED_CHROMIUM) launch.executablePath = process.env.ACCZED_CHROMIUM;

  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const offsite = [];
  page.on('request', r => {
    const u = r.url();
    if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith('file:')) {
      offsite.push(`${r.resourceType()} ${u}`);
    }
  });

  await page.goto(`${base}/web/login?db=${db}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.oe_login_form:not(.d-none)', { state: 'visible', timeout: 30000 });
  await page.fill('input[name="login"]', user);
  await page.fill('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.o_main_navbar', { state: 'visible', timeout: 60000 });

  await page.goto(`${base}${REPORT}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  // Render Arabic through the report's OWN stack, so this exercises whatever the bundle actually
  // declares rather than a font we hardcode here. Without this the page is English and no Arabic
  // face is ever requested — the check would pass for the wrong reason.
  const probed = await page.evaluate(async (arabic) => {
    const el = document.createElement('div');
    el.id = 'acczed-arabic-probe';
    el.style.cssText = 'font-family: var(--font-sans-serif); font-size: 32px;';
    el.textContent = arabic;
    document.body.appendChild(el);
    await document.fonts.ready;
    const stack = getComputedStyle(el).fontFamily;
    return {
      stack,
      usesOurs: stack.includes('acczed Arabic'),
      usesOdooNoto: stack.includes('Odoo Unicode Support Noto'),
      webfontLoaded: document.fonts.check('32px "acczed Arabic"', arabic),
    };
  }, ARABIC);

  // Give any @font-face fetch a chance to start before we judge.
  await page.waitForTimeout(2500);

  console.log(`user=${user}  report=${REPORT}`);
  console.log(`stack: ${probed.stack}`);
  console.log(`resolves to our family: ${probed.usesOurs}   references Odoo Noto: ${probed.usesOdooNoto}`);
  console.log(`our arabic face loaded:  ${probed.webfontLoaded}`);
  console.log(`off-instance requests:   ${offsite.length}`);
  for (const o of offsite) console.log('   ' + o);

  const problems = [];
  if (offsite.length) problems.push(`${offsite.length} request(s) left the instance: ${offsite.join(' | ')}`);
  if (!probed.usesOurs) problems.push(`report stack does not use the self-hosted family: ${probed.stack}`);
  if (probed.usesOdooNoto) problems.push('report stack still references "Odoo Unicode Support Noto"');

  await browser.close();
  if (problems.length) {
    console.error('MISMATCH: ' + problems.join(' ; '));
    process.exit(1);
  }
  console.log('OK');
})().catch(err => {
  console.error('ERROR: ' + err.message);
  process.exit(1);
});
