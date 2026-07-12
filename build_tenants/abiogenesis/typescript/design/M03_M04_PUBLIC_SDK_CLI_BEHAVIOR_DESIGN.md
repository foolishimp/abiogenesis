# M03-M04 Public SDK And CLI Behavior Design

**Status**: Retrospective three-view design blocked
**Date**: 2026-07-12
**Checkpoints**: `b445eb1`, `779eb07`, and `28da030` (`T-223` public SDK,
CLI, operation-correlation, and live-preflight path)
**Method authority**: `specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md` section 5E
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

## Boundary

- **Design verdict**: `blocked` for the complete `catalog.invoke` path.
  The thin SDK/CLI adapter subset remains a candidate for independent axiom
  review, but its runtime dependencies are not accepted
- **Owning modules**: `M04-app-bootstrap` for the public SDK and CLI adapter;
  `M03-engine-kernel` for catalog admission, selection, GraphCall, traversal,
  effects, events, continuation, result, replay, and closure truth
- **Requirements**: `PRODUCT.md` Public Operator Product;
  `REQ-P-PUBLIC-CONTRACTS-003`, `-009`, `-010`, and `-014`;
  `REQ-P-CATALOG-007`, `-014`, and `-015`; `REQ-R-ABG3-EVENTS`;
  `REQ-R-ABG3-PROJECTION-011` and `-019`
- **Ticket or intake**: completed `T-223`, public SDK and CLI checkpoint
- **Code scope**:
  `code/src/app/m04/public_sdk/`, `code/src/app/m04/public_cli/`,
  `code/src/bin/abg.cli.ts`, and the M03 public catalog invocation and
  projection entries they consume, including node capability factories,
  executable-command admission, live preflight, and provenance construction
- **Dependencies**: admitted public operation contracts, exact workspace and
  product binding, M03 runtime catalog, M03 start-to-iterate runner, canonical
  event admission and replay projection; the separately blocked F_P output
  admission design; the blocked instruction-protocol design; and the compiled
  execution handoff
- **Explicit exclusions**: the remaining 23 operations in the 36-operation 5.0
  catalog; node-type and overlay application; a CLI-owned loop; a CLI-owned
  worker or plugin; a second event reader; generic resume and F_H mutation;
  batch, recursion, or nested-workflow construction by M04

This is a retrospective behavioral review of an already completed checkpoint.
Acceptance is limited to the adapter boundary shown below. It is not a finding
that the complete 5.0 public operator product is implemented.

## Domain Model

```mermaid
classDiagram
  direction LR

  class PublicOperationContract {
    <<prime authoritative>>
    +operationId
    +requestSchemaRef
    +resultSchemaRef
    +refusalSchemaRef
    +exitMap
  }
  class PublicOperationInvocation {
    <<prime public ingress>>
    +operationId
    +workspaceRef
    +request
    +actorRef
  }
  class NativeCliAdapter {
    <<M04 adapter>>
    +parse declared syntax
    +render public result
    +map declared exit
  }
  class PublicSdkBoundary {
    <<M04 boundary>>
    +invoke typed operation
  }
  class M04OperationAdmission {
    <<M04 admission>>
    +admit envelope and request
  }
  class M04WorkspaceProductContext {
    <<authoritative delivery-context carrier>>
    +workspaceManifest
    +resolvedLock
    +workspaceBinding
    +installedProducts
  }
  class M04WorkspaceContextBoundary {
    <<M04 admission and effect boundary>>
    +resolve exact context
    +perform declared delivery operation
  }
  class HostInvocationDescriptor {
    <<subordinate data>>
    +catalogBasisRef
    +sessionViewRef
    +graphFunctionHandle
    +inputRef
  }
  class TransportSteering {
    <<admitted operator input>>
    +agent
    +profile
    +model
    +timeoutMs
  }
  class BoundAbgRuntimeProfile {
    <<installed product truth>>
    +standardPluginRefs
  }
  class ExecutableCommandAdmission {
    <<M04 environment admission>>
    +resolve absolute or PATH command
    +require executable bit
  }
  class OperatorCapabilityFactory {
    <<M04 effect factory>>
    +construct live capability from admitted steering
  }
  class LiveCapabilityBinding {
    <<prime runtime capability input>>
    +pluginCapabilities
    +availableLivePluginRefs
  }
  class CapabilityProvenance {
    <<subordinate admitted provenance>>
    +capabilityRef
    +capabilityDigest
    +executionContractDigest
  }
  class CatalogInvocationPreflight {
    <<M04 admission boundary>>
    +resolve required factories
    +require execution equivalence
    +confine plugin refs to bound profile
  }
  class RegistrySessionView {
    <<M03 authoritative selection bound>>
    +allowedEntryRefs
  }
  class M03CatalogRuntime {
    <<M03 interpreter boundary>>
    +admit catalog basis
    +select and materialize GraphFunction
    +open GraphCall and CCall
  }
  class GtlModule {
    <<GTL publication>>
    +moduleId
  }
  class GraphFunction {
    <<GTL callable carrier>>
    +graphFunctionRef
    +inputRefs
    +outputRefs
  }
  class Graph {
    <<GTL constructive body>>
    +graphId
  }
  class InputNode {
    <<GTL node>>
    +schemaRef
  }
  class OutputNode {
    <<GTL node>>
    +schemaRef
  }
  class GraphVector {
    <<GTL transition>>
    +vectorId
    +sourceRef
    +targetRef
  }
  class FnCompositionDeclaration {
    <<GTL declaration>>
    +contractRef
    +closureContractRef
  }
  class PolicyEffectBinding {
    <<GTL declaration>>
    +stageRole
    +regime
    +pluginRef
    +policyRefs
  }
  class ExecutionBasis {
    <<M03 prime runtime carrier>>
    +basisId
    +compiledExecutionDeclarations
  }
  class GraphCall {
    <<M03 prime runtime carrier>>
    +graphCallId
  }
  class CCall {
    <<M03 effect spine>>
    +cCallRef
    +stageRole
    +fibre
  }
  class DeclaredEffectHandler {
    <<effect edge>>
    +one selected interior
  }
  class RawEffectOutput {
    <<untrusted F_P data>>
  }
  class ResponseAdmission {
    <<M03 admission boundary>>
  }
  class AdmittedResultFact {
    <<M03 subordinate fact>>
  }
  class CanonicalRuntimeEventLog {
    <<M03 authoritative truth>>
    +ordinal events
  }
  class RuntimeEventAdmissionBoundary {
    <<M03 truth-write boundary>>
    +admit and append canonical events
  }
  class AssuranceProjection {
    <<M03 read model>>
  }
  class AssuranceProjectionBoundary {
    <<M03 replay boundary>>
    +derive total assurance
  }
  class ContinuationTransition {
    <<M03 read model>>
    +retry | yield | human_gate | block | close
  }
  class ContinuationProjectionBoundary {
    <<M03 replay boundary>>
    +derive continuation or terminal transition
  }
  class M03EventProjection {
    <<M03 public read model>>
    +result
    +replay
  }
  class PublicRuntimeProjectionBoundary {
    <<M03 replay boundary>>
    +derive public result and replay
  }
  class HumanGateStop {
    <<typed held truth>>
    +subjectRef
  }
  class DeferredFhAct {
    <<deferred public mutation>>
    +approve | assess | answer
  }
  class PublicOperationResult {
    <<prime public outcome>>
    +disposition
    +exitClassification
    +value or reasons
  }
  class DeferredPublicOperations {
    <<deferred family>>
    +remaining 23 operations
  }

  PublicOperationContract "1" *-- "1" PublicOperationInvocation : admits
  NativeCliAdapter --> PublicSdkBoundary : delegates
  NativeCliAdapter --> PublicOperationContract : derives grammar and exits
  PublicSdkBoundary --> M04OperationAdmission : submits
  M04OperationAdmission --> PublicOperationInvocation : produces admitted
  PublicSdkBoundary --> M04WorkspaceContextBoundary : requests exact context
  M04WorkspaceContextBoundary --> M04WorkspaceProductContext : produces
  PublicSdkBoundary --> CatalogInvocationPreflight : requests for catalog invoke
  CatalogInvocationPreflight --> TransportSteering : admits
  CatalogInvocationPreflight --> BoundAbgRuntimeProfile : confines to
  CatalogInvocationPreflight --> OperatorCapabilityFactory : resolves required refs
  OperatorCapabilityFactory --> ExecutableCommandAdmission : checks command
  OperatorCapabilityFactory --> LiveCapabilityBinding : constructs
  LiveCapabilityBinding "1" *-- "1" CapabilityProvenance : projects exact identity
  CatalogInvocationPreflight --> LiveCapabilityBinding : compares execution equivalence
  CatalogInvocationPreflight *-- HostInvocationDescriptor : derives admitted descriptor
  HostInvocationDescriptor --> RegistrySessionView : binds
  PublicSdkBoundary --> M03CatalogRuntime : calls
  GtlModule "1" *-- "0..*" GraphFunction : publishes
  GraphFunction "1" *-- "1" Graph : owns inline body
  Graph "1" *-- "1" InputNode : contains
  Graph "1" *-- "1" OutputNode : contains
  Graph "1" *-- "1" GraphVector : contains
  GraphVector --> InputNode : source
  GraphVector --> OutputNode : target
  GraphFunction "1" *-- "1" FnCompositionDeclaration : declares
  FnCompositionDeclaration "1" *-- "1..*" PolicyEffectBinding : orders
  M03CatalogRuntime --> RegistrySessionView : narrows selection
  M03CatalogRuntime --> GtlModule : admits selected publication
  M03CatalogRuntime --> GraphFunction : selects callable only
  M03CatalogRuntime --> ExecutionBasis : constructs
  ExecutionBasis --> GraphFunction : binds
  ExecutionBasis --> Graph : materializes
  M03CatalogRuntime *-- GraphCall : owns
  GraphCall "1" *-- "0..*" CCall : owns spines
  CCall --> PolicyEffectBinding : follows selected declaration
  M03CatalogRuntime --> DeclaredEffectHandler : invokes interior under CCall identity
  DeclaredEffectHandler --> RawEffectOutput : returns
  RawEffectOutput --> ResponseAdmission : submits
  ResponseAdmission --> AdmittedResultFact : may produce
  AdmittedResultFact --> M03CatalogRuntime : submits for event construction
  M03CatalogRuntime --> RuntimeEventAdmissionBoundary : submits runtime facts
  RuntimeEventAdmissionBoundary --> CanonicalRuntimeEventLog : appends admitted events
  AssuranceProjectionBoundary --> CanonicalRuntimeEventLog : replays
  AssuranceProjectionBoundary --> AssuranceProjection : produces
  ContinuationProjectionBoundary --> CanonicalRuntimeEventLog : replays
  ContinuationProjectionBoundary --> AssuranceProjection : consumes
  ContinuationProjectionBoundary --> ContinuationTransition : produces
  ContinuationTransition --> HumanGateStop : may hold
  HumanGateStop ..> DeferredFhAct : requires later typed act
  PublicRuntimeProjectionBoundary --> CanonicalRuntimeEventLog : replays
  PublicRuntimeProjectionBoundary --> M03EventProjection : produces
  PublicSdkBoundary --> M03EventProjection : consumes
  PublicSdkBoundary *-- PublicOperationResult : returns
  NativeCliAdapter --> PublicOperationResult : renders
  PublicSdkBoundary ..> DeferredPublicOperations : excludes
```

The selected callable is not a catalog nameplate. Its Module, GraphFunction,
inline Graph, input and output Nodes, GraphVector, composition declaration,
and policy/effect bindings remain visible before M03 opens a GraphCall. This
view does not claim that the separate C-conformance result is joined to
`ExecutionBasis`; that missing relation is a blocking gap below.

## Execution Sequence

```mermaid
sequenceDiagram
  actor Operator as External operator or agent
  participant CLI as NativeCliAdapter
  participant SDK as PublicSdkBoundary
  participant Admission as M04OperationAdmission
  participant Context as M04WorkspaceContextBoundary
  participant Preflight as CatalogInvocationPreflight
  participant Capability as OperatorCapabilityFactory
  participant Command as ExecutableCommandAdmission
  participant Runtime as M03CatalogRuntime
  participant Response as ResponseAdmission
  participant Handler as DeclaredEffectHandler
  participant EventAdmission as RuntimeEventAdmissionBoundary
  participant Events as CanonicalRuntimeEventLog
  participant Assurance as AssuranceProjectionBoundary
  participant Transition as ContinuationProjectionBoundary
  participant Projection as PublicRuntimeProjectionBoundary

  Operator->>CLI: raw command arguments and serialized request
  CLI->>SDK: construct PublicOperationInvocation from declared grammar
  SDK->>Admission: admit operation envelope and operation-specific request
  alt syntax, envelope, or request is malformed
    Admission-->>SDK: typed invalid or refusal
    SDK-->>CLI: PublicOperationResult without runtime effect
    CLI-->>Operator: render declared error and exit 2 or 1
  else request is admitted
    Admission-->>SDK: admitted PublicOperationInvocation
    SDK->>Context: resolve exact workspace, lock, binding, products, and catalog
    alt operation is read.result or read.replay
      SDK->>Projection: project from admitted canonical event bytes
      Projection-->>SDK: typed result or replay projection
    else operation is catalog.invoke
      SDK->>Preflight: required capability refs, admitted steering, and bound ABG profile
      alt no live capability is required
        Preflight-->>SDK: HostInvocationDescriptor without live plugin capabilities
      else required factory or steering is absent
        Preflight-->>SDK: missing_capability before GraphCall
      else capability construction requested
        Preflight->>Capability: workspace, archive root, and admitted steering
        Capability->>Command: admit selected executable command
        alt command unavailable or capability construction fails
          Command-->>Capability: executable-command refusal
          Capability-->>Preflight: typed capability-construction failure
          Preflight-->>SDK: preflight_failure before GraphCall
        else executable capability exists
          Command-->>Capability: executable command admitted
          Capability-->>Preflight: LiveCapabilityBinding and provenance projection
          Preflight->>Preflight: require execution-equivalent bindings and profile-confined plugin refs
          alt bindings diverge or a plugin ref is outside the bound profile
            Preflight-->>SDK: preflight_failure before GraphCall
          else capability preflight admits
            Preflight-->>SDK: HostInvocationDescriptor with capabilities and provenance refs
          end
        end
      end
      alt capability preflight refused
        SDK->>SDK: prepare typed missing_capability or preflight_failure result
      else capability preflight admitted
        SDK->>Runtime: invoke admitted HostInvocationDescriptor
      Runtime->>Runtime: admit session view and select Module-backed GraphFunction
      Runtime->>Runtime: materialize Graph, Nodes, GraphVector, composition, and bindings
      Runtime->>Runtime: construct ExecutionBasis and open GraphCall
      alt selection, structure, basis, or runtime preflight refuses
        Runtime->>EventAdmission: submit typed refusal or blocked runtime events
        EventAdmission->>Events: append admitted refusal truth
      else runtime entry is executable
        Runtime->>Handler: open CCall and issue one declared effect request
        Handler-->>Runtime: raw effect output and evidence refs
        Runtime->>Response: admit selected response against request identities
        alt effect output is malformed or contract-incompatible
          Response-->>Runtime: typed blocked or rejected disposition
          Runtime->>EventAdmission: submit CCall judgment and retry, escalation, or stop events
          EventAdmission->>Events: append admitted non-close truth
        else effect output is admitted
          Response-->>Runtime: admitted artifact or evaluation fact
          Runtime->>EventAdmission: submit payload, evidence, evaluation, and CCall events
          EventAdmission->>Events: append admitted payload truth
        end
      end
      Assurance->>Events: replay total assurance
      Assurance-->>Transition: AssuranceProjection
      Transition->>Events: replay continuation basis
      Projection->>Events: replay public result and replay basis
      alt transition selects governed retry or continuation
        Transition-->>Runtime: ContinuationTransition selects retry or continuation
        Runtime->>Runtime: open the next governed CCall or traversal step
      else transition selects human gate
        Transition-->>Projection: ContinuationTransition human_gate_required
        Projection-->>SDK: M03EventProjection with typed held stop
      else transition selects block, yield, or convergence
        Transition-->>Projection: matching ContinuationTransition
        Projection-->>SDK: matching M03EventProjection
      end
      end
    else operation is another admitted DS-1 operation
      SDK->>Context: perform its declared M04 read or bounded delivery effect
      Context-->>SDK: typed operation result or refusal
    end
    SDK-->>CLI: one PublicOperationResult envelope
    CLI-->>Operator: render unchanged value and map declared exit classification
  end
```

The adapter does not fan out, retry, recurse, resume, or answer an F_H gate.
M03 alone consumes admitted continuation truth. A projected human gate ends
this public invocation with the underlying GraphCall held; this checkpoint has
no public F_H mutation that may exit the held runtime state. The CLI only
renders the typed result.

## Lifecycle State Machine

```mermaid
stateDiagram-v2
  [*] --> RawCliInput
  RawCliInput --> CliSyntaxRefused: CLI parser rejects syntax
  RawCliInput --> InvocationConstructed: CLI constructs typed SDK input
  CliSyntaxRefused --> [*]

  InvocationConstructed --> AdmissionRefused: M04 admission rejects envelope or request
  InvocationConstructed --> InvocationAdmitted: M04 admission accepts
  AdmissionRefused --> AdapterRendered: SDK returns declared refusal

  InvocationAdmitted --> ReadProjection: read operation selected by admitted operationId
  InvocationAdmitted --> DeliveryEffect: M04 delivery operation selected
  InvocationAdmitted --> CapabilityPreflight: catalog.invoke context resolves
  CapabilityPreflight --> RuntimeRefused: factory, executable, equivalence, provenance, or profile check refuses
  CapabilityPreflight --> CapabilityBound: required capabilities admit or none are required
  CapabilityBound --> RuntimePrepared: HostInvocationDescriptor constructed
  RuntimePrepared --> RuntimeRefused: M03 view, lookup, or selection refuses
  RuntimePrepared --> GraphStructureAdmitted: Module-backed GraphFunction selected
  GraphStructureAdmitted --> RuntimeRefused: Graph, Nodes, GraphVector, composition, or binding refuses
  GraphStructureAdmitted --> BasisAdmitted: M03 constructs ExecutionBasis
  BasisAdmitted --> RuntimeRefused: runtime preflight refuses
  BasisAdmitted --> GraphCallRunning: M03 opens GraphCall and starts traversal

  GraphCallRunning --> CCallOpened: M03 opens one declared effect spine
  CCallOpened --> EffectOutputPending: selected handler interior runs
  EffectOutputPending --> ResponseRejected: M03 response admission rejects malformed output
  EffectOutputPending --> ResponseAdmitted: M03 response admission accepts a fact
  ResponseRejected --> RuntimeEventsAdmitted: M03 admits CCall and retry or stop events
  ResponseAdmitted --> RuntimeEventsAdmitted: M03 admits payload, evidence, and evaluation events
  RuntimeEventsAdmitted --> RuntimeProjected: M03 replay derives assurance and continuation
  RuntimeProjected --> RuntimeRetrying: transition selects retry
  RuntimeProjected --> RuntimeYielded: transition selects yield
  RuntimeProjected --> GraphCallHeldForFh: transition selects human gate
  RuntimeProjected --> RuntimeBlocked: assurance or continuation blocks
  RuntimeProjected --> RuntimeConverged: closure law closes
  RuntimeRetrying --> GraphCallRunning: M03 opens the next governed traversal step

  ReadProjection --> PublicResultReady: M03 replay projection
  DeliveryEffect --> PublicResultReady: M04 declared effect completes
  RuntimeRefused --> PublicResultReady: typed runtime refusal
  RuntimeYielded --> PublicResultReady: canonical events projected
  GraphCallHeldForFh --> PublicResultReady: typed held stop projected, no F_H mutation
  RuntimeBlocked --> PublicResultReady: canonical events projected
  RuntimeConverged --> PublicResultReady: canonical events projected
  PublicResultReady --> AdapterRendered: SDK returns one public envelope
  AdapterRendered --> [*]
```

No CLI-local variable is a lifecycle authority. Public runtime states derive
from M03 admission, events, transition projection, and closure law. M04 owns
only public request admission, delivery effects, and result adaptation. The
underlying `GraphCallHeldForFh` has no exit in this checkpoint; a future typed
F_H public act must provide that transition rather than the CLI inventing one.

## Cross-View Invariants

| Check | Evidence | Verdict |
|---|---|---|
| Every sequence participant exists in the domain model or is external | Every adapter, admission, context, runtime, response, handler, event, and projection participant is modeled; `Operator` is external | pass |
| Every lifecycle carrier exists in the domain model | Public invocation/result, capability preflight/provenance, GraphFunction structure, ExecutionBasis, GraphCall/CCall, raw/admitted response, event, assurance/continuation, and held F_H truth are represented | pass |
| Every message names a typed transform, interpreter act, or effect boundary | Admission, exact-context resolution, M03 invocation, C-call effect, event projection, and result adaptation are named | pass |
| Every transition names an admission, interpreter, event, projection, or external owner | M04 owns ingress/delivery; M03 owns runtime states; CLI owns syntax/render only | pass |
| Constructive GraphFunction structure is visible | Module, GraphFunction, Graph, input/output Nodes, GraphVector, composition, and policy/effect binding appear before GraphCall | pass |
| Raw F_P output cannot transition directly to accepted or closed | The views require response admission and events first, but the separate F_P design is blocked pending G1-G5 | fail |
| Plugins and handlers own interiors only | `DeclaredEffectHandler` returns data and evidence refs; M03 emits events and decides transitions | pass |
| Batch, retry, recursion, and nested workflow use declared algebra | M04 constructs none and this adapter design claims no C-constructor realization | not_applicable |
| CLI and SDK cannot diverge in runtime meaning | CLI delegates one typed invocation to the SDK and renders the same result/exit map | pass |
| Live capability construction is pre-effect and provenance carrying | executable admission, execution-equivalence comparison, profile confinement, and three provenance refs precede M03 invocation | pass |

## Axiom Evaluation

| Axiom | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission/compiler enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|
| The native CLI is a thin adapter over one public SDK | `PRODUCT.md` lines 75-104; `M04-app-bootstrap` | CLI has no runtime carrier or semantic ownership | CLI calls SDK once and renders its envelope | no CLI-owned runtime states | operation-specific TypeScript request/result correlation and exhaustive CLI command union | M04 operation admission rejects unmatched operation/request pairs | pass | none |
| M03 is the sole runtime controller | `PRODUCT.md` lines 94-110; `M03-engine-kernel`; `T-223` non-closure law | selection, GraphCall, events, projection, continuation, and closure remain M03-owned | SDK makes one call to the M03 catalog invocation entry | every retry, block, gate, yield, and close transition is M03-owned | package exports expose the public boundary without granting CLI private runner state | exact basis, session view, lookup, selection, and runtime admission | pass | none |
| The host-neutral invocation descriptor is data, not authority | `REQ-P-PUBLIC-CONTRACTS-010` | descriptor is subordinate to admitted invocation and M03 basis | SDK derives it; M03 independently admits and interprets | descriptor creates no lifecycle transition by itself | closed readonly carrier | public invocation and host schema admission | pass | none |
| Operator capability construction fails closed before GraphCall | T-223 live preflight; PRODUCT trusted-desktop boundary | steering, factory, executable admission, binding, provenance, and bound profile are distinct | command availability, factory presence, execution equivalence, and profile confinement precede M03 | any mismatch reaches `RuntimeRefused`; only `CapabilityBound` reaches runtime | closed steering/profile/binding carriers | factory lookup, executable admission, stable projection equality, and plugin-ref subset check | pass | none |
| Capability provenance is ABG-consumable input, not ambient process truth | T-223 WITNESS-010 path | capability ref, capability digest, and execution-contract digest are explicit | preflight adds exact refs to the host descriptor | provenance exists before `RuntimePrepared` | readonly provenance projection | stable digest construction and descriptor admission | pass | none |
| GraphFunction is the sole public callable catalog kind | `PRODUCT.md` lines 68-73; `REQ-P-CATALOG-007` | selected callable is a GraphFunction; node and overlay remain read-only rows | M03 selection precedes GraphCall | only GraphFunction selection enters running | closed public catalog-kind and request unions | catalog lookup rejects non-callable kinds | pass | none |
| A callable GraphFunction retains its constructive graph body | `REQ-L-GTL3-GRAPHFUNCTION-002/-015/-019`; tenant calibration checks | Module owns GraphFunction, inline Graph, Nodes, GraphVector, composition, and bindings | M03 materializes all structural parts before basis and GraphCall | `GraphStructureAdmitted` precedes `BasisAdmitted` | closed GTL carrier families | Module and GraphFunction admission reject missing structural identity | pass | none |
| Public mutation enters canonical event truth; reads remain projections | `PRODUCT.md` lines 94-98; `REQ-R-ABG3-EVENTS`; `REQ-R-ABG3-PROJECTION-011` | one M03 event log and one projection family | invoke emits through M03; reads consume admitted event bytes | public result states follow projection | event and projection types are M03 exports | canonical event admission checks ordinals and kinds | pass | none |
| Raw or malformed F_P output cannot become closure truth | `REQ-L-GTL3-C-ALGEBRA-018`; `PRODUCT.md` evaluator law | handler output is effect-edge data only | designed path admits response and events before projection | no designed raw-output-to-close transition | typed plugin and payload status families exist, but cross-field relations remain open | separate F_P design records open-contract, status-family, and composed-proof failures | fail | `M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md` G1-G5 |
| Effects own interiors only | `REQ-R-ABG3-HANDLERS`; ODD boundary law | handler has no event, transition, or closure relationship | handler returns only effect output and evidence refs | no handler-owned lifecycle transition | handler contract excludes authoritative runtime carriers | M03 plugin and payload admission | pass | none |
| Adapter code must not replace declared graph/C composition | ODD method; `TYPESCRIPT_REALIZATION_GUARDRAILS.md` | M04 has no batch, recursion, or nested workflow carrier | M04 delegates selected GraphFunction interpretation to M03 | runtime states remain inside M03 | no adapter orchestration API | this slice claims no C-constructor realization | pass | none |
| Runtime invocation certifies the selected constructive body against C conformance | `REQ-L-GTL3-C-ALGEBRA-014..-018`; compiled-handoff design | GraphFunction structure and ExecutionBasis exist but no conformance-result relation joins them | basis construction compiles execution declarations only | `BasisAdmitted` cannot encode C-conformance identity | separate typed carriers exist | current basis admission does not bind the separate C compilation result | fail | M01/M03 mapping design |
| Product-visible prompt protocol is declared by GTL | `REQ-R-ABG3-HANDLERS-015`; instruction-protocol design | Graph declarations and prompt manifest exist but the instruction-category/protocol source is absent | current M03 startup synthesizes transform/review protocol text | dispatch is reachable from code-owned protocol synthesis | no type binds section text to a GTL instruction declaration | plan compilation validates asserted values rather than declaration lineage | fail | `M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md` |
| F_H is a typed external boundary, not an adapter decision | `PRODUCT.md` lines 106-110; `REQ-R-ABG3-ASSURANCE-033`; tenant calibration checks | `HumanGateStop` and deferred typed F_H act are distinct | M03 returns a held stop; CLI cannot answer it | `GraphCallHeldForFh` has no exit in this checkpoint | public result union exposes the stop | no public typed F_H mutation is realized | fail | later public F_H operation slice |
| Complete 36-operation catalog is required for the 5.0 product | `REQ-P-PUBLIC-CONTRACTS-008` | DS-1 domain intentionally contains only 13 operations | sequence covers the DS-1 subset only | deferred operations do not enter DS-1 states | later operation contracts absent by design | release conformance must reject an incomplete final catalog | not_applicable | T-218 successor phases |
| Hostile-workstation tamper defense is outside product scope | `PRODUCT.md` lines 155-166; `REQ-P-PUBLIC-CONTRACTS-014` | exact identity/digest coherence, no signing authority | admission verifies exact local artifacts and bindings | mismatch refuses; no hostile actor lifecycle is claimed | digest and path types | product verification and canonical digest admission | pass | none |

## Gap And Exclusion Register

| Gap or exclusion | Why outside or blocking | Owner | Re-entry condition |
|---|---|---|---|
| 23 later public operation identities | DS-1 deliberately publishes 13 operations; this checkpoint is not complete 5.0 operator closure | T-218 successor phases | owning requirement/design slice admits each operation and extends conformance proof |
| Generic resume and interactive F_H mutation | CLI may render a stop but cannot lawfully invent continuation or human judgment | later operator-contract slice | public request/result/event contracts and M03 consumption path are designed and accepted |
| Node-type and overlay application | DS-1 exposes list/describe only and preserves GraphFunction-only callability | T-228 or successor | application semantics and compiler/runtime binding are admitted |
| F_P response-contract closure and raw-to-close proof | `catalog.invoke` depends on a blocked response-admission design | M03 F_P admission | G1-G5 receive design disposition and the resulting design is accepted |
| C-conformance identity on `ExecutionBasis` | public invocation cannot certify that the selected constructive body passed the C semantic compiler | M01/M03 mapping design | one admitted compilation identity joins the authoritative selected body and basis without creating rival program authority |
| Declared instruction protocol | public invocation currently reaches a manifest whose transform/review protocol source is authored in M03 | GTL instruction and M03 compiler design | selected stages resolve exact declared instruction-category/protocol assets before plan compilation |
| Adapter-owned batch, retry, recursion, or nested workflow | prohibited, not missing from M04 | M03/GTL only | never re-enters M04; declared programs use realized algebra |
| Full 5.0 release conformance | later product gate, not evidence supplied by this checkpoint | release/conformance phase | exact operation and capability catalogs are complete and qualified |

## Design Verdict

`blocked` for acceptance as the complete public `catalog.invoke` design across
`b445eb1`, `779eb07`, and `28da030`. The
thin CLI-to-SDK adapter and exact public-envelope mapping remain bounded
candidate subclaims, but the runtime operation depends on blocked F_P and
instruction designs, lacks a C-conformance identity joined to its
`ExecutionBasis`, and has no typed public exit from an F_H-held GraphCall.

The T-223 SDK/CLI equivalence, catalog invocation, malformed-input, result, and
replay tests remain useful evidence; they do not cure those design failures or
replace independent axiom review and F_H disposition. No dependent
implementation is authorized.
