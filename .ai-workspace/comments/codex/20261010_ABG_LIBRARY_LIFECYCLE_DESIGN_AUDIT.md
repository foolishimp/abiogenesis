# ABG library lifecycle design audit

**Status:** Source-grounded design proposal; implementation and installed qualification remain open.  
**Product frame:** ABI5.0's fixed fifteen families, GOAL035/T287, STDO2.5.1 RC2. This audit covers entry, definitions, traversal, native effects, admission, persistence, recovery and fresh reads. Data Mapper is an external UAT workload.

## Finding

The lightweight model already has Product authority. [Live State, Recovery And Valid Reuse](/Users/jim/src/apps/abiogenesis/specification/PRODUCT.md:801) requires incremental state, disposable derivations and reuse while dependencies remain valid. The realization diverges at two joins: established definition facts are reconstructed at subsequent handoffs, and historical bodies are required by carriers used for ordinary operation.

Consolidate those relations in the existing library owners. An additional facade around full event arrays would preserve the memory problem. Shared mechanics must replace the duplicated paths, with their producers and consumers changed together.

The [October 05 transformation-library proposal](/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20261005_ABG_TRANSFORMATION_LIBRARY_DESIGN.md:57) supplies the instance model. Its 44 published items are 38 schemas, five vocabularies and one corpus, not 44 functions. Preserve distinct contracts and responsibilities while sharing their realization.

## End-to-end frame

This is the target responsibility sequence, not a new runtime or API roster. Pure definition work precedes history acquisition when it has no runtime dependency.

```mermaid
sequenceDiagram
  participant C as SDK/CLI caller
  participant D as Definition owners
  participant H as HoG
  participant N as Native leaf owners
  participant W as Mutable worksite
  participant E as ABG and projections
  participant L as Durable log and evidence
  C->>D: Verify/link exact definitions; reuse valid owner facts
  D-->>C: Existing declaration and validation views
  C->>E: Acquire exact history and source
  E->>L: Authenticate committed extent and required bodies
  E-->>H: Current position, input, obligations and producer selections
  C->>H: Invoke declared GTL instance
  loop Existing declared traversal
    H->>N: Selected bounded request, basis and effect grant
    N->>W: Native agent work and actual measurements
    N-->>H: Candidate and physical observations
    H->>E: Existing admission seam
    E->>L: Commit new facts and authenticated body selections
    E-->>H: Admitted Result/Judgment and remaining obligations
    H->>H: Declared Executive evaluates next action
  end
  H-->>C: Outcome under declared completion condition
  opt Restart or requested fresh read
    C->>E: Close/reacquire through existing owners
    E->>L: Reconstruct committed state and selected evidence
    E->>N: Obtain necessary current worksite observations
    E-->>C: Truthful continuation/result/replay
  end
```

GTL declares; HoG traverses; leaf owners compute and effect; ABG admits; replay projects. Restart continues from the actual worksite and admitted position. It preserves completed producers, checks current dependencies and does not imply rollback, a fresh assessment or transplantation of Run identity.

## Data lifetime

| Information | Durable home | RAM lifetime |
|---|---|---|
| Immutable definitions and material | Installed Product/declaration/resource owners | Catalog selections and established validation facts needed by current operation; compiler/linker intermediates are transient. |
| Current execution | Reproducible from admitted events and applicable evidence | Cursor, current input, active calls/actors, current fluents, unresolved obligations and necessary dependency facts. |
| Completed history, Results and prompts | Existing log and authenticated resource/archive owners | Selected bodies only while consumed. Complete replay is an explicit historical output, not mandatory resident state. |
| Decoder buffers, rendering and comparison data | No additional authority | Release after their operation. A location index is disposable and derived; it cannot authenticate evidence by itself. |

Several current arrays and maps share event objects; their sizes are not independent allocations. The audit identifies retention roots and repeated body construction, not measured heap by type.

A cold check may genuinely require the complete history. That does not justify keeping its decoded bodies after recovery or rebuilding it at every internal boundary. Causal and profile checks retain their necessary extent. If a complete historical output is requested, its materialization cost remains explicit.

## Change map

Paths below are relative to `build_tenants/abiogenesis/typescript/code/src/`, except the UAT caller. Each row identifies an existing owner, not another subsystem.

| Scope and current path | Required consolidation | Owning design and exit relation |
|---|---|---|
| **Product verification/linking:** `product/environment.ts`, `environment_definition_bindings.ts`, `declaration_exports.ts` | `resolveProductArtifacts` already returns `{lock, linked}`; the native lock-only handoff discards the link and Public resolution links again. Consume the exact owner result through existing views. Retain cold verification of actual package bytes and compiler/dependency correspondence. Release TypeScript Program intermediates after use. | Installed-catalog foundation HOW. Native verification/resolution → installation/Public resolution preserves complete outputs without repeating unchanged linking. Changed bytes, Product population or compiler basis invalidates reuse. [Owner](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/environment.ts:406) |
| **Catalog and Program validation:** `product/catalog_operations.ts`, `declaration_closure.ts`, `execution_resolution.ts`; sole validator | Execution resolution obtains a closure, then its wrapper validates that closure by resolving it again. Use existing `constructProgramValidationInputFromResolvedClosure` for the actual owner result. Reuse static Program facts under unchanged dependencies; derive the existing binding-qualified view. Raw/copied input retains its admission path. | Catalog/execution-resolution and Program-conformance HOWs. Preserve existing ProgramValidation meaning, identities and diagnostics; changed declarations, permissions or binding applicability reopen affected checks. [Call site](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/execution_resolution.ts:718) |
| **Graph construction/traversal:** `gtl/materialize.ts`, `validator/graph.ts`, `hog/child_traversal.ts`, `parent_rehydration.ts`, `entry.ts` | Materializer and validator derive the same shape; return/resume repeat correspondence work. Share established fixed-template law and the actual materializer result. Warm handoffs carry that relation; cold recovery reconstructs it through the same owners. | GTL graph/materialization and pending-consumer continuation HOWs. Preserve validation digests and reject crossed basis, malformed topology and changed input. Ordered fan-out, invocation/input binding, cursor, grants and parent/child lineage remain occurrence checks. [Validator](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/validator/graph.ts:58) |
| **Event resource and prefix:** `abg/event_store.ts`, `event_prefix.ts`, `runtime_derivation.ts`, `event_calculus.ts` | Whole-file decode seeds `events`, `eventsById`, durable-history arrays and inline bodies. Prefix/profile receipts and physical previous-event links retain history objects. Coordinate bounded decoding, authenticated body locations, current folds and staged append state. Streaming the reader alone leaves these retention roots. | Interrupted-resource recovery and Event Calculus HOWs. Preserve complete framing/profile/causal validation, exact physical correspondence, transactional append/fsync, rollback and truthful residue. Array-based contracts and their consumers need coordinated realization. [Store state](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts:1352) |
| **Replay, reads and source:** `abg/replay.ts`, `project_read_ports.ts`, `artifact_truth.ts`, `invocation_admission.ts`, `invocation_execution_truth.ts`; HoG and Product readers | Ordinary status/route/source readers consume narrow current facts and selected historical bodies. Prepared reads and source proofs must not retain complete contexts merely to answer a smaller query. Full replay remains available with its existing complete meaning and digest. | R10 and pending-consumer continuation HOWs. Prove live/cold agreement, original producer, later-work exclusion, all-actor termination and currentness. Preserve the accepted narrow route repair (220), detached portable close (225), and immutable post-close use proved in 198. [Read context](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/project_read_ports.ts:622) |
| **Governance working state:** `product/default_library.ts`, `abg/default_library.ts`, `gtl/default_library.ts` | Current schema requires the full original declaration and accumulating observation values; testing folds decode/copy streams into subsequent state. Resolve original material and prior Results through authenticated selections; project current contribution, residuals, measurement facts and literal cited diagnostics for the Executive. Retain full material for the consumer that needs it. | Default-governance library HOW. Preserve source/outcome/authority, bounded selected job, failed command/citations, coverage and independent completion. This requires the owning typed contract and consumers; an Operator-only pointer wrapper is invalid. [Contract](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/default_library.ts:47) |
| **Instruction and body admission:** `abg/instruction_assembly.ts`, `actor_process.ts`, `execution_basis.ts`, `event_body_encoding.ts` and payload consumers | Assembly carries basis/task plus rendered prompt; transport admission embeds that assembly again. Current body encoding shares identical whole input/Result bodies, then expands logical values; it is not general lazy body access. Consolidate authenticated archive/resource selection and acquisition at these owners. Resolve required content once for its actual consumer. | Instruction-assembly/transport and payload HOWs. Preserve prompt/schema/plan digests, exact inspectable bodies, producer provenance, role/context sufficiency and current task. Changed payload representation needs owning contracts and complete producer-to-readback proof. [Assembly](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts:148) |
| **Repeated UAT preparation:** phase-specific `operator/.../prepare.mjs`; `product/run_invocation_operation.ts`; existing SDK/CLI | Reuse the existing owner call-through for verification, grants, slots, bindings, source-use callbacks and reads. Put fixture-specific selection in one UAT helper bound by instance data. Pure eventless verification/resolution can run before acquiring history; it has no WorkspaceBinding dependency. Retire new phase-specific variants from future execution. | Public invocation/SDK/CLI HOWs and external UAT harness. Prove the installed path, not another controller or hand-written contract. Preserve frozen historical scripts as evidence and source/currentness checks before effects. [Actual caller](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/installed-current31-source41-continuation-231/attempt-b/prepare.mjs:87) |

Re-enter the affected existing HOW before implementation. Contract-changing scopes also re-enter their existing Public/requirements owners; keep old admitted records readable. Preserve required logical outputs or explicitly qualify the owner's successor contract. Do not edit old logs or replace their meaning with a smaller digest.

## Library composition

Use the existing transformation distinction:

```text
tau[instance] : source contract => destination contract
compute[instance] : source -> declared HoG composition(destination)
```

The shared families are definition admission/linking, material selection and request construction, native work/effect observation, judgment authentication, current-state folding/historical projection, and publication. Instances bind subject, installed basis, material, criteria, role and effects. Existing canonical exports own these families; this audit does not prescribe a new package, dispatcher, registry or proof ledger.

Executive selection, independent assessment, F11 aggregation and sole AF22 qualification keep their distinct authority. Native types, schemas, assets and catalog views derive from canonical definitions. Do not collapse semantic responsibilities to reduce a function count.

## Execution order and minimum proof

Steps 2–3 are the coordinated changes needed to complete the lightweight-state target. Unrelated whole-library cleanup is not an RC1 or steel-thread prerequisite.

1. **Remove repeated fixed work and overlapping preparation first.** Reuse actual resolver/closure results, established graph construction and same-basis validation; consolidate the UAT caller. Prove changed-dependency refusal before installing a successor. This is a bounded increment, not a prerequisite to unrelated cleanup. Run the earliest affected installed composition after this accepted increment; do not postpone it until all eight scopes are implemented.
2. **Complete the runtime representation change coherently.** Change store/prefix/fold/query owners and their actual HoG/R10/source consumers together. Carry current facts; resolve selected historical bodies. Preserve close/reopen and immutable post-close use. A streaming-only patch does not close this scope.
3. **Contract repeated bodies on the selected chain.** Repair governance-state and instruction/payload producer-to-consumer joins under their owning contracts. Retain actual agent context and inspectable evidence at durable owners. Do not make every family’s unrelated helper compression a steel-thread prerequisite.
4. **Run one genuine installed composition discriminator.** SDK/CLI → authentic source → Executive bounded choice → native effect → C2 measurement → failed Result conserved in parent → selected repair → close/restart → fresh Public reads. Completion remains governed by the independent declared outcome, not test counts.

Required comparisons cover existing values/digests/refusals; failed command and byte-correct citations; unchanged original producers across restart; current inputs/residuals; partial physical effects and unknown after-state. Negative cases include tampered body/history, copied or foreign proof, changed Program/input/binding, reordered fan-out and later invalidating work. A failure must return to Executive root-cause triage before retry.

Measure cold bytes/time, fixed-definition work, per-handoff acquisition/retention, rendering/admission, heap/RSS and native-agent work separately on the same workload. Growing unrelated history must not grow ordinary handoff work without a governing dependency. Use workload-specific declared bounds through existing authority; introduce no universal quota.

## Capacity and acceptance limits

Actual installed build 31, attempt 231, aborted during Public Product resolution after 266.124 seconds, before new preparation, model dispatch or application effects. Recorded heap was about 1.945 GB before history acquisition and 4.109 GB entering the failing resolution; cold acquisition temporarily held a 2.142 GB Buffer. The runtime log contains 271,565 events / 2,142,096,875 bytes. These are process checkpoints, not per-object heap attribution. The exact fatal allocator/dominant retainer is unproved. [Frozen outcome](/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/installed-current31-source41-continuation-231/return.md:1)

This demonstrates framework-side capacity failure and accumulated overlap; it does not prove either repair scope alone will restore capacity. Data Mapper's preserved 16 defect detections/restorations and 44 passing tests remain bounded application evidence. Full UAT, F11/AF22 and release qualification remain open. The native continuation stays stopped pending an accepted repair; this audit performs no retry or implementation.

**Audit basis:** Canonical `main` HEAD `727f1dbcab3c198f7704735fdf91b994b7aac243`, with later accepted dirty Source work; HEAD alone is not the installed candidate. Product SHA256 `6f7906e8bcf371e12c5867265a9c2cce5784ca391d634b9d4cd6c91604bf84c6`; selected-frame SHA256 `80812cac6317c36a4d1e424d4e5ce874c287ea51127ec6c8adebf63aed566cda`; October 05 proposal SHA256 `be35382fa8347e3505fde3f7b2047ab3d3930c33dd0bc225c4dcd549fd820d69`. Source-grounded audit results were conjoined across definition, lifecycle/memory, and native-work frames; no whole-production freeze or installed acceptance is claimed.
