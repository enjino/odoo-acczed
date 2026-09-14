#!/usr/bin/env node
// acczed — evidence screenshot helper.
//
// Why this exists: `google-chrome --headless --screenshot` is NOT usable against Odoo. The login
// form ships as `.oe_login_form.d-none` and is revealed by an OWL component, and the backend is a
// JS-rendered SPA, so a plain headless capture records a blank card and silently "succeeds".
// This waits for real content before saving, and fails loudly when it never appears.
//
// Usage:
//   node tools/shot.js <url> <out.png> [options]
//
// Options:
//   --wait <selector>   wait for this selector to be visible before shooting (required in practice;
//                       pass the one you actually expect, e.g. ".oe_login_form:not(.d-none)")
//   --login             log in first (LOCAL instances only — see ACCZED_LOGIN/PASSWORD)
//   --width <n>         viewport width  (default 1600)
//   --height <n>        viewport height (default 1000)
//   --settle <ms>       extra settle time after the wait (default 2500)
//
// Env:
//   ACCZED_LOGIN / ACCZED_PASSWORD   credentials for --login (default admin/admin, local dev only)
//   ACCZED_CHROMIUM                  path to a chromium binary (default: playwright's bundled one)
//
// Requires playwright. It is resolved from NODE_PATH if set, otherwise from a playwright
// installation on the machine. Run as:
//   NODE_PATH=<path-to-node_modules> node tools/shot.js ...
//
// Exit codes: 0 = screenshot saved, 1 = content never appeared / other failure.

const fs = require('fs');
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

function parseArgs(argv) {
  const out = { width: 1600, height: 1000, settle: 2500, login: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--wait') out.wait = argv[++i];
    else if (a === '--login') out.login = true;
    else if (a === '--width') out.width = parseInt(argv[++i], 10);
    else if (a === '--height') out.height = parseInt(argv[++i], 10);
    else if (a === '--settle') out.settle = parseInt(argv[++i], 10);
    else rest.push(a);
  }
  out.url = rest[0];
  out.out = rest[1];
  return out;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url || !args.out) {
    console.error('usage: node tools/shot.js <url> <out.png> [--wait <sel>] [--login] [--width n] [--height n] [--settle ms]');
    process.exit(1);
  }
  const { chromium } = loadPlaywright();

  const launch = { headless: true };
  if (process.env.ACCZED_CHROMIUM) launch.executablePath = process.env.ACCZED_CHROMIUM;

  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: args.width, height: args.height } });

  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(String(e.message).slice(0, 160)));

  // NEVER 'networkidle' on an authenticated Odoo page: the webclient holds the bus/longpolling
  // connection open, so the network never goes idle and the run hangs until timeout.
  if (args.login) {
    // Log in FIRST, at a login URL that pins the database.
    //
    // Navigating straight to the target would not work: an unauthenticated /odoo/... redirects to
    // /web/login *without* the db parameter, which (db_name=False + list_db=True) lands on the
    // database selector — a page with no login form — and the wait times out.
    const origin = new URL(args.url).origin;
    const db = process.env.ACCZED_DB || new URL(args.url).searchParams.get('db') || 'acczed';
    const user = process.env.ACCZED_LOGIN || 'admin';
    const pass = process.env.ACCZED_PASSWORD || 'admin';   // local dev only — never production

    await page.goto(`${origin}/web/login?db=${db}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.oe_login_form:not(.d-none)', { state: 'visible', timeout: 30000 });
    await page.fill('input[name="login"]', user);
    await page.fill('input[name="password"]', pass);
    await page.click('button[type="submit"]');
    await page.waitForSelector('.o_main_navbar', { state: 'visible', timeout: 60000 });
  }

  // Navigate to the real target. Harmless when --login already landed here: an authenticated
  // request to /web/login just redirects onward to the backend.
  await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  if (args.wait) {
    try {
      await page.waitForSelector(args.wait, { state: 'visible', timeout: 30000 });
    } catch (err) {
      console.error(`ERROR: selector never became visible: ${args.wait}`);
      console.error(`       url: ${args.url}`);
      if (jsErrors.length) console.error('       js errors: ' + jsErrors.join(' | '));
      console.error('       refusing to save a screenshot that does not show the expected content.');
      await browser.close();
      process.exit(1);
    }
  }

  await page.waitForTimeout(args.settle);

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  await page.screenshot({ path: args.out, fullPage: true });
  const { size } = fs.statSync(args.out);
  console.log(`saved ${args.out} (${args.width}x${args.height} viewport, full page, ${size} bytes)`);
  console.log(`url=${page.url()}`);
  if (jsErrors.length) console.log('js errors: ' + jsErrors.join(' | '));

  await browser.close();
})().catch(err => {
  console.error('ERROR: ' + err.message);
  process.exit(1);
});
