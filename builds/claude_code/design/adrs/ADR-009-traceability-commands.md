# ADR-009: Traceability Enforcement — check-tags and check-req-coverage

**Status**: accepted
**Date**: 2026-03-15
**Covers**: REQ-F-TAG-001, REQ-F-TAG-002, REQ-F-COV-001

## Decision

Two subcommands in `commands.py` enforce REQ key traceability:

**`genesis check-tags --type implements --path <src/>`**
Scans Python source files under `<path>` for `# Implements: REQ-*` comment lines.
Exits 0 if every file has ≥1 tag; exits 1 with a list of untagged files otherwise.

**`genesis check-tags --type validates --path <tests/>`**
Same scan for `# Validates: REQ-*` tags in test files.

**`genesis check-req-coverage --package <pkg:var> --features <dir/>`**
Loads `Package.requirements` from the GTL Package; scans `<dir/>` YAML files for
`satisfies:` lists; reports covered/uncovered counts. Exits 0 if coverage = 100%.

## Rationale

- Tags are the mechanism by which the REQ key threads from spec to runtime (Bootloader §XIII)
- F_D evaluators call these as subprocesses — deterministic, no LLM
- Output is machine-readable JSON (stdout) for the engine to parse as `detail`

## Consequences

- `check-tags` regex: `^\s*#\s*(Implements|Validates):\s*REQ-[\w-]+`
- Missing tags at commit time surface as F_D failures on `design→code` and `code↔unit_tests`
- `check-req-coverage` reads `satisfies:` YAML lists — not prose — so coverage is grep-computable
