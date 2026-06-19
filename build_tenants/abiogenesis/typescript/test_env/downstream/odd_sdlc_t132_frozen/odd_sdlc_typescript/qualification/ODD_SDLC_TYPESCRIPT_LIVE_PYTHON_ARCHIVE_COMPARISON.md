# odd_sdlc TypeScript Live Versus Python Archive Comparison

**Status**: Active
**Date**: 2026-04-26
**Owner Ticket**: `.ai-workspace/tickets/completed/T-060-publish-typescript-live-vs-python-archive-comparison-postmortem.md`
**Scope**: Evidence comparison for T-041 full operational Python-replacement
RC using `data_mapper` as an independent qualification workload.

## Qualification Boundary

`data_mapper` is not part of the `odd_sdlc` product.

It is an independent real-world test workload. Its role is to set the bar for
whether the SDLC is sufficiently functional over a non-trivial inherited
software-domain corpus.

Passing this workload is therefore product qualification evidence for
`odd_sdlc`. It is not product scope and it must not be folded into
`odd_sdlc` product definition.

## Verdict

The current TypeScript line is strong enough for a bounded ODD-native package
RC with live `F_P`, install, and release-cut preconditions closed.

It is not yet evidence-equivalent to Python's historical multi-edge
`data_mapper` qualification depth.

That is not a failure of the T-053 live run. It is a scope distinction:

- T-053 proves a current TypeScript live `F_P` single-edge `data_mapper`
  traversal through public ABG-installed workspace and hook admission.
- Python's richer `data_mapper` archives prove multi-edge/yield-chain behavior
  and broader operational loop depth against the independent qualification
  workload.
- Python's passing live code-edge archive proves historical live Codex
  execution over the code edge, but it is not a current `data_mapper` archive.

## Compared Archives

### Current TypeScript Live data_mapper

- archive:
  `build_tenants/typescript/test_env/test_runs/t053_live_data_mapper/20260426T183216072Z_pid7194/`
- test: `test_t053_live_fp_data_mapper.test.mjs`
- verdict: passed
- elapsed: `149907.021042ms`
- worker elapsed: `148813.489333ms`
- target graph function: `bootstrap_release_self_test`
- selected edge: `derive_code_surface`
- runtime: `@abiogenesis/typescript-tenant@3.4.0-rc.2`
- source inputs: 6
- imported requirement authorities: 136
- event sequence:
  `abg_installed_workspace -> public_start_projected -> external_fp_worker_dispatched -> worker_result_file_observed -> constructor_result_admitted -> hook_turn_closed`
- output: generated `code_surface.ts`, work report, constructor result, hook
  outcome, run summary, postmortem

### Python Historical Live Code Edge

- archive:
  `build_tenants/python/test_runs/live_codex_code_edge/20260407T020126_test_installed_executive_code_edge_live_codex_qualification/`
- test: `test_installed_executive_code_edge_live_codex_qualification`
- verdict: passed
- graph function: `bootstrap_release_self_test`
- edge: `derive_code_surface`
- transport: Codex subprocess
- total events: 150
- manifest files: 13
- result files: 12
- run ids: 13
- next edge after code: `derive_test_design_surface`
- approximate live code-edge worker interval from run notes:
  `2026-04-07T02:01:40Z` to `2026-04-07T02:05:06Z`, about 206 seconds

### Python data_mapper Yield-Chain Baseline

- archive:
  `build_tenants/python/test_runs/yield_handoff_canned_chain/20260423T073613_test_data_mapper_yield_chain_projects_run_continuation_and_gap_truth/`
- test: `test_data_mapper_yield_chain_projects_run_continuation_and_gap_truth`
- verdict: passed
- total events: 1617
- manifest files: 12
- result files: 12
- run ids: 25
- event families include:
  `execution_contract_*`, `run_*`, `graph_call_*`, `vector_started`,
  `fp_dispatched`, `result_artifact_observed`, `worker_turn_*`,
  `assessed`, `proof_passed`, `closure_passed`, `edge_converged`,
  `continuation_opened`, `run_yielded`, `triage_*`,
  `constitutional_proposal_*`, and `proposal_applied`
- role in this comparison: richer independent `data_mapper` chain/depth
  baseline, not a current live external Codex proof

## Comparison

| Dimension | TypeScript current live | Python live code edge | Python data_mapper chain |
|---|---:|---:|---:|
| Archive class | live external `F_P` | live external `F_P` | harnessed/yield-chain |
| data_mapper input | yes | no | yes |
| Edge proved | `derive_code_surface` | `derive_code_surface` | multi-edge chain |
| Runtime install proof | ABG TS installer | Python genesis installer | Python genesis installer |
| Worker dispatch | Codex subprocess | Codex subprocess | harnessed/canned worker path |
| Events recorded | 6 archive events | 150 runtime events | 1617 runtime events |
| Manifest files | worker + source manifest | 13 `F_P` manifests | 12 `F_P` manifests |
| Result files | generated code + work report | 12 result files | 12 result files |
| Continuation/yield proof | no | no | yes |
| Hook/result admission | TS constructor + hook turn | genesis assess-result | genesis assess-result |
| Timing class | about 150s total | about 206s code-edge worker interval | not comparable as live worker timing |

## Analysis

TypeScript now proves the important live boundary that was missing: a real
external worker receives a bounded data_mapper prompt, writes a governed code
surface and report, and the TypeScript hook path admits and closes that result.

The timing is plausible for live execution. The TypeScript worker took about
149 seconds. The passing Python live code-edge archive shows the same
live-worker timing class with a code-edge interval of about 206 seconds.

The stronger Python data_mapper baseline is not the live Codex archive. It is
the yield-chain archive. That archive proves breadth: many events, multiple
manifests, continuation/yield, triage, proposal, and repeated run surfaces. It
is useful as a behavioral-depth comparator, but it is not the same evidence
class as T-053.

The TypeScript gap is therefore not "can it run live?" T-053 answers yes. The
remaining gap is "does the TypeScript line yet reproduce the broader
multi-edge data_mapper qualification behavior that Python historically
reached?"
Current evidence says no.

## RC Consequence

Bounded TypeScript package RC:

- supported
- install/normalize proof: closed by T-059
- release-cut proof: closed by T-059
- live external `F_P` proof: closed by T-053

Full operational Python replacement:

- not yet supported if the bar includes Python's historical multi-edge
  data_mapper qualification depth
- the remaining question belongs under T-041 or a follow-up carved from T-041
  for multi-edge data_mapper qualification convergence

## Non-Claims

This comparison does not claim:

- Python live tests are TypeScript proof
- T-053 is equivalent to Python's multi-edge yield-chain archive
- release-cut packaging proves deployed runtime behavior
- a single generated TypeScript code surface proves the SDLC is sufficiently
  functional against the full independent data_mapper workload
