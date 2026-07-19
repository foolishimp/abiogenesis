# Scenario Bundle - Total Assurance Projection UAT

> **T-283 disposition (2026-07-20):** Prior scenario evidence; held and
> non-operative for 5.0 acceptance. The exact current Product scenarios are
> `ABG5-S01` through `ABG5-S07` in `PRODUCT.md` and
> `REQ-P-SCENARIOS.md`. Reuse requires post-closure re-derivation.

**Validates**: REQ-R-ABG3-ASSURANCE, REQ-R-ABG3-EVENTS, REQ-R-ABG3-LINEAGE, REQ-R-ABG3-PROJECTION, REQ-R-ABG3-TRANSPORT, REQ-R-ABG3-CONVERGENCE, REQ-P-SCENARIOS, REQ-P-QUAL

**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../PRODUCT.md), [requirements/abg/REQ-R-ABG3-ASSURANCE.md](../requirements/abg/REQ-R-ABG3-ASSURANCE.md)

**Purpose**: Prove that ABG assurance is a total replay-derived projection over
current authority, current input state, and admitted runtime facts. The proof
must prevent premature closure while preserving enough generic facts for a
downstream product to build its own lifecycle register.

## Scenario

Evaluate an invocation-local graph-function boundary that receives authority,
worker output, and evidence over more than one hop. ABG must project assurance
rows and a closure decision from admitted facts. If a second hop exposes missing
downstream execution evidence, the lifecycle register must deepen and block
convergence even when the first hop produced a valid artifact.

## Significant Paths

- success path: all required rows are fulfilled or release-lawfully deferred,
  and the closure fold emits `close` or `qualified_defer`
- shallow worker path: worker success or report shape exists without required
  evidence binding, and the projection emits `partial` or `missing`
- stale input path: a prior close was computed against an older authority or
  input digest, and a fresh projection emits `stale_input`
- orphan evidence path: evidence exists without matching current authority or
  scoped runtime binding, and the row emits `orphan_evidence`
- invalid ledger path: event truth is unreadable or inadmissible, and the row
  emits `event_ledger_invalid`
- plugin boundary path: plugins provide snapshots, adapters, classifiers,
  policies, or gain functions but do not emit runtime truth or close scopes
- actor-observed worker path: Claude actor/worker stdout and stderr are
  archived when live transport fails, times out, or succeeds
- subordinate assurance path: subordinate work remains causally bound to the
  parent boundary or declares its own subordinate assurance boundary
- downstream register path: ABG exposes generic assurance facts sufficient for
  a downstream product to project lifecycle rows without making ABG own the
  downstream domain semantics

## UAT Cases

| Case | Requirement authority | Graph-function carrier | Proof lane | Expected assurance rows | Expected closure |
| --- | --- | --- | --- | --- | --- |
| UAT-ASSURANCE-001 close on fulfilled rows | REQ-R-ABG3-ASSURANCE-005, -007, -017, -018 | GraphCall/Frame scoped projection | deterministic TypeScript unit | `fulfilled` | `close` |
| UAT-ASSURANCE-002 no closure from missing downstream evidence | REQ-R-ABG3-ASSURANCE-005, -009, -017, -019, -025 | two-hop lifecycle register over one scoped projection | Claude live lane plus deterministic fold | hop 1 `fulfilled`, hop 2 `missing` | register `deepen`, `mayConverge: false` |
| UAT-ASSURANCE-003 stale input reopens prior close | REQ-R-ABG3-ASSURANCE-004, -010, -020, -024 | replay-derived projection with changed digest | deterministic tenant test | `stale_input` | `retry` |
| UAT-ASSURANCE-004 orphan evidence does not satisfy authority | REQ-R-ABG3-ASSURANCE-012, -018, -020, -025 | projection over admitted evidence without matching authority | deterministic tenant test | `orphan_evidence` | `reprice` or `block` by policy |
| UAT-ASSURANCE-005 plugin cannot close scope | REQ-R-ABG3-ASSURANCE-021, -022, -023 | plugin-provided snapshot/evidence/classifier inputs | deterministic tenant test | classified rows, no plugin-owned closure | closure fold remains ABG-owned |
| UAT-ASSURANCE-006 live actor observation is evidence, not closure | REQ-R-ABG3-ASSURANCE-019, -025, REQ-R-ABG3-EVENTS-012..015, REQ-R-ABG3-PROJECTION-007..010, REQ-R-ABG3-TRANSPORT-016..019, REQ-P-QUAL | Claude actor/worker transport archive | Claude live lane | transport stdout/stderr archived and projected | success only if assurance fold closes |
| UAT-ASSURANCE-007 subordinate boundary remains bound | REQ-R-ABG3-ASSURANCE-026 | parent graph call plus subordinate boundary ref | deterministic or live tenant test | parent-bound or subordinate-bound rows | no parent close from unbound child output |

## Current Live Proof

The current TypeScript live UAT lane is
`build_tenants/abiogenesis/typescript/test_env/live/test_t094_assurance_register_two_hop_live.test.mjs`.
It runs Claude-only transport for two hops:

1. Hop 1 returns a UAT proof artifact and projects a fulfilled row.
2. Hop 2 consumes that artifact, observes absent execution evidence, and
   projects a missing row.
3. The lifecycle register folds those hops to `deepen` with
   `mayConverge: false`.

This proves the first downstream-register skeleton needed to reproduce the
test35 effectiveness property that closure must deepen when later lifecycle
evidence is missing.

## Non-Closure Conditions

- a worker report, transport success, archive, or passing test is treated as
  closure without assurance-row projection
- missing downstream evidence disappears because no register row exists
- a stale prior close remains valid after authority or input digest change
- plugin output directly closes a scope
- live Claude unavailability is skipped instead of archived as observed
  transport evidence
- ABG hard-codes SDLC lifecycle semantics rather than exposing generic facts
  from which a downstream product can project its own register
