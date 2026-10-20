# Independent affected reassessment of the common capability library design

## Product Frame

ABIogenesis 5.0 remains the Product selected by GOAL-035/T-287, with the fixed
fifteen families A5-F01–07, F09–11 and F13–17. The selected outcome is the
common computational capability library design: concrete reusable contracts,
compositions, consumer/consolidation decisions, execution obligations and
bounded unresolved stops, with this design activity first. The governing
Product, Intent, requirements and project frame are unchanged from the
independent frame reconstruction in [review.md](review.md).

GTL.TypeScript owns Program meaning; Product preparation/resolution retains
its owner; HoG traverses the admitted Program; declared owners perform effects;
ABG alone admits runtime truth; Event Calculus/replay derive it; SDK/CLI stay
thin. No second runtime, hidden controller, rival catalog/event writer or
process-local truth authority is selected. The existing 5.0/5.1 allocation,
qualification and human release-acceptance boundaries remain fixed.

The affected views describe owner operations, physical effects, subordinate
receipt evidence and ABG-admitted truth. Those classes remain distinct:
physical close is not outer receipt validation, a missing receipt does not
undo admission, and projection does not grant new authority.

## Exact successor and permitted review

- Reviewer: `/root/reconciliation_review`, independent of candidate writing.
- Subject: the five-document successor in
  [candidate-freeze-02.json](candidate-freeze-02.json).
- Successor freeze SHA-256:
  `476aa57a3b0660f05a4a84f8c238a0095c1c4daaeb8bd9ac753dfa3e858c659f`.
- Corrected library SHA-256:
  `cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b`.
- Correction freeze SHA-256:
  `0422b6bd7a027be8afb4abc453aa99efc5007e8e68c3abb73ccc543a142573a1`.
- Selected method: exact installed `stdo://releases/v3.0.0-rc.1/`, manifest
  `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`.
- Project frame:
  `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`.
- Activation/disposition:
  [correction-01/decision.md](correction-01/decision.md).
- Decision consumer: root Executive.

I reacquired the exact corrected views, retained rejected preimage, recorded
diff, governing source identities and the source operations material to
R1/R2. All 35 independent checks in
[review-checks-02.json](review-checks-02.json) pass. Only the library changed;
the other four candidate files and all 692 inventoried non-candidate files
are unchanged. Library bytes before the sequence and after the immediate
state note are identical. The original review, checks, freeze, rejected
library preimage and correction records retain their declared hashes.

These mechanical checks establish identity and preservation, not semantic
acceptance. Only this reassessment and its check record were written. No
candidate edits, implementation, tests, build, runtime execution, installation
or Git effects were performed.

## Affected predicates

| Predicate | Core value | Independent assessment |
|---|---|---|
| R1: the sequence preserves installed preparation, admission and traversal ownership/order | `satisfied` | Lines 279–307 now show the installed run owner calling Product preparation/resolution, ABG invocation admission, execution-basis admission and traversal opening before HoG. The adjacent note identifies this as the admitted path and preserves the actual prefix on preparation, admission or opening refusal. |
| R2: attempted admission and later receipt/output/finalization failure conserve different facts | `satisfied` | Lines 320–339 reserve unadmitted residue for a refusal establishing no successor, distinguish unknown admission, and route failures after admission through `PostAdmissionFailure`, conserving the actual successor and physical facts. A refusal with admitted diagnostic events retains that successor. |
| R2: physical close, usable handoff, outer receipt validation and later reopen remain distinct | `satisfied` | Direct and held finalizer failures have explicit routes. `ClosedHandoff` can still be followed by receipt/output failure. The prose conserves a physical close that occurred before a receipt became invalid/unavailable and forbids inferring successful handoff, rollback or permission to rerun from missing evidence. Fresh read still requires exact reopen and reconstruction. |
| The correction preserves the immediate K05/K09 and source-path joins | `satisfied` | K05's execute-once-then-check contract and K09's held-versus-closed resource law are unchanged and now agree with both views. The unchanged path table retains the same owner order. No new runtime state machine, constructor or semantic authority is introduced. |

For R1, I directly checked `owner_bindings/run_invocation.ts:1321`
(`ProductRunInvocationPort.prepare`), its refusal at line 1341,
`admitExactInvocation` at line 1375, `admitExecutionBasis` at line 1488,
`openTraversalScope` at line 1535, and `executeGraphTraversalEffect` at line
1599. The prepared resolution is supplied through these joins.
`product/run_invocation_operation.ts:490` resolves the Product execution
selection and returns preparation refusal before traversal if it is not
loaded. The corrected projection matches this operation; HoG's later term
resolution is explicitly distinct.

For R2, `shared/static_definition_bindings.ts:151` and line 271 execute
owners before subsequent receipt and output checks. The run owner's
`finish` calls `completeAbgEventResource` with its computed final prefix.
`abg/definition_event_resource.ts:159` preserves the held-completion versus
close distinction, while `closeAbgEventResource` at line 363 performs the
physical close and constructs the enclosing receipt.

The closer inspection of `abg/event_store.ts:2513` also supports the corrected
distinction: it constructs and validates the owner close handoff, releases
durable ownership, then returns that handoff. Outer receipt/output checks can
still fail afterwards. Reacquisition in `definition_event_resource.ts:330`
validates the handoff and later checks the reopened prefix. The diagram's
`ClosedHandoff` state therefore does not assert successful validation of the
entire enclosing return or successful future reopen. The explicit later
failure edge and accompanying prose prevent that inference. A partial
finalizer failure retains known physical facts and uncertainty through the
post-admission recovery route.

No residual counterexample to R1/R2 or their immediate joins was found.

## Conserved results and remaining obligations

The initial review's satisfied bounded predicates survive on unchanged bytes:
Product scope and design-first routing; concrete K01–K12 capability and
D01–D11 consumer/consolidation decisions; source-supported D02–D04 candidate
factorizations within their declared domains; explicit foundation/domain
distinctions and E01–E04 stops; and separation of design acceptance from
performed proof and actual benefit.

In particular, D04's established correspondence remains bounded to its
existing closed unique key lists and production domains, including
JSON-parsed codec inputs. It does not establish equivalence for arbitrary
descriptor-bearing objects. E01 raw structural-domain decisions, E02 broader
equality/cache mechanisms, E03 process extraction and E04 filesystem/archive
algorithm choices remain unchanged stops for dependent work.

V1–V7 execution and assessment, actual implementation equivalence and
retirement, runtime benefit, installed behavior, exhaustive Prime,
qualification and release were not performed or established here. The
correction neither satisfies those obligations by documentation nor makes
them prerequisites to this bounded design acceptance.

## Closed result and recommendation

**`satisfied`** on successor freeze
`476aa57a3b0660f05a4a84f8c238a0095c1c4daaeb8bd9ac753dfa3e858c659f`
for the selected predicate:

> Coherent source-grounded common capability library design with concrete
> contracts/compositions/consumer/consolidation decisions, explicit obligations
> and bounded unresolved stops, design-first routing, and conserved Product,
> owner and authority relations.

This combines the closed affected predicates above with the conserved
bounded results of the initial review. Recommend that root Executive accept
this exact design subject with its explicit residuals, then select later
realization and proof under their existing authority. Acceptance remains the
Executive/owner decision; this result does not claim the later outcomes.
