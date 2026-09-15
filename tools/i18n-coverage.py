#!/usr/bin/env python3
"""ACC-E04 — do the strings WE authored carry an Arabic translation?

Odoo ships Arabic for its own labels; anything acczed_theme invents is our problem. Without this,
an authored string silently stays English inside an otherwise-Arabic screen — and nothing fails,
which is the whole reason CONVENTIONS §8's "Arabic check" needed a mechanism rather than a reminder.

    tools/i18n-coverage.py <template.pot> <language.po>
        exit 0 — every authored term is translated (or there are none)
        exit 1 — at least one authored term is untranslated
    tools/i18n-coverage.py --selftest
        proves this check is capable of failing, using hand-written fixtures

The two files come from Odoo's own extractor, so "what counts as a translatable string" is defined by
Odoo rather than by a grep of ours that could drift from it:

    odoo-bin i18n export -c odoo.conf -d acczed -l pot -o /tmp/t.pot acczed_theme
    odoo-bin i18n export -c odoo.conf -d acczed -l ar  -o /tmp/t.po  acczed_theme
"""

import os
import sys


def parse_po(path):
    """Return {msgid: msgstr} for real entries (the header's empty msgid is dropped)."""
    entries = {}
    msgid, msgstr, field = None, None, None
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if line.startswith("msgid "):
                if msgid is not None:
                    entries[msgid] = msgstr or ""
                msgid, msgstr, field = _unquote(line), "", "msgid"
            elif line.startswith("msgstr "):
                msgstr, field = _unquote(line), "msgstr"
            elif line.startswith('"') and field == "msgid":
                msgid += _unquote(line)
            elif line.startswith('"') and field == "msgstr":
                msgstr += _unquote(line)
    if msgid is not None:
        entries[msgid] = msgstr or ""
    entries.pop("", None)          # the header block is not a translatable term
    return entries


def _unquote(line):
    start, end = line.find('"'), line.rfind('"')
    return line[start + 1:end] if start != -1 and end > start else ""


def check(template_path, language_path, module_po_path=None):
    """Return (n_terms, untranslated list).

    TWO sources of translations are consulted, and both are needed.

    `language_path` is the output of `odoo-bin i18n export -l <lang>`, which reads a **database
    cursor** (`odoo/tools/translate.py:1049`). That covers field and technical terms, but it does NOT
    cover strings authored in JS or QWeb, because Odoo 19 serves those from the module's `.po` file
    at runtime instead (`odoo/tools/translate.py:1858-1881`, `CodeTranslations`).

    Measured 2026-09-15 by ACC-C04, which is how this was found: a JS string with a correct
    translation in `i18n/ar.po` exports as `msgstr ""` every time. Relying on the export alone makes
    every authored code string look untranslated, permanently and no matter what the `.po` says.

    So `module_po_path` — the module's own `i18n/<lang>.po` — is merged in, and a term counts as
    translated if either source has it.
    """
    terms = parse_po(template_path)
    translated = {k: v for k, v in parse_po(language_path).items() if v.strip()}
    if module_po_path and os.path.exists(module_po_path):
        for key, value in parse_po(module_po_path).items():
            if value.strip():
                translated.setdefault(key, value)
    untranslated = sorted(t for t in terms if not translated.get(t, "").strip())
    return len(terms), untranslated


def main(argv):
    if len(argv) == 2 and argv[1] == "--selftest":
        return selftest()
    if len(argv) not in (3, 4):
        print(__doc__.strip().splitlines()[0])
        print("usage: i18n-coverage.py <template.pot> <exported.po> [module-i18n.po] | --selftest")
        return 2

    module_po = argv[3] if len(argv) == 4 else None
    n, untranslated = check(argv[1], argv[2], module_po)
    if n == 0:
        # Say so plainly. A green result here means "nothing was checked", and reporting it as a
        # pass without that caveat is how a vacuous check gets trusted.
        print("  VACUOUS  0 authored terms — nothing to translate yet")
        return 0
    if untranslated:
        print(f"  FAIL     {len(untranslated)}/{n} authored terms untranslated:")
        for t in untranslated:
            print(f"             {t!r}")
        return 1
    print(f"  PASS     all {n} authored terms translated")
    return 0


def selftest():
    """Fixtures with hand-written expectations — an independent source of truth.

    Without this the check would only ever run against a module with zero strings, and a check that
    has never been seen to fail is indistinguishable from one that cannot.
    """
    import tempfile, os

    def write(text):
        fd, path = tempfile.mkstemp(suffix=".po")
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
        return path

    HEAD = 'msgid ""\nmsgstr "header"\n\n'
    empty = write(HEAD)
    one = write(HEAD + 'msgid "Dashboard"\nmsgstr ""\n')
    one_ar = write(HEAD + 'msgid "Dashboard"\nmsgstr "لوحة التحكم"\n')
    two = write(HEAD + 'msgid "Dashboard"\nmsgstr ""\n\nmsgid "Roles"\nmsgstr ""\n')
    two_half = write(HEAD + 'msgid "Dashboard"\nmsgstr "لوحة التحكم"\n\n'
                            'msgid "Roles"\nmsgstr ""\n')
    two_ar = write(HEAD + 'msgid "Dashboard"\nmsgstr "لوحة التحكم"\n\n'
                          'msgid "Roles"\nmsgstr "الأدوار"\n')
    multi = write(HEAD + 'msgid ""\n"Line one "\n"line two"\nmsgstr ""\n')
    multi_ar = write(HEAD + 'msgid ""\n"Line one "\n"line two"\nmsgstr "سطر اول سطر ثاني"\n')

    # (name, template, language, expected exit code, expected term count)
    cases = [
        ("empty module is vacuous, not a pass",  empty,    empty,    0, 0),
        ("the only term translated",             one,      one_ar,   0, 1),
        ("the only term untranslated",           one,      empty,    1, 1),
        ("two terms, one translated",            two,      two_half, 1, 2),
        ("two terms, both translated",           two,      two_ar,   0, 2),
        ("multi-line msgid is ONE term",         multi,    multi_ar, 0, 1),
        ("multi-line msgid untranslated",        multi,    empty,    1, 1),
    ]

    failures = 0
    for name, tmpl, lang, want_code, want_n in cases:
        n, untranslated = check(tmpl, lang)
        code = 0 if not untranslated else 1
        ok = (code == want_code and n == want_n)
        print(f"  {'ok  ' if ok else 'BAD '} {name}: {n} terms, {len(untranslated)} untranslated, "
              f"exit {code} (expected {want_n} terms, exit {want_code})")
        if not ok:
            failures += 1
    print(f"\nself-test: {'FAILED' if failures else 'all fixtures behaved as expected'}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
