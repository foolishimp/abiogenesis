# ABIogenesis 5.0 GTL 3 / HoG / ABG Schematics

**Status**: Current diagrams of the frozen GTL language and authority boundary
**Projection basis**: Active ABIogenesis 5.0 Product and requirement law
accepted by T-283 `F_H` closure

These diagrams are explanatory read models. The constitutional source remains
`specification/`.

## Reading Key

| Shape | Owner class | Meaning |
|---|---|---|
| GTL declarations | Language definition | Program meaning before execution |
| Validator | Static judgment | Type, raw-carrier, and whole-Program validity |
| Product / Module / Catalog | Publication and readiness | Exact admitted availability and membership |
| HoG | Execution | Direct traversal of admitted GTL |
| Implementation owner | Leaf realization | Exact deterministic, probabilistic, or human seam |
| ABG | Runtime truth | Admission, events, replay, lineage, continuation, correction, closure |
| SDK / CLI / read model | Thin boundary or projection | Invocation and observation without controller authority |

## 1. Complete Authority Spine

```mermaid
flowchart TD
    Source["GTL.TypeScript source"]
    TS["Native TypeScript checking"]
    Raw["Raw admission after type erasure"]
    Validator["Non-lowering GTL validator"]
    Publication["Module publication"]
    Catalog["Admitted and narrowed catalog"]
    Ingress["Typed public Program start or GraphFunction call"]
    Materialization["Product-owned GraphFunction graph materialization"]
    HoG["HoG direct traversal of admitted GTL"]
    Owner["Exact F_D | F_P | F_H implementation seam"]
    ABG["ABG runtime admission and event truth"]
    Replay["Replay-derived state"]
    Outcome["result | continuation | hold | gap | block | closure"]

    Source --> TS
    TS --> Raw
    Raw --> Validator
    Validator --> Publication
    Publication --> Catalog
    Catalog --> Ingress
    Ingress --> Materialization
    Materialization --> HoG
    HoG --> Owner
    Owner --> ABG
    ABG --> Replay
    Replay --> Outcome
    Replay -. "admitted state and disposition" .-> HoG
```

The dotted feedback is runtime state, not a second execution loop: HoG advances
declared topology using the admitted Program and ABG replay-derived state. ABG
admits what occurred and derives the lawful runtime disposition.

## 2. Publication And Program Structure

```mermaid
flowchart TD
    Module["Module"]
    Program["GTL Program"]
    Start["Declared Program start"]
    Membership["Callable membership"]
    Policy["Policy, results, closure, and proof obligations"]
    GF["GraphFunction"]
    Interface["Typed input/output interface"]
    Template["Replayable GTL graph template"]
    Graph["Materialized Graph"]
    Loci["Nodes and internal GraphVectors"]
    Relations["Graph and C relations"]
    Contracts["Contracts and types"]
    Bindings["Compatible implementation bindings"]
    Catalog["Admitted catalog projection"]

    Module --> Program
    Module --> GF
    Module --> Contracts
    Module --> Bindings
    Program --> Start
    Program --> Membership
    Program --> Policy
    Start --> GF
    Membership --> GF
    GF --> Interface
    GF --> Template
    Template --> Graph
    Graph --> Loci
    Graph --> Relations
    Module --> Catalog
    Program --> Catalog
    GF --> Catalog
    Contracts --> Catalog
    Bindings --> Catalog
```

`Program`, `GraphFunction`, and `Graph` are distinct:

- the Program owns composition, starts, membership, policy, result, and proof
  law;
- GraphFunction is the sole named callable contract; and
- its template materializes graph structure for HoG traversal.

## 3. Program, Library, And Workspace

```mermaid
flowchart LR
    Library["GraphFunction library contracts"]
    Program["Admitted Program composition"]
    Workspace["Mutable workspace instance material"]
    Invocation["Exact invocation binding"]

    Library -->|"declared membership and relations"| Program
    Program -->|"topology, starts, policy"| Invocation
    Workspace -->|"files, data, config, observations"| Invocation
```

The workspace supplies material to an invocation. It does not become Program
meaning, callable selection, traversal state, or closure truth.

## 4. Validation Depths

```mermaid
flowchart TD
    Native["1. Native TypeScript"]
    NativeLaw["Local types, generics, interfaces, unions, constructors"]
    Raw["2. Raw admission"]
    RawLaw["Equivalent carrier law after type erasure"]
    Whole["3. GTL validator"]
    WholeLaw["Whole-Program identity, reference, membership, interface, algebra, completeness"]
    Valid["typed valid"]
    Invalid["typed invalid"]
    Unresolved["typed unresolved semantics"]

    Native --> NativeLaw
    NativeLaw --> Raw
    Raw --> RawLaw
    RawLaw --> Whole
    Whole --> WholeLaw
    WholeLaw --> Valid
    WholeLaw --> Invalid
    WholeLaw --> Unresolved
```

The validator may produce diagnostics, canonical serialization, and
subordinate indexes. None is an executable Program, runtime plan, or event.

## 5. Graph And Compute Algebra

```mermaid
flowchart TD
    Program["GTL Program"]
    GraphRelations["Graph relations"]
    ComputeRelations["C relations"]

    Program --> GraphRelations
    Program --> ComputeRelations

    GraphRelations --> Edge["edge"]
    GraphRelations --> Compose["compose"]
    GraphRelations --> Substitute["substitute"]
    GraphRelations --> Recurse["recurse"]
    GraphRelations --> FanOut["fan_out"]
    GraphRelations --> FanIn["fan_in"]
    GraphRelations --> Gate["gate"]
    GraphRelations --> Promote["promote"]
    GraphRelations --> Identity["identity"]
    GraphRelations --> SameObject["same_object"]

    ComputeRelations --> COf["C.of"]
    ComputeRelations --> CId["C.id"]
    ComputeRelations --> CCompose["C.compose"]
    ComputeRelations --> CEdge["C.edge"]
    ComputeRelations --> Workflow["workflow.C"]
    ComputeRelations --> Batch["C.batch"]
    ComputeRelations --> Retry["C.retry"]
```

The graph relations and seven C constructors are language declarations. HoG
traverses them directly; no generated execution declaration sits between GTL
and HoG.

## 6. Compute Regimes

```mermaid
flowchart LR
    Boundary["Declared executable boundary"]
    FD["F_D: total mechanical work"]
    FP["F_P: bounded semantic candidate work"]
    FH["F_H: attributed human decision or response"]
    Admission["Typed ABG admission"]
    Truth["Admitted runtime truth"]

    Boundary --> FD
    Boundary --> FP
    Boundary --> FH
    FD --> Admission
    FP --> Admission
    FH --> Admission
    Admission --> Truth
```

`F_P` and `F_H` output cannot certify deterministic closure. One regime may
consume another regime's admitted evidence but cannot inherit its authority.

## 7. Selected Composition And Stage Sets

```mermaid
flowchart TD
    Selection["selected abg.fn_composition ref + digest"]
    Transform["transform.C candidate/evidence proposal"]
    TransformAdmission["ABG admission"]
    Evaluate["evaluate.C evaluation-set proposal"]
    EvaluationAdmission["ABG admission and assurance projection"]
    Consequence["consequence.C projection proposal"]
    Transition["ABG-admitted transition and continuation"]

    Selection --> Transform
    Transform --> TransformAdmission
    TransformAdmission --> Evaluate
    Evaluate --> EvaluationAdmission
    EvaluationAdmission --> Consequence
    Consequence --> Transition
```

This is notation over existing carriers. `C`, a stage set, and
`TraversalUnit<A, B>` do not create new topology, public callables, plugins,
controllers, or runtimes.

## 8. One GraphFunction Call

```mermaid
sequenceDiagram
    participant Caller
    participant Public as SDK / CLI / Public
    participant Catalog
    participant Validator
    participant Materializer as Product materialization
    participant HoG
    participant Owner as Exact leaf owner
    participant ABG
    participant Replay

    Caller->>Public: typed Program start or GraphFunction call
    Public->>Catalog: resolve exact Program, membership, contracts, binding
    Catalog-->>Public: admitted narrowed view
    Public->>Validator: validate admitted Program and declarations
    Validator-->>Public: valid or typed refusal/pressure
    Public->>ABG: admit exact invocation basis
    Public->>Materializer: materialize member GraphFunction template
    Materializer-->>HoG: validated admitted graph
    HoG->>Owner: invoke declared leaf seam
    Owner-->>ABG: result/evidence candidate
    ABG->>ABG: admit or refuse facts and transition
    ABG->>Replay: append admitted events
    Replay-->>HoG: current admitted state/disposition
    Replay-->>Public: typed outcome projection
    Public-->>Caller: result, continuation, hold, gap, block, or closure
```

Public does not choose private topology. The implementation owner does not emit
runtime truth. ABG does not execute the graph.

## 9. Recursion And Foldback

```mermaid
flowchart TD
    Parent["Parent GraphFunction locus"]
    Relation["Declared recurse relation"]
    Child["Child GraphFunction call and frame"]
    ChildFacts["ABG-admitted child result and evidence"]
    Foldback["Declared foldback rebind"]
    ParentEval["Parent re-evaluation"]
    Continue["continue | recurse | hold | block | close"]

    Parent --> Relation
    Relation --> Child
    Child --> ChildFacts
    ChildFacts --> Foldback
    Foldback --> ParentEval
    ParentEval --> Continue
```

Child closure is not parent closure. Recursion requires explicit termination,
foldback, lineage, parent re-evaluation, and bounds.

## 10. Hello World Composition And Overlay

```mermaid
flowchart LR
    Base["Base Hello Program"]
    Root["Root overlay row<br/>generic admission policy"]
    Child["Child overlay row<br/>Hello types, roles, and function refs"]
    Admission["Deterministic validation and admission"]
    Program["One admitted Hello World Program"]
    Composer["hello_world GraphFunction"]
    Subject["subject GraphFunction"]
    Greeting["greeting GraphFunction"]
    HoG["HoG direct traversal"]
    Leaf["Exact owner leaf implementation"]
    ABG["ABG admission and replay"]
    Result["typed Hello World result"]

    Base --> Admission
    Root --> Admission
    Child --> Admission
    Admission --> Program
    Program --> Composer
    Composer --> Subject
    Subject --> Greeting
    Program --> HoG
    HoG --> Leaf
    Leaf --> ABG
    ABG --> Result
```

Root and child rows are declaration inputs to admission. They do not remain as
a controller beside HoG. The detailed
[Hello World examples](./GTL_HELLO_WORLD_EXAMPLES.md) distinguish the accepted
odd_glc single-GraphFunction publication from this illustrative composition
and overlay form.

## 11. Forbidden Rival Surfaces

```mermaid
flowchart LR
    Forbidden["Forbidden as authority"]
    Compiler["semantic compiler / lowered executable Program"]
    Controller["feature or Public controller"]
    Workspace["workspace as Program"]
    ABGExecutor["ABG as graph executor"]
    PluginWriter["plugin or worker event writer"]
    Rival["rival catalog, runtime, or closure ledger"]

    Forbidden --> Compiler
    Forbidden --> Controller
    Forbidden --> Workspace
    Forbidden --> ABGExecutor
    Forbidden --> PluginWriter
    Forbidden --> Rival
```

Any design that requires one of these surfaces has crossed the frozen language
boundary and must fail closed or return for constitutional re-entry.

## Source Map

- [Product](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/PRODUCT.md)
- [Intent](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/INTENT.md)
- [GTL contract-law reload](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md)
- [GTL language capability model](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md)
- [Program traversal mapping](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
- [HoG traversal and ABG admission](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/abg/REQ-R-ABG3-INTERPRET.md)
- [Accepted odd_glc Hello World publication](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/odd_glc/typescript/product/build/publication.json)
- [Hello World examples](./GTL_HELLO_WORLD_EXAMPLES.md)
- [Human guide](./USER_GUIDE.md)
- [LLM guide](./LLM_GTL_APP_BUILDER_GUIDE.md)
