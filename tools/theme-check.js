#!/usr/bin/env node
// ACC-C01 / C03 / C05 — does the backend actually paint Dark Space Botanical?
//
// A theme is not "applied" because a variable file exists; it is applied when the browser paints the
// right pixels. This reads computed styles from a real page and compares them to the site tokens in
// `acczed-site/app/globals.css:2-17`. It is the seam for the whole of phase C.
//
//   node tools/theme-check.js            # exit 1 on any mismatch
//
// Env: ACCZED_BASE, ACCZED_DB, ACCZED_LOGIN / ACCZED_PASSWORD, ACCZED_CHROMIUM, NODE_PATH.

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

// Site tokens -> expected computed values. Written as literals from globals.css, NOT derived from the
// SCSS: an assertion that recomputes the expected value the way the code does can never disagree
// with it.
const EXPECTED = [
  ['body background',   'body',          'background-color', 'rgb(13, 17, 23)',   '#0d1117 --bg'],
  ['body text',         'body',          'color',            'rgb(230, 237, 243)', '#e6edf3 --text'],
  ['navbar background', '.o_main_navbar', 'background-color', 'rgb(16, 23, 32)',   '#101720 --bg-soft'],
  ['primary button bg', '.btn-primary',  'background-color', 'rgb(57, 211, 83)',  '#39d353 --glow'],
  ['primary button fg', '.btn-primary',  'color',            'rgb(13, 17, 23)',   '#0d1117 on --glow (12:1)'],
];

(async () => {
  const { chromium } = loadPlaywright();
  const launch = { headless: true };
  if (process.env.ACCZED_CHROMIUM) launch.executablePath = process.env.ACCZED_CHROMIUM;

  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  await page.goto(`${base}/web/login?db=${db}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.oe_login_form:not(.d-none)', { state: 'visible', timeout: 30000 });
  await page.fill('input[name="login"]', user);
  await page.fill('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.o_main_navbar', { state: 'visible', timeout: 60000 });
  await page.goto(`${base}/odoo/action-base.action_res_users`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view', { state: 'visible', timeout: 30000 });
  await page.waitForTimeout(1500);

  const actual = await page.evaluate((specs) => {
    const out = {};
    for (const [label, sel, prop] of specs) {
      const el = document.querySelector(sel);
      out[label] = el ? getComputedStyle(el).getPropertyValue(prop).trim() : '(not found)';
    }
    // An SCSS compile error is rendered INTO the stylesheet by Odoo rather than failing the request,
    // so a page can look "mostly fine" while a whole variable file silently did not apply.
    let scssError = null;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.style && rule.style.content && /Error:.*(Undefined|error)/.test(rule.style.content)) {
            scssError = rule.style.content.slice(0, 160);
          }
        }
      } catch (_) { /* cross-origin sheet, skip */ }
    }
    return { out, scssError };
  }, EXPECTED);

  console.log(`user=${user}`);
  const problems = [];
  for (const [label, , , want, note] of EXPECTED) {
    const got = actual.out[label];
    const ok = got === want;
    console.log(`  ${ok ? 'ok  ' : 'BAD '} ${label.padEnd(19)} ${got.padEnd(20)} ${ok ? '' : `expected ${want}`}  (${note})`);
    if (!ok) problems.push(`${label}: got ${got}, expected ${want}`);
  }
  if (actual.scssError) {
    console.log(`  BAD  SCSS error in bundle: ${actual.scssError}`);
    problems.push('SCSS error rendered into the bundle: ' + actual.scssError);
  } else {
    console.log('  ok   no SCSS error rendered into the bundle');
  }

  // ACC-C02 — the dark bundle must actually be served. The server picks it in `ir.http.color_scheme()`
  // (addons/web/models/ir_http.py:77) and the template emits it only when that returns 'dark'
  // (webclient_templates.xml:300-305), so a themed variable layer alone does NOT mean the dark
  // bundle is in play. Observed via resource timing rather than by grepping HTML, because what
  // matters is that the browser fetched it.
  const dark = await page.evaluate(() => {
    const urls = performance.getEntriesByType('resource').map(e => e.name)
      .concat([...document.styleSheets].map(s => s.href || ''));
    const hits = urls.filter(u => u.includes('assets_web_dark'));
    return { hit: hits.length > 0, sample: hits[0] || null };
  });
  if (dark.hit) {
    console.log(`  ok   dark bundle served       ${String(dark.sample).replace(/^https?:\/\/[^/]+/, '').slice(0, 62)}`);
  } else {
    console.log('  BAD  dark bundle not served   web.assets_web_dark was never fetched (ACC-C02)');
    problems.push('web.assets_web_dark was not requested — color_scheme() is not returning dark');
  }

  // ACC-C04 — the systray toggle must actually flip the SERVED bundle, not just a cookie.
  //
  // This is the whole point of the C02 decision: the bundle is chosen server-side, so a toggle that
  // only writes a cookie and reloads would appear to work and change nothing. The round-trip is
  // therefore asserted end to end — click, reload, observe which bundle the browser actually got.
  const TOGGLE = '.o_acczed_scheme_toggle';
  const bundleIsDark = () => page.evaluate(() => {
    const urls = performance.getEntriesByType('resource').map(e => e.name)
      .concat([...document.styleSheets].map(s => s.href || ''));
    return urls.some(u => u.includes('assets_web_dark'));
  });
  const clickAndSettle = async () => {
    await page.click(TOGGLE);
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(2500);   // the reload is what re-serves the bundle
  };

  if (!(await page.$(TOGGLE))) {
    console.log(`  BAD  scheme toggle absent     no ${TOGGLE} in the systray (ACC-C04)`);
    problems.push(`no ${TOGGLE} found in the systray`);
  } else {
    const started = await bundleIsDark();
    await clickAndSettle();
    const flipped = await bundleIsDark();
    await clickAndSettle();
    const returned = await bundleIsDark();

    if (flipped === started) {
      console.log(`  BAD  toggle does not flip     bundle stayed ${started ? 'dark' : 'light'} across a click`);
      problems.push('toggle wrote the cookie but the served bundle never changed');
    } else if (returned !== started) {
      console.log(`  BAD  toggle round-trip        ${started} -> ${flipped} -> ${returned}, expected to return`);
      problems.push(`toggle round-trip did not return to its start (${started} -> ${flipped} -> ${returned})`);
    } else {
      console.log(`  ok   toggle round-trip        ${started ? 'dark' : 'light'} -> ${flipped ? 'dark' : 'light'} -> ${returned ? 'dark' : 'light'}`);
    }
    // Leave the browser on dark, so a failed run does not poison the next one.
    if (!(await bundleIsDark())) {
      await clickAndSettle();
    }
  }

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
