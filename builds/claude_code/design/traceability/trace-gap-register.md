# Trace Gap Register

**Date**: 2026-03-21
**Method**: Synthesised from forward trace matrix + backward failure matrix
**Decision rules**: Per Codex restoration plan §Decision Rules

---

## Gap Classification Key

| Classification | Meaning |
|----------------|---------|
| `trace-gap` | REQ key with no feature carrier, OR code with no REQ key |
| `design-gap` | Feature with no ADR/design owner |
| `impl-gap` | Design claim with no code owner |
| `assurance-gap` | Code with no exercising test |
| `false-green` | Tests pass but no backward path reaches intent |
| `not-uat-grade` | Evidence only at unit level for a system claim |
| `operational-gap` | No guard against a class of operational misuse |

---

## Critical Gaps (block self-hosting gate)

| # | Gap | Classification | Severity | What's Missing | Where |
|---|-----|---------------|----------|----------------|-------|
| G-01 | **Evaluator description stability** | operational-gap | **blocks e2e** | No requirement or F_D check prevents ad hoc evaluator description churn. The spec_hash mechanism correctly invalidates certifications when descriptions change, but nothing prevents careless changes. Self-hosting test fails because of this. | gtl_spec/packages/abiogenesis.py |
| G-02 | **EC3 — context digest in spec_hash** | trace-gap, design-gap, assurance-gap | high | Code in bind.py:50-73. No REQ key, no feature, no ADR, no test. `Implements: REQ-F-EVAL-002` tag is a false trace — that REQ doesn't specify context digests. | bind.py, requirements.md |
| G-03 | **EC1 — manifest_id + pending fluent** | trace-gap, design-gap, assurance-gap | high | Code in commands.py:289-498, manifest.py:63, schedule.py:136-137. No REQ key, no feature, no ADR, no test. Completely untraced. | commands.py, requirements.md |
| G-04 | **A1 — PackageSnapshot carrier** | trace-gap, design-gap, assurance-gap | high | Code in core.py:105-162, __main__.py:629-632. No REQ key, no feature, no ADR, no test. Completely untraced. | core.py, requirements.md |

## Moderate Gaps (don't block self-hosting but weaken assurance)

| # | Gap | Classification | Severity | What's Missing | Where |
|---|-----|---------------|----------|----------------|-------|
| G-05 | **REQ-F-PKG-001 — no feature carrier** | trace-gap | medium | Code exists (gen-install.py:59), Implements tag exists, but no feature vector covers this REQ key. No test validates starter spec generation. | .ai-workspace/features/ |
| G-06 | **REQ-F-EC-003 — no Implements tag** | trace-gap | low | Three convergence models — structural behaviour distributed across bind.py and schedule.py. No single code file is tagged. Tested indirectly through EC-002 and EC-004 tests. | bind.py, schedule.py |
| G-07 | **REQ-F-EC-005 — no Implements tag, no targeted test** | trace-gap, assurance-gap | medium | Rejection vs revocation — the kind isolation is structural but untested directly. If `assessed{kind: fh_review}` accidentally satisfied F_P convergence, no test would catch it. | bind.py |
| G-08 | **REQ-F-EC-006 — no Implements tag** | trace-gap | low | assessed result values — semantic definition. Tested indirectly through emit() validation tests. | core.py, __main__.py |
| G-09 | **REQ-F-EC-001 — distributed implementation** | not-uat-grade | low | Five prime operators — structural property of the entire engine, not implementable in one file. Impl tag on __main__.py only covers emit-event CLI path. Unit tests cover emit() validation but no integration test verifies the full set of five primes end-to-end. | distributed |
| G-10 | **REQ-F-BOOTDOC — feature status `iterating`** | impl-gap | low | Feature vector exists and is not yet completed. Graph asset is defined, F_D evaluator works, but unit_tests trajectory is `not_started`. | .ai-workspace/features/completed/REQ-F-BOOTDOC.yml |
| G-11 | **REQ-F-EC-001 — no impl or val tag** | trace-gap | low | Five prime operators — structural property distributed across __main__.py, core.py. No file is tagged Implements or Validates for this specific REQ key. | bind.py, core.py, __main__.py |
| G-12 | **REQ-F-PROV-005 — no impl tag** | trace-gap | low | Orphan tolerance is a structural guarantee (comment in code). No `# Implements: REQ-F-PROV-005` tag anywhere. Has Validates tag in test_provenance_integration.py. | schedule.py, commands.py |
| G-13 | **REQ-F-TEST-001, -002 — no impl tag** | trace-gap | low | Architecture requirements — define what tests should look like, not engine code. Debatable whether impl tag applies. Have Validates tags. | N/A |

## False-Green Analysis

| # | Test | What It Proves | What It Doesn't Prove | Classification |
|---|------|----------------|----------------------|----------------|
| F-01 | test_bind.py tagged `Validates: REQ-F-EVAL-002` | spec_hash matching works for evaluator definition changes | Does NOT validate context digest extension (EC3) — the tag claims coverage it doesn't have | false-green |
| F-02 | 343 passing tests | Individual unit/integration scenarios work | Cannot prove self-hosting convergence — the e2e test that would prove this fails | not-uat-grade |

---

## Gap → Action Map

| Gap | Action Required | Priority |
|-----|----------------|----------|
| G-01 | Stabilise evaluator descriptions: revert ad hoc `rebuild` suffixes in abiogenesis.py | **Immediate** — unblocks e2e |
| G-02 | Add REQ key (extend REQ-F-EVAL-002 or new REQ-F-EVAL-006), write ADR section, write test | High |
| G-03 | Add REQ key (new REQ-F-CMD-005 or REQ-F-EC-007), write ADR, write test | High |
| G-04 | Add REQ key (new REQ-F-PROV-006), write ADR, write test | High |
| G-05 | Create feature vector for REQ-F-PKG-001, write test | Medium |
| G-06 | Add Implements tag to bind.py and schedule.py for EC-003 | Low |
| G-07 | Write targeted test: verify assessed{kind: fh_review} does NOT satisfy F_P | Medium |
| G-08 | Add Implements tag | Low |
| G-09 | Accept as structural — add comment noting distribution | Low |
| G-10 | Complete bootloader feature — write unit tests | Medium |
| F-01 | Remove false Validates tag claim or add context digest test | Medium |
| F-02 | Fix G-01 to restore e2e green | **Immediate** |
| G-11 | Add Implements tag for EC-001 to relevant files; add Validates tag to a test | Low |
| G-12 | Add Implements tag for PROV-005 to schedule.py or commands.py | Low |
| G-13 | Accept as architectural — or add a comment-level Implements tag | Low |
