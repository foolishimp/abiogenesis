# M03 ABG.Fn Composition Derivation

**Status**: Active
**Date**: 2026-05-16
**Purpose**: Define the T-134 requirements/design grammar for replay-stable
composition of `F_D`, `F_P`, and `F_H` at GTL/ABG function and edge boundaries.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-RULE.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-POLICY.md`
- `M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md`
- `M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`
- `T-134`

## Position

ABG.Fn composition is the contract that tells ABG how declared regimes interact
for one graph-function, graph-vector, evaluator, rule, or operator boundary.

It is not a new public GTL topology type. It is a runtime-governance contract
bound to existing GTL hosts. The GTL host remains the graph function, graph
vector, evaluator, rule, or operator. ABG admits a selected composition
identity and uses that identity to interpret evidence, carrier admission,
assurance projection, closure, and optimization.

The functional reading is:

```text
declared GTL host + selected composition contract + admitted context
-> selected regime sequence
-> F_P/F_H evidence or judgment
-> F_D closure predicate
-> replay-derived projection under the same composition identity
```

`F_D` owns deterministic closure. `F_P` owns construction, diagnosis, repair, or
ranking attempts. `F_H` owns human or held-out judgment states, including
absentia. F_P and F_H outputs are evidence under the selected composition
identity; they do not become closure law.

## Contract Schema

The first design carrier is `ABGFnCompositionContract`:

```ts
export interface ABGFnCompositionContract {
  readonly kind: "abg.fn_composition";
  readonly version: "1";
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly host: ABGFnHostBinding;
  readonly regimes: readonly ABGFnRegimeBinding[];
  readonly context: ABGFnContextBinding;
  readonly carrier: ABGFnCarrierBinding;
  readonly assurance: ABGFnAssuranceBinding;
  readonly closure: ABGFnClosureContract;
  readonly optimization?: ABGFnOptimizationContract;
}
```

Supporting carriers:

```ts
export interface ABGFnHostBinding {
  readonly graphFunctionRef?: string;
  readonly graphVectorRef?: string;
  readonly evaluatorRef?: string;
  readonly ruleRef?: string;
  readonly operatorRef?: string;
  readonly sourceNodeRefs?: readonly string[];
  readonly targetNodeRef?: string;
  readonly targetSchemaRef?: string;
  readonly owningDeclarationRef?: string;
}

export interface ABGFnRegimeBinding {
  readonly regime: "F_D" | "F_P" | "F_H";
  readonly role:
    | "construct"
    | "observe"
    | "validate"
    | "gate"
    | "repair"
    | "rank"
    | "escalate"
    | "close"
    | "absentia";
  readonly authority: "closure" | "evidence" | "judgment" | "advisory" | "absent";
  readonly order: number;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly consumedFieldRefs: readonly string[];
}

export interface ABGFnContextBinding {
  readonly standardsRefs: readonly string[];
  readonly requirementRefs: readonly string[];
  readonly designRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly replayPolicyRef: string;
}

export interface ABGFnCarrierBinding {
  readonly sourceCarrierRefs: readonly string[];
  readonly targetCarrierRef?: string;
  readonly targetCarrierContractRef?: string;
  readonly targetCarrierContractDigest?: string;
  readonly payloadLedgerProjectionRef?: string;
  readonly closurePreconditionRefs: readonly string[];
}

export interface ABGFnAssuranceBinding {
  readonly edgeAssuranceContractRef?: string;
  readonly edgeAssuranceContractDigest?: string;
  readonly requiredEvidenceRefs: readonly string[];
  readonly assuranceProjectionRef?: string;
  readonly assuranceClosureDecisionRef?: string;
}

export interface ABGFnClosureContract {
  readonly closureFunctionRef: string;
  readonly closureRegime: "F_D";
  readonly requiredEvidenceRefs: readonly string[];
  readonly rejectionEvidenceRefs: readonly string[];
  readonly replayProjectionRef: string;
  readonly closureEventKindRef: string;
}

export interface ABGFnOptimizationContract {
  readonly sourceCompositionRef: string;
  readonly sourceCompositionDigest: string;
  readonly deterministicReplacementRef: string;
  readonly positiveEquivalenceCaseRefs: readonly string[];
  readonly negativeEquivalenceCaseRefs: readonly string[];
  readonly equivalenceProjectionRef: string;
  readonly invalidationPolicyRef: string;
}
```

## Declaration Sites And Precedence

The selected composition binding resolves in this order:

1. `GraphVector.declarations["abg.fn_composition"]`
2. `GraphFunction.declarations["abg.fn_composition"]`
3. `Job.policy_hooks["abg.fn_composition"]`
4. `Role.policy_hooks["abg.fn_composition"]`
5. `Module.policy_hooks["abg.fn_composition"]`
6. visible defaults config or published template

A present malformed declaration fails closed. Absence is lawful only if the
boundary is not closure-capable/mixed-regime/optimized/construction-substrate,
or if a visible default or template supplies the effective contract.

No null contract is lawful for a boundary that requires composition truth.

## Host Binding

Vector-local declarations have highest authority and must prove they belong to
the vector that hosts them.

ABG must check:

- `host.graphVectorRef` matches the host vector ref;
- source node refs match the vector source;
- target node ref matches the vector target;
- target schema ref matches the vector target schema where declared;
- target carrier contract ref and digest match the selected carrier binding
  where required;
- edge assurance contract ref and digest match the selected assurance binding
  where required.

Hook-local composition declarations are not independent authority. They must
bind back to the owning graph function, vector, evaluator, rule, or operator.

## Regime Authority

`F_D` may validate, gate, project, and close when the closure contract names an
`F_D` predicate and required evidence is admitted.

`F_P` may construct, repair, diagnose, rank, summarize, or supply evidence. It
may propose close disposition only as evidence. It cannot emit runtime events,
write ledgers, select graph vectors, or close a traversal.

`F_H` may be present, deferred, or absentia. F_H absentia is a declared state,
not a missing-worker exception. Human judgment must still be admitted by ABG
before projection or routing.

## Context, Carrier, And Assurance Binding

Standards and policy context are contract inputs. Replay with a different
standards or policy identity is non-equivalent unless a declared migration or
supersession policy admits it.

Target carrier binding remains the target-shape contract. ABG.Fn composition is
the regime and closure context that says why the target carrier matters for the
host boundary. The selected target carrier ref and digest stay visible.

Edge assurance remains the evidence/gain/residual contract for a traversal.
ABG.Fn composition is the surrounding regime contract that says how assurance
evidence participates in closure. The selected assurance ref and digest stay
visible.

## Replay And Defaults

Replay derives selected composition from admitted declarations, admitted
defaults, admitted config identity, and runtime events. Projection shall not
consult `process.cwd()`, current filesystem discovery, prompt text, parser
convention, or code fallback objects.

Generic templates may exist, but only as visible configuration or published GTL
assets. Missing, malformed, or digest-mismatched templates fail closed for
boundaries that require composition truth.

## Optimization

Optimizing a prior F_P or mixed-regime path into an F_D path is a composition
preserving transformation:

```text
source composition identity
-> deterministic replacement
-> positive equivalence cases
-> negative equivalence cases
-> invalidation policy
-> admitted optimized composition
```

The optimized path must preserve source lineage. A faster deterministic helper
is not enough.

## Deferred Implementation Map

T-134 closes requirements and design only. Implementation is owned by the
dependent substrate tickets:

| Surface | Owning ticket |
|---|---|
| vector-local effective regime resolution | `T-135` |
| observed-state and config admission for replay | `T-136` |
| F_D severity and consumed-field routing | `T-138` |
| installed construction runner consumption | `T-128` |
| overlay-frame fire/terminate/foldback semantics | `T-137` |
| construction pressure package and downstream deletion proof | `T-139` |

## Module-Derived Proof Map

| Proof lane | Design source | Required assertion |
|---|---|---|
| declaration precedence | this derivation and IACS | vector-local composition beats wider defaults |
| host binding | this derivation and IACS | wrong vector/source/target/schema fails closed |
| regime authority | `REQ-R-ABG3-FN-COMPOSITION` | only F_D can close |
| F_H absentia | this derivation | absentia is declared evidence state, not worker failure |
| carrier binding | target-carrier design + this derivation | target carrier digest mismatch remains non-closing |
| assurance binding | edge-assurance design + this derivation | assurance findings are interpreted under selected composition identity |
| replay purity | this derivation | replay projection uses admitted config/events, not cwd or lazy filesystem reads |
| optimization | this derivation | positive and negative equivalence cases are required |
