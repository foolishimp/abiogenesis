# M03 Requirements Algebra Route Interface Design

**Status**: Draft For T-164
**Date**: 2026-06-28
**Purpose**: Define the clean public interface pattern for the T-164
requirements-algebra route.

## Source Authority

- `specification/GOALS.md`
- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `CLAUDE.md` section 4, GTL / ABG Boundary
- `M03_REQUIREMENTS_ALGEBRA_DERIVATION.md`
- `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md`
- `.ai-workspace/tickets/active/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md`

## Design Position

T-164 is a route interface design, not a new requirements-algebra ontology.

The existing T-162 symbols remain authoritative. The public route supplies a
stable library-style interface over those symbols plus the six route-1 gaps.
It must make the F_P / F_D boundary compiler-visible:

- F_D interfaces admit, validate, project, guard, and query closed carriers.
- F_D interfaces do not infer semantic satisfaction, missing requirements,
  residual acceptability, or next action.
- F_P and F_H semantic judgments enter only as admitted event refs or finding
  refs.
- Query interfaces render and join replay truth. They do not invent fold,
  residual, or disposition truth.

The public route is a facade. It must not rename existing symbols into new
carriers or create a second function catalog.

## Interface Families

Use five interface families. Every route interface belongs to exactly one
family and one visibility class.

| Family | Verb prefix | Side effect | Authority | Visibility |
| --- | --- | --- | --- | --- |
| Declaration | `declare_*` | None | GTL declaration law | downstream-public authoring |
| Admission command | `admit_*` / `bind_*` where binding emits event truth | Emits admitted events or typed rejection | ABG event/admission law | ABG-runtime-internal |
| Projection command | `project_*` where runtime truth is emitted | Emits projection events on the traversal path | ABG projection law | ABG-runtime-internal |
| Query | `query_*`, `route_*`, `compile_*`, read-only `project_*` facades | None | replay/query over admitted truth | downstream-public read-only |
| Guard | `assert_*`, `reject_*`, `verify_*` | None | negative proof / non-forgeability | proof-only |

Implementation may keep existing TypeScript camelCase symbol names. Public
facade names may use route-style names only when they reconcile 1:1 to the
existing symbol or to a route-1 new gap.

Downstream consumers may call only declaration and query interfaces. Admission
and projection commands are invoked by ABG runtime/admission code, including the
traversal runner on edge close. A downstream-public API must not construct
requirement fold, residual, or disposition truth.

## Common Carrier Refs

Public APIs must pass typed refs, not free strings.

Illustrative TypeScript shape:

```ts
export type AuthorityRegime = "F_D" | "F_P" | "F_H";

declare const admittedRefBrand: unique symbol;
declare const runtimeScopeBrand: unique symbol;

export interface AdmittedRef<Kind extends string> {
  readonly [admittedRefBrand]: Kind;
  readonly kind: Kind;
  readonly ref: string;
  readonly sourceEventRef: string;
  readonly digest: string;
}

export interface RuntimeScopeRef {
  readonly [runtimeScopeBrand]: "runtime_scope";
  readonly runRef: string;
  readonly graphCallRef: string | null;
  readonly frameRef: string | null;
  readonly continuationRef: string | null;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly spanRef: string;
}

export interface FpFindingRef {
  readonly kind: "fp_finding_ref";
  readonly authority: "F_P";
  readonly findingRef: string;
  readonly admittedEventRef: string;
  readonly sourceDigest: string;
}

export interface FhDecisionRef {
  readonly kind: "fh_decision_ref";
  readonly authority: "F_H";
  readonly decisionRef: string;
  readonly admittedEventRef: string;
  readonly sourceDigest: string;
}

export interface FdProjectionContext {
  readonly authority: "F_D";
  readonly runtimeScope: RuntimeScopeRef;
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}
```

Rules:

- `AdmittedRef` is nominal. The brand is not exported to downstream callers;
  only ABG admission/projection constructors can mint it.
- `RuntimeScopeRef` is nominal. Downstream callers receive it from ABG runtime
  or query context; they do not assemble runtime scope authority from strings.
- `AdmittedRef.digest` is the digest of the admitted event payload or projection
  payload. It is recomputed during resolution and compared with the carried
  value.
- Every command boundary must resolve each `AdmittedRef` against the replay
  event/projection ledger before use. Unknown refs return `unknown_ref`; digest
  mismatches return `forged_ref`.
- A ref without event/digest provenance is not route input.
- An F_P or F_H value must be an admitted ref before F_D projection can consume
  it.
- Boolean closure, path-shape evidence, and arbitrary source truth strings are
  invalid API inputs.

## Result Pattern

Every command or projection returns a closed result union.

```ts
export type RouteRejectionKind =
  | "malformed_input"
  | "unknown_ref"
  | "dangling_ref"
  | "stale_or_superseded"
  | "forged_ref"
  | "semantic_assessment_required"
  | "human_decision_required"
  | "not_ready";

export interface RouteAccepted<T> {
  readonly status: "accepted";
  readonly value: T;
  readonly emittedEventRefs: readonly string[];
  readonly sourceRefs: readonly string[];
}

export interface RouteRejected {
  readonly status: "rejected";
  readonly reason: RouteRejectionKind;
  readonly diagnostics: readonly string[];
  readonly sourceRefs: readonly string[];
}

export type RouteResult<T> = RouteAccepted<T> | RouteRejected;
```

No interface may return implicit success for unknown state. Unknown state is a
typed rejection or typed F_P/F_H pressure.

## Route Interface Map

| Interface | Existing symbol or route-1 gap | Family | Visibility |
| --- | --- | --- | --- |
| `gtl.requirements.declare_requirement` | `constructGtlRequirementDeclaration` | Declaration | downstream-public authoring |
| `gtl.requirements.declare_bundle` | `constructGtlRequirementsAlgebraDeclarationBundle` | Declaration | downstream-public authoring |
| `gtl.requirements.declare_lifecycle_composition` | `GtlRequirementsLifecycleComposition` | Declaration | downstream-public authoring |
| `abg.requirements.admit_declarations` | route-1 new gap over `RequirementEventPayload` and `projectRequirementLedger` | Admission command | ABG-runtime-internal |
| `abg.requirements.route_context_constraint` | `routeContextConstraint` | Query | downstream-public read-only |
| `abg.requirements.compile_edge_environment` | `buildEdgeRequirementEnvironment` | Query | downstream-public read-only |
| `abg.requirements.project_edge_obligations` | `projectRequirements` | Query/projection facade | downstream-public read-only |
| `abg.requirements.project_materialization_targets` | `projectMaterializationTargets` | Query/projection facade | downstream-public read-only |
| `abg.requirements.project_execution_schedules` | `projectExecutionSchedules` | Query/projection facade | downstream-public read-only |
| `abg.requirements.bind_execution_evidence` | route-1 new evidence-event bridge | Admission command | ABG-runtime-internal |
| `abg.requirements.bind_evidence` | `bindRequirementEvidence` | Admission command | ABG-runtime-internal |
| `abg.requirements.project_requirement_fold` | `foldRequirementEvidence` plus assurance closure bridge | Projection command | ABG-runtime-internal |
| `abg.requirements.project_assurance_case` | `projectAssuranceCase` | Query | downstream-public read-only |
| `abg.requirements.project_residuals` | `residualizeRequirementFolds` | Projection command | ABG-runtime-internal |
| `abg.requirements.classify_attenuation` | `classifyRequirementAttenuation` | Query | downstream-public read-only |
| `abg.requirements.resolve_reentry_disposition` | route-1 new `RequirementLifecycleDisposition` projection | Projection command | ABG-runtime-internal |
| `abg.requirements.project_lifecycle_state` | route-1 new joined read model | Query | downstream-public read-only |

Deferred from route 1:

- `abg.requirements.derive_requirement_graph`
- `abg.requirements.refine_goal`

## GTL Declaration Interfaces

GTL declaration APIs are pure constructors. They may reference published route
refs but must not import ABG runtime code.

```ts
export interface GtlRequirementsLifecycleComposition {
  readonly kind: "gtl_requirements_lifecycle_composition";
  readonly compositionRef: string;
  readonly routeRefs: readonly PublishedRequirementRouteRef[];
  readonly sourceDigest: string;
}

export interface PublishedRequirementRouteRef {
  readonly namespace: "abg.requirements";
  readonly routeName: string;
  readonly routeVersion: string;
  readonly contractRef: string;
}
```

Closure guard:

- `gtl/m01` may import GTL contract-law types.
- `gtl/m01` may not import `abg/m03` runtime modules.
- ABG resolves the route refs when interpreting the GTL declaration.

## Admission Command Interfaces

Admission commands are ABG-runtime-internal. Downstream products declare GTL
inputs; ABG admits or rejects them through the runtime/admission path.
Downstream products do not call admission commands directly to create admitted
truth.

### `abg.requirements.admit_declarations`

```ts
export interface AdmitDeclarationsInput {
  readonly bundle: GtlRequirementsAlgebraDeclarationBundle;
  readonly runtimeScope: RuntimeScopeRef;
  readonly authorityRefs: readonly AdmittedRef<"authority_snapshot">[];
}

export interface AdmitDeclarationsOutput {
  readonly admittedRequirementEventRefs: readonly AdmittedRef<"requirement_event">[];
  readonly ledgerRef: AdmittedRef<"requirement_ledger_projection">;
}
```

F_D may validate:

- closed bundle shape,
- duplicate ids,
- dangling refs,
- invalid spans,
- unknown relation kinds,
- source digest presence.

F_D may not:

- author missing requirements,
- refine requirement meaning,
- infer semantic satisfaction from text.

### `abg.requirements.bind_execution_evidence`

```ts
export interface BindExecutionEvidenceInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly requirementProjectionRefs: readonly AdmittedRef<"requirement_projection">[];
  readonly runtimeEvidenceEventRef: AdmittedRef<"runtime_evidence_event">;
  readonly evidenceRole: RequirementEvidenceRole;
  readonly fpFindingRefs: readonly FpFindingRef[];
  readonly fhDecisionRefs: readonly FhDecisionRef[];
}
```

Forbidden inputs:

- `admitted: boolean`,
- filesystem path as evidence authority,
- pass/fail status as semantic closure,
- arbitrary `sourceAbgTruthRefs`.

## Projection Command Interfaces

Projection commands emit route truth on the runtime path. They are not
query-only helpers and they are not downstream-public APIs. The traversal
runner or ABG runtime projection path invokes them when an edge closes or when
runtime evidence is admitted.

### `abg.requirements.project_requirement_fold`

```ts
export interface ProjectRequirementFoldInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly evidenceBindingRefs: readonly AdmittedRef<"requirement_evidence_binding">[];
  readonly assuranceClosureDecisionRef: AdmittedRef<"assurance_closure_decision">;
  readonly fpFindingRefs: readonly FpFindingRef[];
  readonly fhDecisionRefs: readonly FhDecisionRef[];
}

export interface ProjectRequirementFoldOutput {
  readonly foldRefs: readonly AdmittedRef<"requirement_fold_projection">[];
}
```

F_D may fold only over admitted evidence bindings and admitted assurance
closure refs. It cannot create the semantic closure judgment.

### `abg.requirements.project_residuals`

```ts
export interface ProjectResidualsInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly foldRefs: readonly AdmittedRef<"requirement_fold_projection">[];
  readonly priorResidualRefs: readonly AdmittedRef<"requirement_residual_projection">[];
}
```

Every residual must carry source fold refs, remaining span, pressure class, and
owner surface. A residual without source fold refs is rejected.

### `abg.requirements.resolve_reentry_disposition`

```ts
export interface ResolveReentryDispositionInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly residualRefs: readonly AdmittedRef<"requirement_residual_projection">[];
  readonly continuationRefs: readonly AdmittedRef<"continuation_transition">[];
  readonly reentryRefs: readonly AdmittedRef<"graph_reentry_point">[];
  readonly policyRefs: readonly AdmittedRef<"runtime_policy">[];
  readonly fhDecisionRefs: readonly FhDecisionRef[];
}
```

`RequirementLifecycleDisposition` is a named query projection over these refs.
It is not a writable carrier and not a controller.

`policyRefs` are admitted runtime-policy refs. They are resolved and digest
checked like every other `AdmittedRef`. Inert labels may appear only in output
diagnostics or read models; they may not influence disposition.

## Query Interfaces

Queries are read-only replay projections. They may join source truth; they may
not invent source truth.

```ts
export interface ProjectLifecycleStateInput {
  readonly runtimeScope: RuntimeScopeRef;
  readonly requirementScopeRefs: readonly AdmittedRef<"requirement_term">[];
}

export interface ProjectLifecycleStateOutput {
  readonly environmentRef: AdmittedRef<"edge_requirement_environment">;
  readonly obligationRefs: readonly AdmittedRef<"requirement_projection">[];
  readonly materializationTargetRefs: readonly AdmittedRef<"requirement_projection">[];
  readonly executionScheduleRefs: readonly AdmittedRef<"requirement_projection">[];
  readonly evidenceBindingRefs: readonly AdmittedRef<"requirement_evidence_binding">[];
  readonly foldRefs: readonly AdmittedRef<"requirement_fold_projection">[];
  readonly assuranceCaseRefs: readonly AdmittedRef<"requirement_assurance_claim">[];
  readonly residualRefs: readonly AdmittedRef<"requirement_residual_projection">[];
  readonly dispositionRefs: readonly AdmittedRef<"requirement_lifecycle_disposition">[];
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}
```

If no fold source exists, assurance case projection returns `no_evidence`. It
does not return `blocked`.

## Guard Interfaces

Guard APIs are proof helpers and negative-test surfaces. They do not publish
truth.

Required guards:

- reject boolean-only evidence admission,
- reject manual assurance truth refs,
- reject stale predecessor-only closure,
- reject forged event/projection refs,
- reject structurally shaped but unbranded `AdmittedRef` inputs,
- reject branded refs that fail replay-ledger resolution or digest
  recomputation,
- reject GTL-to-ABG runtime imports,
- reject public route names that fail 1:1 symbol reconciliation,
- reject downstream calls to ABG-runtime-internal admission/projection commands,
- reject query-only fold/residual/disposition construction.

## F_P / F_D Boundary Matrix

| Route area | F_D allowed | F_P / F_H required for | Invalid API shape |
| --- | --- | --- | --- |
| declaration | schema, ids, refs, spans, relation kind checks | authored meaning, refinement, ambiguity resolution | generated missing terms from text |
| admission | event envelope admission and replay integrity | semantic intent disambiguation | open payload trusted past ingress |
| environment | deterministic active-scope projection | hidden context inference | inferred context from path names |
| obligation/schedule | project declared obligations and schedules | undeclared decomposition | schedule invented from prose |
| evidence binding | bind admitted evidence event to explicit projection refs | semantic satisfaction judgment | `admitted: true`, path-shape proof |
| fold | consume evidence binding and assurance closure refs | closure meaning, residual meaning | arbitrary `sourceAbgTruthRefs` |
| residual | preserve pressure from fold truth | acceptability / repricing rationale | residual without source fold refs |
| disposition | join residual with ABG continuation/re-entry truth | local semantic next-action ranking | product-local router result |
| lifecycle query | replay and join admitted source refs | new semantic truth | query invents fold/residual/disposition |

## Module Boundary Consequences

The interface may be implemented with internal modules only when each module is
structurally prime:

- `events` is prime if it owns event payload admission shapes.
- `admission` is prime if it owns ingress collapse and typed rejection.
- `projection` is prime if it owns deterministic transforms over admitted
  truth.
- `queries` is prime if it owns read-only replay joins.
- `proof` is prime if it owns negative guards and non-forgeability fixtures.

Directories such as `abg/m03/projection/` or `abg/m03/queries/` require IACS
justification before implementation. They must not exist merely to organize
helpers.

## Non-Closure Conditions

- A public API accepts boolean evidence admission.
- A public API accepts free string truth refs as closure authority.
- A downstream-public API exposes admission/projection commands that can emit
  requirement fold, residual, or disposition truth.
- `AdmittedRef` is structurally constructible by downstream code, or command
  boundaries trust the struct without replay-ledger resolution and digest
  recomputation.
- GTL route declarations import ABG runtime modules.
- A query computes fold, residual, or disposition truth not previously emitted
  on the traversal path.
- `policyRefs` or equivalent disposition-affecting inputs are free strings.
- A facade name lacks 1:1 reconciliation to an existing symbol or route-1 gap.
- F_D code infers requirement meaning, evidence satisfaction, residual
  acceptability, or next action.
- `RequirementLifecycleDisposition` is implemented as writable state or as a
  controller.
- `derive_requirement_graph` or `refine_goal` becomes route-1 closure scope
  without requirement reprice.
