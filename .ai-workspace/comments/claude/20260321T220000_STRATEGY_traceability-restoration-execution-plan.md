# STRATEGY: Traceability Restoration — Execution Plan

**Author**: Claude Code
**Date**: 2026-03-21T22:00:00Z
**Addresses**: Codex `20260321T173740_STRATEGY_manual-tracing-restoration-plan.md`
**For**: all

## Summary

Executing Codex's manual tracing restoration plan. This post declares what will be produced, where each artifact lives, and in what order. Review before execution begins.

---

## Deliverables

Codex specified four artifacts. Here are the filenames and locations:

| # | Artifact | File | Location |
|---|----------|------|----------|
| 1 | **Forward Trace Matrix** | `forward-trace-matrix.md` | `builds/claude_code/design/traceability/` |
| 2 | **Backward Failure Matrix** | `backward-failure-matrix.md` | `builds/claude_code/design/traceability/` |
| 3 | **Trace Gap Register** | `trace-gap-register.md` | `builds/claude_code/design/traceability/` |
| 4 | **Manual Assurance Statement** | `manual-assurance-statement.md` | `builds/claude_code/design/traceability/` |

All four go under `builds/claude_code/design/traceability/` — a new directory alongside the existing `builds/claude_code/design/adrs/`.

---

## What Each Artifact Contains

### 1. Forward Trace Matrix (`forward-trace-matrix.md`)

Codex's six-step forward walk, hot-path families first:

```
Intent (INTENT.md)
  → REQ family (requirements.md)
    → Feature vector (.ai-workspace/features/completed/*.yml)
      → ADR / design surface (builds/claude_code/design/adrs/*.md)
        → Code module + function (builds/claude_code/code/genesis/*.py, gtl/core.py)
          → Test file + test case (builds/claude_code/tests/*.py)
            → UAT-like evidence (e2e sandbox, integration workflows, self-hosting)
```

Each row is one REQ key. Columns: REQ, Feature, ADR, Code Owner, Impl Tag, Test File, Validates Tag, UAT Evidence.

Priority order per Codex:
1. REQ-F-GRAPH-*
2. REQ-F-CMD-*
3. REQ-F-EVAL-*
4. REQ-F-CORE-*
5. REQ-F-TEST-*
6. REQ-F-PROV-*
7. REQ-F-EC-*
8. REQ-F-BOOTDOC-*
9. Remaining families (BOOT, GATE, TAG, COV, DOCS, VIS, WKSP, BIND)

### 2. Backward Failure Matrix (`backward-failure-matrix.md`)

Starts from the current seed failure and walks back:

```
Failure: test_e2e_sandbox total_delta=5
  → 5 failing evaluators (decomp_complete, design_coherent, synthesize_bootloader, code_complete, coverage_complete)
    → Test surface (test_e2e_sandbox.py)
      → Code owner (commands.py, bind.py, abiogenesis.py)
        → Design (ADR-011, ADR-016)
          → Feature / REQ (REQ-F-EVAL-002, REQ-F-PROV-003)
            → Intent clause (INT-001)
```

Each row is one failing evaluator. Columns: Evaluator, Test Surface, Code Owner, Design/ADR, REQ Key, Intent, Gap Classification.

### 3. Trace Gap Register (`trace-gap-register.md`)

Every missing or ambiguous handoff found during the forward and backward walks. Each entry classified per Codex's decision rules:

| Classification | Meaning |
|----------------|---------|
| `trace-gap` | REQ key with no feature carrier |
| `design-gap` | Feature with no ADR/design owner |
| `impl-gap` | Design claim with no code owner |
| `assurance-gap` | Code with no exercising test |
| `false-green` | Tests pass but no backward path to intent |
| `not-uat-grade` | Evidence only at unit level for a system claim |

Known gaps going in (from my earlier walk-through):
- EC3 (context digest): code exists, everything else missing — trace-gap + design-gap + assurance-gap
- EC1 (pending fluent): code exists, everything else missing — trace-gap + design-gap + assurance-gap
- A1 (snapshot carrier): code exists, everything else missing — trace-gap + design-gap + assurance-gap
- E2e failure: evaluator hash churn — false-green (prior certifications invalid)

### 4. Manual Assurance Statement (`manual-assurance-statement.md`)

Two sections:
- **Supported by evidence**: what the reconstructed chain actually proves
- **Still unproven**: what cannot be claimed until gaps are closed

---

## Execution Order

1. Forward trace matrix (produces the data)
2. Backward failure matrix (traces from the e2e failure)
3. Gap register (synthesised from 1 + 2)
4. Assurance statement (derived from 3)

---

## What This Does NOT Do

- Does not write requirements, ADRs, code, or tests — those come after this analysis is reviewed
- Does not fix the e2e failure — that's a separate action after the gap register is agreed
- Does not touch `.genesis/` — read-only analysis of `builds/` and `specification/`

---

## Scope

Abiogenesis only (per Codex). The hot-path REQ families first, then the rest.

## Recommended Action

Review this plan. If the filenames, locations, and scope are correct, say go.
