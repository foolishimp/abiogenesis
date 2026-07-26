# T-271 Complete C-Program Interpreter Self-Review

Date: 2026-07-14
Implementation checkpoint: `f4ab3d4f`
Disposition: independent post-implementation review pending

## Review Basis

T-271 must compile every admitted constructor in the closed C family into one
sealed structural plan, interpret that plan through the existing runtime atom
laws, and remove only the `complete_c_program_interpreter` gap. It must not
introduce Consensus-specific behavior, a second traversal loop, public
invocation authority, whole-program conservation, or tenant capability truth.

The review traced the compiler, interpreter, direct-atom factoring, selected
catalog joins, replay admission, T-252 census, packed exports, and generated
publication surfaces. Green tests were treated as evidence after those paths
were inspected, not as the review itself.

## Implementation Observations

1. `complete_c_program.ts` admits the canonical selected declaration, joins
   the exact Module, execution GraphFunction, composition owner, GraphVector,
   program binding, and composition, then seals a closed recursive plan for
   `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`, `C.batch`, and
   `C.retry`.
2. Plan assertion recomputes every node, task, composition-locus, and plan
   seal; verifies source/parent paths, carrier continuity, result cardinality,
   task uniqueness, retry policy, authored-node count, invoking-locus count,
   and contiguous invocation ordinals.
3. `complete_c_program_runtime.ts` validates current selected catalog,
   Module, execution function, composition owner, vector, and composition
   authority before dispatch. It folds the sealed tree and delegates effectful
   leaves, workflow lifts, batch coordination, and retry decisions to the
   retained atom boundaries.
4. Batch and retry implementations expose package-private reusable laws while
   their existing direct resolvers remain in place. The packed package proves
   those internal coordinators and admission helpers are not exported.
5. Runtime output is admitted as exact detached data before it becomes a
   receipt. Replay revalidates receipt seals, plan/node authority, task and
   retry coordinates, predecessor payload/lineage, and exact cursor identity.
6. The handoff now carries an exact complete plan for every selected vector.
   Legacy normalized HoG remains a compatibility projection and is nullable
   for mixed or nested terms; it is not an alternate execution authority.
7. The T-252 census derives 34 exact selected-vector plans and covers all 19
   authored programs. The canonical body digest is unchanged. The census now
   reports only `declared_program_conservation` for T-267 and tenant manifest
   coverage for T-268.

## Defects Found And Repaired

1. Initial nested retry coordinates represented only the innermost attempt.
   Nested retries could therefore collide in replay. The runtime now carries
   the complete retry path, validates every coordinate against its enclosing
   budget, and proves distinct `[1,1]` and `[2,1]` attempts with exact replay.
2. A validly sealed receipt for a future locus could be submitted without the
   preceding receipt. The earlier implementation rejected it only after the
   fold, which could permit an earlier effect. Replay is now required to be a
   contiguous execution prefix before any new effect; the negative test proves
   zero atom invocations.
3. The first full-suite pass exposed stale generated publication digests and
   obsolete T-259/T-264 expectations. Publication was regenerated from 1118
   immutable payload files, and the tests now assert the current complete-plan
   boundary rather than the retired interpreter gap.

## Negative Evidence

- inner carrier discontinuity stops compilation;
- missing or ambiguous composition binding stops compilation;
- self-referential `workflow.C` returns a typed semantic gap before effects;
- malformed atom results cannot become receipts;
- stale receipt seals, stale cursors, predecessor drift, future-locus replay,
  invalid task ordinals, and invalid nested retry paths stop before effects;
- selected-catalog substitution and resealed foreign vector plans stop before
  effects;
- caller-substituted source program bytes fail compiler authority admission;
- replay of a completed mixed or nested-retry execution repeats zero effects;
- no Consensus, reviewer, panel, controller, prompt-shell, or public-router
  vocabulary occurs in the compiler or interpreter.

## Verification

- full semantic suite: 1710/1710;
- focused T-271/T-260/T-261/T-255/T-252 lane: 49/49;
- GTL law lane: 82/82;
- packed installed T-271 public-surface proof: 1/1;
- T-252 probe: body digest
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`,
  manifest digest
  `sha256:212c5dedc93b8ed1a65ff15dbf0fbe9f3178547a35181336ac776deb369e1d35`,
  two owned gap families;
- strict TypeScript and semantic lint: passed;
- GTL authority guard: 25 reserved declaration keys, seven constructors,
  zero private fan-in imports;
- DS governance: 19 tickets and 61 commentary references checked;
- Mermaid gate: 22 design files and 66 diagrams;
- public contracts: 82 schemas and 40 generated publication assets verified;
- `git diff --check`: passed.

## Residual Boundaries

- T-267 must consume this plan to prove authored-locus and interpreter-bind
  conservation. A completed interpreter result does not self-close traversal.
- T-270 must supply compiler-produced plans through the one public
  catalog/start router. T-271 does not expose a supported public execution
  path or accept external plan bytes as authority.
- T-268 must admit the canonical tenant-conformance manifest before
  effect-bearing Consensus execution.
- Batch result projection remains an injected, strictly admitted atom-boundary
  projection. T-270 must bind that callback to the admitted public runtime;
  T-271 does not claim product-level projection authority.

## Verdict

No open P0 or P1 defect remains in the reviewed T-271 boundary. The accepted
design and exit proof matrix are realized at `f4ab3d4f`. Closure is not
self-certified: the ticket remains active pending independent
post-implementation review.
