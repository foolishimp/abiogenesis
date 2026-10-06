Preparation lifecycle constraint under existing HOW4.1/HOW5.1; UML for agents, no schema or runtime.

```mermaid
sequenceDiagram
    participant Frozen as Frozen producer evidence
    participant Init as Preparation caller
    participant Bind as Owned descriptor binding
    participant Owner as Framework preparation owner
    participant Proof as Readiness proof
    Frozen->>Init: Borrowed alias/context/Setup/source projections/current delta
    Init->>Init: Validate exact bytes, dependencies and original attribution
    Note over Init,Bind: Classify every destination before copying; reused inputs are not create-only outputs.
    Init->>Bind: Fresh controls and recipe
    Bind->>Bind: Rebind protected inputs/inventory/basis/scope/Task/plan/resources
    Bind->>Owner: Actual current typed input and resources
    Owner->>Proof: Actual owned request/prompt and measured material/envelopes
```

Reuse alias/context/Setup/source projections and completed source delta only while their actual dependencies remain unchanged. Rebind local descriptors/pins; keep downstream outputs new. Never replay exclusive-create producers over borrowed bodies. Framework types/schemas/normalization/admission stay at their existing owners. First failed relation returns Root for triangulation. This makes the selected caller effect choices concrete; it adds no Source architecture or execution mechanism.
