# Independent review of the common computational capability library design

## Product Frame

The Product remains ABIogenesis 5.0 under GOAL-035/T-287, with the fifteen
families A5-F01–07, F09–11 and F13–17. The selected slice is the common
computational capability library **design**, placed first by the owner's
clarification. Its outcome is a reusable, source-grounded construction basis
with concrete contracts, consumer/consolidation decisions, lawful composition,
explicit execution obligations and bounded stops. It does not establish
implementation equivalence, measured benefit, complete Product qualification
or release.

I reconstructed this frame from current Goals, Intent, Product, the
requirements index, REQ-P-CATALOG and REQ-R-ABG3-HANDLERS before assessing the
candidate. Specification owns WHAT and tenant design owns HOW.
GTL.TypeScript declares Program meaning; HoG directly traverses the admitted
Program; exact Product and leaf owners retain their semantics and effects;
ABG alone admits runtime truth; Event Calculus and replay derive it; SDK/CLI
remain thin. A lowered program, hidden dispatcher/controller, rival
runtime/catalog/event writer or process-local truth authority is prohibited.
The fixed 5.0/5.1 allocation and actual human release acceptance are conserved.
Optional pure-helper contraction cannot become a new all-helper release gate;
identity, currentness, replay and fresh-process defects remain material.

The reviewed subjects have different classes: common value/selection
mechanics are pure or deterministic constructions; Catalog and immutable
closure are derived readiness constructions; owner capabilities retain
semantic authority; receipts are evidence; physical execution and resource
finalization are effects; admitted events are ABG runtime truth. A common
function or diagram cannot promote one class into another. Known effects,
durable admission, receipt validity, resource release and current replay
remain separate even when a later step fails.

## Exact subject and operation

- Reviewer: `/root/reconciliation_review`, independent of candidate authorship.
- Subject: all five files in [candidate-freeze.json](candidate-freeze.json).
- Freeze SHA-256:
  `7a39d3ac51da19a79275cb6ab99f2024481ef57132bf19bcdfc2112bd0c1ab2c`.
- New library design SHA-256:
  `924789be491175cf570bf5407c14dbd9ccfd4f682b495e48a50ec6788f9b3527`.
- Initial basis SHA-256:
  `7c4196afaf481be05056a5c3b5120b98b9e4d012ccf2b673f765076b3ec23376`,
  binding HEAD `727f1dbcab3c198f7704735fdf91b994b7aac243` and actual
  inventoried worktree bytes.
- Method: `stdo://releases/v3.0.0-rc.1/`, installed manifest
  `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`.
  The exact Product Definition and project reference-frame basis select it;
  companion composition is empty. The installed manifest bytes match.
- Consumer: root Executive. This is an assessment and recommendation, not
  owner disposition.

All five files match the exact freeze. All 692 inventoried non-candidate
files, the governing Product/requirements, four routing preimages and the
historical T-287 tail are preserved. Prior reconciliation freeze/review
records remain intact. The 34 independent identity/preservation checks pass
in [review-checks.json](review-checks.json). Those checks are not semantic
proof. The review used direct owning source reads, not the assessors'
narratives as substitutes for contracts. Only this review and its check
record were written; no candidate repair, implementation, tests, build,
runtime execution, installation, publication or Git effects were performed.

## Concrete findings

### R1 — The sequence reverses the resolution and traversal relationship

**Severity:** medium; blocks the changed sequence's source correspondence and
authority-preservation predicate.

**Boundary:** `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`,
§7, lines 279–287, specifically HoG → Product resolution → HoG.

The source path table at line 272 correctly begins with the installed run
owner, Product resolution and ABG invocation admission before HoG. The
sequence instead makes HoG initiate exact Program/dependency resolution,
receive its result, then prepare work through ABG. No owner change or distinct
alternative path is selected.

**Counterexample:** an installed invocation with an invalid Product execution
selection is refused by Product preparation before HoG executes. On a lawful
selection, the same preparation supplies the exact resolution used by ABG
invocation admission and subsequently by HoG. Direct source:

- `code/src/owner_bindings/run_invocation.ts:1321` calls
  `ProductRunInvocationPort.prepare`; line 1341 handles its refusal;
  line 1375 calls `admitExactInvocation`; line 1599 starts
  `executeGraphTraversalEffect` with the prepared Program/resolution.
- `code/src/product/run_invocation_operation.ts:490` invokes
  `ProductExecutionResolutionPort.resolve`; line 498 returns preparation
  refusal if resolution is not loaded.
- `code/src/hog/graph_execute.ts` consumes the prepared traversal basis;
  its GTL term/source-path resolution is not the Product execution-resolution
  operation shown at the beginning of this diagram.

The diagram loses the actual preparer and the admission-before-traversal
join. Following it could introduce resolution into HoG or bypass/duplicate
the installed owner's preparation. This is a documentary counterexample,
not an assertion that current runtime code has that defect.

**Recommendation and cost:** one local sequence correction, with its immediate
constraint note, retaining the existing owner and exact resolution/admission
joins. Reassess that projection against these sources and the unchanged path
table. No Product change or implementation campaign is needed.

### R2 — Receipt failure can occur after durable admission

**Severity:** medium; blocks the changed state view's effect and recovery
conservation predicate.

**Boundary:** the same design, §7, lines 312–319, especially
`Observed --> UnadmittedResidue: admission or receipt fails`.

The state view places receipt failure on the unadmitted branch. It also has
no failure transition from an admitted result's direct physical finalization;
only the held-completion branch exposes close failure.

**Counterexample:** an owner admits an event batch, then returns a malformed
receipt or fails during completion. The binder fails, but the admitted prefix
has already advanced. Direct source:

- `code/src/shared/static_definition_bindings.ts:151` executes the owner
  before structural receipt checking at lines 153–164. Owner-output
  validation can likewise fail afterwards at lines 166–179.
- Its exact-prefix transition wrapper executes the owner at line 271 and
  only then validates the event receipt and exact transition at lines 273–284.
- `code/src/owner_bindings/run_invocation.ts:1235` completes the resource
  using the already computed final prefix.
- `code/src/abg/definition_event_resource.ts:159` distinguishes borrowed
  held completion from close; `closeAbgEventResource` at lines 363–378 checks
  currentness and performs physical close before creating the receipt.
  A later validation/finalization failure does not undo preceding admission.

This is a declared failure case supported by the source ordering, not a claim
that it occurred in this review. The design's K05 prose already recognizes
failure after effects. The state diagram contradicts it by classifying the
post-admission case as unadmitted residue or leaving it without a route.
Recovery must conserve the actual admitted successor as well as any physical
residue or uncertainty; a missing/invalid receipt does not prove rollback.

**Recommendation and cost:** one local state/case-partition correction,
distinguishing failed attempted admission from post-admission receipt or
finalization failure, with the admitted prefix conserved through recovery.
Reassess the changed projection and its K05/K09 joins. No runtime repair or
new persisted state machine is required.

## Other evaluated predicates and limits

| Predicate on this frozen design | Core value | Bounded evidence |
|---|---|---|
| Product scope, owner allocation and design-first routing are conserved | `satisfied` | The four routing deltas place this design first without changing the fifteen families, 5.1 exclusions, admission ownership or qualification/release predicates. |
| The library specifies concrete capabilities, consumers and consolidation decisions | `satisfied` | K01–K12, composition laws and D01–D11 specify reusable mechanics, owner ports and static compositions in existing modules. No new package, dispatcher or semantic interpreter is required. |
| D02–D04 identify source-supported contraction candidates in their declared domains | `satisfied` | D02 equality bodies and reference/digest comparison agree; D03 maps exact finite selection to each owner's existing result/refusal shape; D04's closed unique key lists agree on the existing rooted-witness and JSON-parsed codec domains. Actual equivalence after editing remains an execution obligation. |
| Domain distinctions, foundation decisions and unresolved stops are explicit | `satisfied` | Exact versus delimiter-joined keys, canonical equality versus coordinates/digests, freezing versus detachment, owner-current resources and physical versus semantic completion remain distinct. E01–E04 block their dependent new selections. Existing foundations remain selected without a fresh-market dominance claim. |
| The sequence and state projections preserve the same material owner/effect/recovery relations | `falsified` | R1 and R2 above are concrete counterexamples. |
| Design acceptance is separated from performed proof and actual benefit | `satisfied` | V1–V7 require future execution/assessment; the plan does not report those outcomes, complete source coverage, global Prime, measured savings, installed qualification or release. |

D02 source comparison covered `definition_binding_mechanics.ts`,
`environment_definition_bindings.ts` and
`verification_definition_bindings.ts`. D03 covered the actual selection
functions in `execution_resolution.ts`, `definition_binding_mechanics.ts` and
`exact_match.ts`, including zero/one/many, duplicate matches and predicate
failure. D04 covered `admission_predicates.ts`,
`rooted_topology_partition.ts`, `event_body_encoding.ts` and the codec's
`event_store.ts` JSON-parsed call sites. The codec comparison does not prove
equivalence for arbitrary descriptor-bearing JavaScript objects; that wider
domain is outside the established production correspondence. NUL-joined
checks are expressly retained pending E01.

The review also inspected actual freezing, immutable-closure caching,
resolution-local preparation reuse, static binder resource/currentness
contracts, and event-resource completion/close relations. It did not execute
the V1–V7 obligations, prove all consumers conform, measure savings, refresh
the external dependency market, or establish a new process/filesystem
algorithm. E01 raw structural-domain decisions, E02 broader equality/cache
mechanisms, E03 process extraction and E04 filesystem/archive algorithms
remain explicit design stops. These residuals do not themselves require
implementation before bounded design acceptance.

## Closed result and recommendation

The core value is **`falsified`** for the exact selected predicate:
“coherent source-grounded common capability library design with concrete
contracts/compositions/consumer/consolidation decisions, explicit obligations
and bounded unresolved stops, design-first routing, and conserved Product,
owner and authority relations.”

R1 and R2 falsify its mandatory cross-view relation; the other satisfied
subpredicates and explicit residuals survive. Recommend withholding acceptance
of this exact cut, selecting one bounded Writer correction in the library
design, then independently reassessing the changed sequence/state relations
and their affected joins. This recommendation does not activate
implementation or reopen unrelated Product/qualification work.
