# T-287 Registered Graph Selection: Native Realization

Status: accepted bounded HOW. T-287 and its execution record own activation,
implementation, evidence and acceptance state.

Authority: specification/PRODUCT.md, GraphFunction purpose and Framed Evaluation
And Graph Consequence; T287_REGISTERED_GRAPH_SELECTION_DESIGN.md; immutable
STDO v2.5.1-rc.1; ABI5_PROJECT_REFERENCE_FRAME_BASIS.md, Product/Design/Owner and
End-To-End Interface Integration. Native calls bind their actual selected frame
and exact source/companions through the current run-environment declaration.

Accepted technical proposal SHA-256:
`73ac3f97de4ffa4991704a70e06e23a23b02c270b57646e701868178c29cbbfb`.
[Independent review](../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/native-selection-plan-review.md)
and [Executive disposition](../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#s3-design-acceptance)
bind acceptance. Historical proposal and read-subject hashes are retained there.
Paths below are relative to the TypeScript tenant. This HOW adds no Product law
or independent implementation/execution grant.

## Selected realization

One ordinary F_P selector CCall judges the supplied task and observations against
the purposes and contracts of its permitted registered choices. Its native raw
answer identifies a permitted graph or an explicit gap. A pure binding operation
copies the admitted definition identity and exact child input into the existing
`registered_graph_choice`. ABG conserves that raw-answer relation before result
admission; the existing result, judgment, route, fixed workflow child and normal
foldback then execute unchanged.

There are two missing relations, not a missing planner:

1. **Declared selector to owned native context.** Generic prepared F_P dispatch
   already exists in `implementation/leaf_invocation_port.ts:637`. However,
   `gtl/stdo_run_environment.ts:103` recognizes only specialized native families;
   current run-environment validation consequently rejects an ordinary selection
   leaf. `hog/ccall_lifecycle.ts:454` only constructs the generic native basis for
   its existing worksite families. `abg/actor_process.ts:700,796` then dispatches
   that basis to worksite assembly, while requiring owned assembly whenever the
   invocation selects a run environment. A naked consumer prompt cannot repair
   this correspondence.
2. **Observed raw choice to admitted choice.** Generic F_P transport/result
   admission permits an implementation-owned transformation from raw response
   to result. Existing specialized semantic callers add a correspondence check
   at `abg/c_call_outcome.ts:994`. The native selector needs an equally narrow
   check: an observed A answer cannot become a B candidate merely because B is
   also permitted. This is structural conservation, not a second suitability
   judgment.

## Minimum declaration and carrier

Add computational role `selector` to the **current** run-environment role schema.
Its frameRefs bind the selected Executive frame; the role name itself grants
neither authority nor global context. Keep historical STDO declarations unchanged.
Recognize this role only after finding the exact `registered_selection`
application at the F_P source locus, its evaluator/implementation correspondence
and expected choice output contract. Use the same classifier in validation, HoG
and assembly. An unrelated input with choice-looking fields remains ordinary
data. The raw Public owner imports `RUN_ENVIRONMENT_SCHEMA` directly, so this
change has one current schema owner rather than another copied union.

Use one small native task profile, owned in a new
`code/src/product/registered_selection_native.ts`, for this explicit library
realization. It contains the semantic task, referenced supplied observations and
their qualifications, declared required-support references, and **one exact
common child input** `{contractRef,value}`. Worker actor/binding coordinates use
the existing admitted instruction-envelope convention. The instruction contract
is the selected CCall's input contract. The raw response contract is an exact
published contract named through the existing `abg.raw_result_contract`
declaration; the final leaf result remains the existing choice contract. The
renderer is this owned profile, not caller-supplied prompt text.

For the bounded S3 fixture, observations are explicit current request facts:
the record being processed and the recipient's stated requirements, scoped to
that admitted input. They are not claims about filesystem state. The input
reference/digest supplies their immutable occurrence basis; the prompt preserves
their supplied-fact qualification. No new observation/freshness system is needed.
If required support is absent, preserve that gap. Workspace-currentness claims
would require the existing applicable observation owner and are outside this
fixture's claim.

Raw response is deliberately compact:

```text
selected: {disposition, graphFunctionRef, reason, evidenceRefs}
gap:      {disposition, reason, missingSupportRefs, evidenceRefs}
```

Its provider JSON schema is a closed root object with disposition, reason and
evidenceRefs required; the domain-constrained graphFunctionRef and
missingSupportRefs carry explicit selected-only/gap-only descriptions. This
provider shaping permits both outcomes without fixing the expected answer. The
strict raw branch validator and shared completion/admission binder enforce the
exact selected or gap fields above, rejecting branch-inappropriate fields rather
than stripping them. Evidence/support references resolve within the declared
input/context domain. Unknown references, extra fields and malformed answers
remain refusals. This two-layer correspondence accommodates the configured
provider's prohibition on top-level schema unions; it changes no raw answer or
admitted choice semantics. It copies graphFunctionRef's exact admitted
definitionDigest and the task's unchanged child input into the shared final
choice. The model calculates no identities and authors no replacement input.
No fallback choice, coercion, default, repair, semantic ranking or silent retry
is permitted. This common-input realization is sufficient for S3; it does not
limit S2's broader admitted typed-input relation.

## Assembly and admission

Reuse `authenticateNativeInstructionAssemblyBasis` in `abg/execution_basis.ts`:
it already authenticates publication, Program, materialization, CCall, selected
implementation, input and prefix. Reuse `projectRunEnvironmentRoleEvidence` in
`abg/stdo_environment.ts:284` for exact frame source slices, policy, context
selectors and actual corpus access evidence. Do not revive the historical RC7
pilot's declaration or Public call shape.

Factor the permitted-target projection out of the existing pure
`gtl/registered_selection.ts` relation so prompt assembly and route resolution
use the same application/edge/target domain. Resolve its definitions from the
existing declarationGraphFunctions and admitted definition-digest projection;
do not introduce another catalogue. Exact definitions supply purpose,
conditions-for-use, input/result and effect contracts. Purpose neither grants
permission nor establishes fulfillment. A mismatch or unresolved required
definition is a pre-dispatch refusal, never an invented capability.

The selector assembly renders only these declared sections, with a manifest of
source identities, qualifications, inclusion and byte/digest accounting:

- Executive role/frame source, selected policy and criteria;
- actual permitted graph purposes, conditions and relevant contract material;
- current task, supplied observations, required support and exact proposed input;
- admitted relevant evidence, declared access limits and choice/gap response.

The existing context selectors suffice: source material and active binding
semantics, plus admitted execution evidence when that evidence is actually
selected. No new semantic selector language is proposed. Source/contract bodies
must be supplied when needed or resolvable through admitted access; bare
inaccessible locators are insufficient. Unknown required content, stale basis,
unsupported context or a declared bound overflow retains the existing typed
assembly refusal. Semantic insufficiency remains F_P's explicit gap.

Public acquisition data is excluded. In particular, Root measured a
16,374,018-byte installed request containing 15,985,959 bytes of catalogue
readinessBasis. Neither that body nor an all-catalogue/publication/graph snapshot
belongs in selector context. The assembly retains selected material and existing
identity references, not duplicated full definitions. Prompt size is reported
separately from Public request size.

One new selector branch in the existing assembly owner reuses its plan/envelope/
manifest helpers. A declaration-first native dispatcher routes selector versus
existing worksite branches; actor preparation and standalone dispatch use the
same dispatcher. Actor supervision, exact request/input/occurrence checks,
transport admission and artifact retention remain the existing owners.

The consumer's packaged F_P implementation calls prepareInstructionAssembly,
returns its exact request and completes the observed exchange using the pure
raw-to-choice binder. At `c_call_outcome`, the selector-specific guard projects
the actually observed raw artifact and stored admitted assembly, verifies their
call/input/prompt/transport/consumed-artifact lineage, applies **the same binder**,
and requires canonical equality with the proposed final choice. It checks
applicability before interpreting payload fields. Historical prefix acquisition
and existing publication/declaration access supply authority; no new graph event
copy or event ledger is introduced. S2's resolver then admits target/input, and
its route provenance projector replays that already-admitted binding.

## Owning realization boundaries

| Owner | Necessary change |
|---|---|
| `gtl/stdo_run_environment.ts` | Current selector role and exact application-bound classification; preserve historical roles. |
| `gtl/registered_selection.ts` | Share its existing permitted-target projection with native assembly; retain S2 resolution law. |
| `product/registered_selection_native.ts` and its normal export | Small task/raw schema and pure identity/input binder; no second final choice contract. |
| `abg/instruction_assembly.ts` | Selector assembly, common native dispatcher and raw-choice correspondence helper. |
| `abg/actor_process.ts` | Use that dispatcher in preparation and standalone verification; retain supervision. |
| `hog/ccall_lifecycle.ts` | Construct existing authenticated native basis for the declared selector family. |
| `abg/c_call_outcome.ts` | Apply the declaration-first observed-response/result equality guard. |
| External fixture and focused installed test/support | Real F_P implementation/evaluator, current run environment, distinct callable purposes and actual native evidence. |

Reuse `implementation/leaf_invocation_port.ts`, `abg/execution_basis.ts` and
`abg/stdo_environment.ts` without a new transport or context owner. No planned
change to ConstructionComposition, workflow exact-callee checks, C operators,
route event schema, cache owner or recursion. Normal generated outputs and any
necessary raw/current schema correspondence must be named in the S3 grant.
Do not retain a naked-prompt selector path alongside the owned path. Specialized
semantic/worksite paths remain active callers and are not replaced by this work.

## Small real-provider discriminator

Under the selected S3 implementation/live activation, publish
one small native consumer fixture using the existing registered-selection
installed Public harness. Parameterize that fixture loader where necessary;
do not clone a large historical pilot or restore retired APIs. Freeze one ABI
build/archive and consumer artifact, reuse their installation for the cases,
and retain first failures before cleanup.

Use two real, effect-free child GraphFunctions with the same typed record input:
one renders compact structured JSON for machine consumption; the other renders
labelled text for a human reader. Their distinct purposes describe those actual
implementations. Supply natural-language recipient needs and the current record;
do not supply `choice: A/B`, a deterministic classifier, or the expected answer.
Both root paths are selector -> fixed workflow child -> normal result/foldback,
with no model/gap/action/refresh lifecycle.

Authorize three small native attempts through the real configured provider:
machine-consumer case, human-reader case and an unsupported requirement case
that calls for gap. Verify actual transport executable/provider provenance and
retain request, owned assembly/manifest, raw response, result, selected route,
actual child/input and closure. `closed_prompt_proof` is appropriate because all
required semantic material is supplied and no tool discovery is claimed. This
is real inference, not a fixed echo process or fabricated worker transcript.
Use fresh installed Public result/replay reads for completed choices and gap.

Focused mechanical negatives establish refusal before dispatch/child launch:
missing role/source or stale binding; out-of-domain raw reference or malformed
answer; and a completion that changes observed A into otherwise permitted B or
changes bound input. Keep the undeclared choice-shaped-data negative. These
controlled tests do not count as additional native suitability cases. Inspect
retained native reasoning against the declared purposes, frame and observations;
schema success alone cannot establish suitability. Preserve an unexpected real
answer as a failed semantic discriminator rather than changing the fixture to
make it pass.

Report setup, provider, framework execution and fresh-read timings separately,
with prompt/context and Public request byte counts. Investigate the cause of
more than ten seconds of pure framework work; do not treat that as a provider
deadline. This bounded result would establish actual F_P use of the registered
choice path for these observations. It would not establish broad Executive
competence, workspace-currentness reasoning, adaptive recursion, graph generation,
PC05-11 closure or whole-Product qualification. No further Product decision is
required by this proposal; realization and live authorization remain Executive's
next disposition.

