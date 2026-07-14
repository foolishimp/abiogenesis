# T-267 Authority Conservation Repair Self-Review

Date: 2026-07-14
Reviewer: Codex
Checkpoint: `ce354ea7`
Boundary: bounded repair of the five independent T-267 review findings

## Authority Checked

- accepted `M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md`
- T-255 selected-program handoff and startup block
- T-256 compiled execution-context contract
- T-257/T-258 locus result-contract authority
- T-267 whole-program conservation checkpoint `0ce492fa`
- T-270 public routing boundary and retained startup fence

## Findings And Repairs

| Finding | Proportional repair | Negative proof |
|---|---|---|
| Declared result authority did not prove its execution-context contract current or bind it to the current T-255 handoff. | Added one owner-side canonical contract assertion, joined source status, source-basis digest, and published handoff ref, and carried the exact selected-stage digest into runtime authority matching. | Raw forged identity, coherently resealed stale handoff, coherently resealed stale source digest, and stale request stage-term all reject. |
| Intermediate F_P/F_H loci could receive the graph-final target contract. | Result-bearing loci retain target compatibility; non-result-bearing loci must use their exact stage output carrier. | A target-contract substitution at an intermediate F_P locus rejects; the exact locus output admits. |
| Direct application conservation substituted compiled-plan identity for application identity. | Derived one separate content-addressed direct-application ref and digest from GraphFunction, graph, GraphVector, and selected-program identity. | Direct application refs exclude plan ref and plan digest; a mutated direct-application digest rejects. |
| Admission identity depended on caller result-authority order. | Canonicalized authorities into exact source-locus order before bundle compilation and every admission-basis hash. | Reversed valid input produces the byte-identical admission and canonical projected order. |
| The negative matrix omitted several accepted-design mutations. | Added authored-node omission/duplication, result-frontier substitution/omission, execution-context forgery, authority permutation, intermediate contract substitution, and canonical recurse component mutations. | The Consensus probe rejects 42 mutations across operand, termination-evaluator, and foldback digests; focused negatives reject every other listed family before effects. |

## Boundary Review

- No Consensus-specific production branch was added.
- No C constructor, runtime atom, controller, or public router changed.
- T-270 files were not touched.
- Every admitted T-267 outcome remains `effectsPermitted: false`.
- `assertTraversalExecutionRuntimeStart` still ends at the unconditional typed
  T-270 refusal.
- The T-252 body digest is unchanged.
- Public declaration changes were regenerated through the governed publication
  tool; no generated asset was edited by hand.

## Verification

- `npm run lint:semantic`: passed.
- `npm run test:semantic`: 1721/1721.
- `npm run test:t267`: 54/54; GTL law 82/82; T-252 probe passed;
  packed public API proof 1/1.
- T-252 canonical projection: 35 static traversal admissions, zero T-267
  conformance issues, 42 rejected recurse-component mutations, one remaining
  T-268 product gap.
- T-252 body digest:
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`.
- T-252 manifest digest:
  `sha256:0122e8646c563fdef0c2508080afad6629aef4dc17dc255ca3a17129fc1d9681`.
- `npm run test:t223`: 70/70 source-blind product tests.
- `npm run test:t250`: 13/13 version and documentation drift tests.
- `npm run test:t273`: DS governance passed for 19 tickets, 68 comment refs,
  and 13 required fields; Mermaid inventory/render tests 7/7; governance
  negatives 5/5.
- `npm run check:abg-product-publication`: 82 schemas and 40 generated
  publication assets verified from 1118 immutable payload files.
- `npm pack --dry-run --json`: 1119 files; passed.
- `git diff --check`: passed before checkpoint.

The first full-suite run exposed four T-223 failures because the exported
contract assertion made the checked-in publication inventories stale. The
governed generator refreshed those assets; the publication check, full suite,
and dedicated T-223 source-blind lane then passed. This was artifact staleness,
not a suppressed test failure.

## Residual Boundary

This checkpoint does not close T-267 and does not authorize T-270. An
independent re-review must trace the repaired current-authority join,
intermediate contract relation, direct-application identity, canonical
ordering, and negative evidence. The commit remains local and unpushed. The
pre-existing untracked `node_modules` link remains untouched.

## Verdict

The five review findings are repaired proportionally and the self-review gates
are green. T-267 remains active at `independent_re_review_required`.
