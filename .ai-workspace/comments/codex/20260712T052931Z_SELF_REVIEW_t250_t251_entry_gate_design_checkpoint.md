# SELF REVIEW: T-250/T-251 Entry-Gate Design Checkpoint

**Author:** codex
**Time:** 2026-07-12T05:29:31Z
**Scope:** candidate designs only; product implementation remains frozen
**Authority:** T-242 stable-first plan, T-249 constitutional alignment,
DESIGN_MODULE_METHOD, RELEASE_METHOD

## Triage

| Ticket | Smallest re-entry | Defect | Candidate disposition |
|---|---|---|---|
| T-250 | `requirement_reprice` at LAWS-028 | One mutable `packageVersion` comparator collapses source project, published RC cut, tapped release cut, product, and installed product identities | Review the five-subject version-basis design; do not rewrite immutable rc.3 surfaces |
| T-251 | `realization_refactor` at M05 proof tooling | Ten dead lint residues and an attested-only 27-view Mermaid check keep entry proof non-green | Review the deletion-only lint repair and locally pinned render gate design |

No bug or red gate was routed directly to product code. T-250 remains blocked
before requirement or realization edits; T-251 remains implementation-closed
until F_H accepts its design.

## Design Review Results

| Design | Required views | Axiom result | Independent review | Current disposition |
|---|---:|---|---|---|
| `M03_CONSTITUTIONAL_VERSION_BASIS_BEHAVIOR_DESIGN.md` | domain, sequence, state | internally aligned; GraphFunction applicability reasoned `not_applicable` | clean after closing repair-vocabulary, public-issue-shape, carrier-ownership, zero-row, and release-evidence findings | candidate, ready for F_H review |
| `M05_ENTRY_PROOF_GATES_BEHAVIOR_DESIGN.md` | domain, sequence, state | internally aligned; product/GTL behavior reasoned `not_applicable`, package boundary applicable | clean; exact lint census, render lifecycle, cleanup, failure classes, and package exclusion verified | candidate, ready for F_H review |

T-250 reuses the published `GtlProgramRepairEditClass` vocabulary and existing
`GtlProgramConformanceIssue` shape. Version-basis reasons are compiler-internal:
raw admission owns local kind/ref coherence, while the semantic compiler judge
owns binding/fact cardinality and version comparison. The one proposed public
diagnostic and conformance-input extension remain explicit requirement work,
not design-by-implementation.

T-251 derives its closed input set from the nine rows in the A5 `Registered
Stages` table. The planned local gate requires exactly 27 ordered Mermaid
blocks and transient nonempty SVG outputs; it does not claim semantic or F_H
acceptance.

## Mechanical Evidence

- `git diff --check`: green.
- Ambient `mmdc 11.3.0` feasibility: both candidate documents render all six
  Mermaid blocks to nonempty SVGs; outputs were removed. This is not T-251
  closure evidence because the local pinned gate is not implemented.
- A5 register census: nine unique local designs, each containing exactly
  `classDiagram`, `sequenceDiagram`, and `stateDiagram-v2` in order; 27 views.
- `npm run lint:test-harness`: exactly ten errors in the three files and names
  enumerated by T-251. This is expected open work, not a green claim.
- `npm pack --dry-run`: 1,003 files; zero `test_env`, Mermaid, or Puppeteer
  payload paths in the current packed product.
- Phase 1 remains independently reviewed at commit `d5aaa3f` with an 8/8 pass.

## Drift Review

- No product code, tests, requirements, release assets, package metadata, or
  dependencies changed in this checkpoint.
- T-250 does not relabel the rc.3 bootloader or release note as 5.0 source,
  infer an installed product, create a second drift judge, or expand the
  existing public issue/repair schema by accident.
- T-251 does not change runtime behavior, assertions, GTL, Consensus, public
  contracts, package contents, or ordinary `build:semantic` scope.
- The A5 register correction only replaces its stale authority-conflict note
  with the stable-first authority already persisted by `7107604`.
- Four pre-existing untracked M02/M04 self-build draft files are explicitly
  outside this checkpoint and remain untouched.

## F_H Gate

F_H must disposition each candidate as `accepted` or `rework`. Acceptance of
T-250 opens the LAWS-028 requirement edit and then its bounded compiler work.
Acceptance of T-251 opens the deletion-only lint repair and local proof-gate
implementation. Neither acceptance authorizes Consensus or other 5.0 product
implementation, release publication, or modification of immutable rc.3
history.

**Verdict:** design checkpoint is review-ready; implementation is not yet
authorized.
