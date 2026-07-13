# REPAIR REVIEW: T-266 Proportional Findings

- ticket: T-266
- review_kind: post-external-review realization repair
- reviewed_at: 2026-07-13 Australia/Sydney
- verdict: repair_complete_for_renewed_closure_review
- closure_state: user/independent review pending
- threat_model: trusted desktop

## Review Re-entry

The first external verdict blocked checkpointing on three findings. The
reviewer then corrected that ranking after applying trigger probability, harm,
existing fail-closed controls, and repair rabbit-hole risk:

| Finding | Corrected ruling | Retained realization |
|---|---|---|
| Explicit Node-backed term upcast to `CProgramTerm` | non-blocking; explicit upcast intentionally discards TypeScript information | already-completed non-serialized `nativeMode` partition retained by user direction |
| Open variadic TypedNode tuple | proportionate blocker | `number extends Nodes["length"]` refuses construction and downstream carrier/binding entry |
| Package-private raw fan-in helper | non-blocking; public API excludes it and M03 fails malformed relations closed | already-completed private witnessed HOF construction retained by user direction |

The user explicitly ruled against unwinding completed work and against any
further algebra or constructor restructuring. The retained P0/P1 repairs are
not precedent for future closure ranking.

## Repaired Behavior

1. Ordinary and Node-backed native C terms carry disjoint non-enumerable mode
   literals. Node-backed terms still require the private authority symbol.
   Inferred use preserves the exact mode; an explicit assignment to ordinary
   `CProgramTerm` is now compile-negative. Canonical serialization is unchanged.
2. `TypedInterface` rejects open variadic witness tuples, and the C/GraphVector
   exact-tuple guard independently rejects a predeclared open interface.
3. Production fan-in construction is private to `hof.ts` and takes the exact
   witnessed reducer/vector relation. Raw malformed compiler fixtures author
   ordinary declaration data directly; no product shortcut survives.

## Evidence

- focused T-266: 125/125
- standing GTL law: 82/82
- full semantic: 1559/1559
- origin/main-relative diff witness: 798 executable changed lines witnessed,
  724 changed lines non-executable, zero violations
- strict TypeScript and semantic lint: pass
- GTL authority guard: 25 reserved declarations, 21 runner files, seven C
  constructors
- public schemas: 63 verified
- generated publication: 33 assets from 1017 immutable payload files, exact
- packed dry run, packed public containment, and `git diff --check`: pass

## Residual Judgment

The trusted decoder remains an authoring assertion, not schema or runtime value
authority. Native term mode is non-enumerable and non-canonical. M03 continues
to judge ordinary serialized identities only. Runtime C/HOF execution remains
owned by successor tickets.

This repair review does not close T-266 and does not impersonate the pending
user/independent verdict.
