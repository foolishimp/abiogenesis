# Audit: Concurrent Codex Session — Commit Contamination And Adjudication

**Status**: incident audit, commentary
**Date**: 2026-07-06
**Scope**: a concurrent codex session edited specification surfaces while
this session was committing with `git add -A`; two of my commits
absorbed its uncommitted churn under my commit messages. This post is
the honest record: what each session did, what each commit actually
contains, the content adjudication, and the process fix.

## Timeline (reconstructed from git + both sessions' reports)

1. `c9857da` (mine, clean): REQ-R-ABG3-HANDLERS-001..-014 authored.
2. Codex session (concurrent, uncommitted): added handler clauses
   -018..-025 to REQ-R-ABG3-CCALL.md + enriched its Derives-from line;
   repointed T-205 at the CCALL clauses; strengthened HANDLERS.md.
3. `904b346` (mine, CONTAMINATED): my re-entry differential + -014
   amendment — but `git add -A` also swept codex's uncommitted CCALL
   additions (+100 lines) and HANDLERS strengthening (+10). The commit
   message describes only my work.
4. Codex noticed its own duplication (handler law now in two files),
   removed its CCALL clauses, repointed T-205 at HANDLERS-001/-014,
   kept its HANDLERS strengthening.
5. `b302383` (mine, CONTAMINATED): my -004 resume fix (spine authority
   attempt identity + batch ref threading) — plus codex's CCALL
   removal (-100 lines) and T-205 repoint swept in the same way.
6. Codex stopped on the operator's message; observed no spec diff
   (my commits had absorbed everything) and my then-in-flight runtime
   files (committed by me in b302383; codex did not edit them).

## Content verification at HEAD (all checked, not assumed)

- REQ-R-ABG3-CCALL.md: EXACTLY -001..-017 + Realization State + my
  original Derives-from line. My ratified law fully intact; zero codex
  residue. Net effect of their add-then-remove: nothing.
- REQ-R-ABG3-HANDLERS.md: my 14 clauses intact. THREE codex additions
  survive (adjudicated below).
- T-205 ticket: codex repoint to HANDLERS-001/-014 — correct direction.
- Runtime (c_call_spine.ts, engine_runner.ts, t192 lane): mine alone,
  as authored; codex did not touch them.
- Suite at HEAD: 1117/1117. t188 32/32. t200 20/20. Standing gate rows
  unaffected (spec files are not runtime inputs).

## Adjudication of the surviving codex content: ACCEPTED, attributed

Treated as the B1 review round arriving as edits instead of findings —
all three additions strengthen the family and are consistent with the
plan's intent:
1. Preamble: the handler binding tuple `{programRef, stageRole, armId,
   regime, handlerRef, handlerClass, handlerConfigRef}` as admitted
   configuration data + "a product does not implement a standard-path
   worker loop" — makes -011/-012 concrete and bans exactly what T-205
   lifts.
2. -011 rider: product-local prompt shells / handler scanners / file
   loaders / registries / effect routers are not lawful interpretation
   seams.
3. Non-closure additions: product-local standard-path worker loops;
   hidden handler configuration from ambient scans or shells.

## Defects, owned

1. MINE (process): `git add -A` while the workspace had a concurrent
   writer — two commit messages (904b346, b302383) misdescribe their
   diffs. History is append-only here; no rewrite. This post is the
   corrective record; the messages' claims about MY changes remain
   accurate, and the blended content is inventoried above.
2. THEIRS (method): editing constitutional surfaces in place mid-flight
   (add-then-revert churn on live law) instead of posting findings.
   Review rounds land as commentary or as clean commits, not as
   uncommitted edits under another session's feet.

## Standing process fix (this session, effective immediately)

- Commits name explicit paths — no `git add -A` in shared workspaces.
- Before each commit: `git status --short` and stage only files this
  session changed; anything else is surfaced, never swept.
