#!/usr/bin/env node
// ACC-E02 / ACC-E03 — browser-side RTL seam.
//
// Why this exists: `o_rtl` is added to document.body *client-side*, by JS, after Owl mounts
// (addons/web/static/src/start.js:46, driven by localization.direction from
// /web/webclient/translations). It therefore NEVER appears in a server response — no curl, wget or
// grepping of HTML can observe it. This is the only seam that can prove the class actually lands.
//
// It also checks the portal, where direction IS server-rendered onto <html>
// (addons/portal/views/portal_templates.xml:5), so the two surfaces are covered by one run.
//
//   node tools/rtl-browser-check.js --expect rtl      # as the Arabic user
//   node tools/rtl-browser-check.js --expect ltr      # negative control, as admin
//
// Env: ACCZED_BASE (default http://localhost:8069), ACCZED_DB (acczed),
//      ACCZED_LOGIN / ACCZED_PASSWORD (default admin/admin — local dev only),
//      ACCZED_CHROMIUM, NODE_PATH (as in shot.js).
//
// Exit 0 only if every observation matches --expect.

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

const args = process.argv.slice(2);
const opt = { expect: 'rtl', base: process.env.ACCZED_BASE || 'http://localhost:8069' };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--expect') opt.expect = args[++i];
  else if (args[i] === '--base') opt.base = args[++i];
}
const db = process.env.ACCZED_DB || 'acczed';
const user = process.env.ACCZED_LOGIN || 'admin';
const pass = process.env.ACCZED_PASSWORD || 'admin';

const wantRtl = opt.expect === 'rtl';

(async () => {
  const { chromium } = loadPlaywright();
  const launch = { headless: true };
  if (process.env.ACCZED_CHROMIUM) launch.executablePath = process.env.ACCZED_CHROMIUM;

  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(String(e.message).slice(0, 160)));

  // Login flow identical to shot.js — see the comments there for why it goes via /web/login?db=
  // and why waitUntil is never 'networkidle' (the bus holds the connection open forever).
  await page.goto(`${opt.base}/web/login?db=${db}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.oe_login_form:not(.d-none)', { state: 'visible', timeout: 30000 });
  await page.fill('input[name="login"]', user);
  await page.fill('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.o_main_navbar', { state: 'visible', timeout: 60000 });

  const read = async (url, readySel) => {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector(readySel, { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1500);   // let start.js add o_rtl after mount
    return page.evaluate(() => ({
      dir: document.documentElement.getAttribute('dir'),
      bodyRtl: document.body.classList.contains('o_rtl'),
      wrapRtl: !!document.querySelector('#wrapwrap.o_rtl'),
      lang: (document.querySelector('html') || {}).lang || null,
    }));
  };

  const backend = await read(`${opt.base}/odoo`, '.o_main_navbar');
  const portal = await read(`${opt.base}/my/home`, '#wrapwrap');

  console.log(`user=${user} expect=${opt.expect}`);
  console.log(`backend  dir=${backend.dir}  body.o_rtl=${backend.bodyRtl}`);
  console.log(`portal   dir=${portal.dir}  #wrapwrap.o_rtl=${portal.wrapRtl}`);
  if (jsErrors.length) console.log('js errors: ' + jsErrors.join(' | '));

  const problems = [];
  if (backend.bodyRtl !== wantRtl) problems.push(`backend body.o_rtl=${backend.bodyRtl}, expected ${wantRtl}`);
  if (portal.wrapRtl !== wantRtl) problems.push(`portal #wrapwrap.o_rtl=${portal.wrapRtl}, expected ${wantRtl}`);
  if (wantRtl && portal.dir !== 'rtl') problems.push(`portal <html dir> = ${portal.dir}, expected rtl`);
  if (!wantRtl && portal.dir === 'rtl') problems.push(`portal <html dir> = rtl, expected not-rtl`);

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
