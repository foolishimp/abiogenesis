Cut from `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md` at commit `675b5e90f`, lines 707-1018 (Section 5.6.2), 1019-1612 (Section 5.6.2A), 1613-1849 (Section 5.6.2B), 3077-3145 (Section 5.6.4), 4086-4138 (Section 15), verbatim. Relative links inside the moved text resolve against the pre-move layout and are not repaired.

#### 5.6.2 Installed definition-binding ABI

**SUPERSEDED — NON-OPERATIVE IMPLEMENTATION AUTHORITY.** Section 16.7
supersedes the `PublicExecutionCandidate`, resource-topology-arm, generic
provider, and installed-binding construction specified in this subsection. The
text through 5.6.2B is retained only as historical classification and
constructability evidence. It may not define runtime types, executable plans,
implementation budgets, stage advancement, or a production call path. Section
5.6.2C is the sole operative installed definition-binding law.

The S06 semantic relation remains `PublicInvocation<K> -> indexed owner
output`. `PublicInvocation<K>` is the common semantic descriptor required by
`REQ-P-PUBLIC-CONTRACTS-010`; it is not a physical-resource, artifact-locator,
or durable-store carrier. The former unary installed-call assumption was
therefore incomplete. The repair does not add resource fields to
`PublicInvocationEnvelope.requestCandidate` and does not add another Public
operation or API. It defines one serializable host/Public execution carrier
used without semantic variation by SDK, CLI JSONL, Codex, and the internal
host:

```text
PublicExecutionCandidate = {
  kind: "public_execution_candidate",
  schemaVersion: "5.0.0",
  invocationEnvelopeCandidate: PublicInvocationEnvelope,
  resourceStateCandidate: CanonicalResourceStateCandidate
}

PublicExecutionAdmissionRefusal = {
  kind: "public_execution_admission_refusal",
  schemaVersion: "5.0.0",
  disposition: "refused",
  code: "invalid_i_json" | "invalid_execution_candidate" |
        "invalid_invocation_envelope_candidate" |
        "invalid_resource_state_candidate",
  candidateDigest: Sha256Digest | null,
  issuePaths: NonEmptyUnique<JsonPointer>
}

ResourceStateAdmissionRefusal<K, A> = {
  kind: "resource_state_admission_refusal",
  schemaVersion: "5.0.0",
  disposition: "refused",
  definitionKey: K,
  resourceTopologyArm: SelectedIntrinsicResourceTopologyArm<K, A>,
  code: "family_identity_mismatch" | "arm_identity_mismatch" |
        "slot_set_mismatch" | "duplicate_resource_identity" |
        "binding_digest_mismatch" | "grant_basis_mismatch" |
        "prestate_assertion_malformed",
  issuePaths: NonEmptyUnique<JsonPointer>
}

PublicExecutionDisposition<K, A, I, O> =
  | {
      kind: "public_outcome",
      outcome: PublicOutcome<K>
    }
  | {
      kind: "definition_execution_fault",
      adapterExit: 70,
      fault: DefinitionExecutionFault<K, A, I, O>
    }
  | {
      kind: "definition_defect",
      adapterExit: 70,
      causeDigest: Sha256Digest,
      diagnosticRef
    }
  | {
      kind: "definition_interrupted",
      adapterExit: 70,
      causeDigest: Sha256Digest,
      diagnosticRef
    }

PublicExecutionReceipt<K, A, I, O> = {
  kind: "public_execution_receipt",
  schemaVersion: "5.0.0",
  invocationRef,
  definitionRef, definitionDigest,
  resourceTopologyFamilyRef, resourceTopologyFamilyDigest,
  resourceTopologyArmRef, resourceTopologyArmDigest,
  disposition: PublicExecutionDisposition<K, A, I, O>,
  resourceReceipts,
  finalBindings,
  finalHandoffs,
  residueEvidence
}
```

The nested `PublicInvocationEnvelope` is byte-for-byte the accepted S06
candidate family, including its unchanged semantic `requestCandidate`. The
sibling `resourceStateCandidate` is an assertion about physical or durable
pre-state, never semantic request meaning or authority. A successor receipt or
handoff emitted by this relation is the only lawful resource-state input to a
later dependent call; a host cannot reconstruct, predict, or replace it.
No host, SDK, CLI, Codex, or internal runner accepts a standalone
`PublicInvocationEnvelope`; nesting it here replaces the former transport
ingress while retaining its semantic admission contract.

There is one ingress and one order:

```text
admit outer PublicExecutionCandidate I-JSON
  -> select exact definition K from the admitted nested envelope
  -> admit K's semantic request as PublicInvocation<K>
  -> derive exactly one topology arm from that admitted request
  -> validate and admit the resource-state assertion against that arm
  -> construct one DefinitionCall<K, A, I, O>
  -> invoke one already-loaded binding once
  -> project the indexed Public outcome and canonical resource receipt
```

Outer admission validates the common execution carrier and the unchanged S06
envelope structure. It does not pre-admit K's request or physical truth.
Resource-state admission proves only that the asserted carrier is structurally
complete, digest coherent, grant bound, and equal to the selected arm. Every
provider must re-identify the resource and revalidate its version, grant,
scope, and observed state immediately before effects. No candidate field,
object identity, retained process, current directory, ambient credential, or
prior constructor call can substitute for that check.

One common type-indexed `DefinitionCall` joins the admitted invocation, its
selected closed topology arm, and admitted resource assertion without changing
any of the 18 operation identities, 56 definition keys, owner requests, or
owner outcomes. The exact installed definition binding returns a closed
Effect; it does not return a plain value or Promise:

```text
OwnerTruth<K> =
  owner terminal truth
  | owner nonterminal truth

OwnerProgram<K, A, I, O> =
  Effect.Effect<
    OwnerTruth<K>,
    OwnerExpectedRefusalCause<K> | DefinitionExecutionFault<K, A, I, O>,
    DefinitionRuntime<K, A>
  >

CloseOwnerOutput<K> =
  OwnerTruth<K> | OwnerExpectedRefusalCause<K>
    -> OwnerSemanticOutput<OwnerContractPacket<K>>

DefinitionCall<K, A, I, O> = {
  invocation: PublicInvocation<K>,
  topologyArm: SelectedIntrinsicResourceTopologyArm<K, A>,
  resources: AdmittedResourceTransitionInput<K, A, I, O>
}

DefinitionReturn<K, A, I, O> = {
  ownerOutput: OwnerSemanticOutput<OwnerContractPacket<K>>,
  resources: DefinitionResourceSuccess<K, A, I, O>
}

DefinitionExecutionFault<K, A, I, O> = {
  definitionKey: K,
  resourceTopologyArm: SelectedIntrinsicResourceTopologyArm<K, A>,
  fault: TypedDefinitionSubstrateFault<K, A>,
  resourceReceipts: OrderedResourceTransitionReceiptSet<K, A>,
  latestBindings: CanonicalResourceBindingSet<I | O>,
  residueEvidence: CanonicalResourceResidueEvidenceSet<K, A>
}

ExactDefinitionProgram<K, A, I, O> =
  Effect.Effect<
    DefinitionReturn<K, A, I, O>,
    DefinitionExecutionFault<K, A, I, O>,
    never
  >

ExactDefinitionCallable<K, A, I, O> =
  (call: DefinitionCall<K, A, I, O>)
    -> ExactDefinitionProgram<K, A, I, O>
```

`A` is the selected member of K's closed nonempty topology-arm family. `I` and
`O` are that arm's definition-owned, canonically ordered input- and
output-resource slot sets. Their runtime values carry exact resource
identities. They are not an endpoint roster, executable plan, access-mode flag,
or caller-selected topology. `DefinitionReturn.ownerOutput` preserves the
existing indexed semantic relation; the resource result is its orthogonal
state-and-handoff relation and cannot manufacture owner meaning.

A complete immutable value already carried by the invocation remains an
ordinary semantic input and is not redundantly dereferenced through a provider.
Any ref-only input whose bytes, value, version, or durable history must be
loaded is a resource slot and requires an exact `ResourceBinding`. This is the
boundary that closes the carrier gaps without turning all values into effects.

`OwnerExpectedRefusalCause<K>` is the closed owner cause family already fixed
by the matching `Rnn` row. Owner programs may place those expected causes in
Effect's typed error channel for lawful short-circuiting. A resource-using
owner leaf first consumes the typed mechanical receipt from its physical
provider or ABG owner transition. Only that exact semantic owner may interpret
the receipt as owner truth, an already-declared owner refusal cause, or a typed
definition substrate fault. `Rnn` runs at the first lawful locus after every
transition whose disposition it must classify; for a compound expression that
is after its required ordered leaf receipts and final dependent replay. It
never runs before a classified effect and is never followed by one generic
definition-level commit. `Rnn` remains semantic-owner construction, not Public
mapping and not generic error handling.

`DefinitionExecutionFault<K, A, I, O>` contains only exact substrate, physical,
loading, or execution faults that the owner contract does not define as a
semantic refusal. It preserves the complete ordered mechanical receipt prefix,
latest exact bindings, and any residue or compensation evidence, including
evidence produced before the fault. It remains in Effect's typed error channel
at the installed binding boundary. Unexpected defects remain in `Cause`.
Neither a typed execution fault nor a defect may be caught by `Rnn`, `O_K`,
Public, CLI, SDK, or Codex and relabeled as an owner refusal.

`DefinitionRuntime<K, A>` is the exact intersection of stateless callable or
physical capabilities used by the selected owner expression. An unbound owner
program may request those capabilities through typed Effect `Context` tags.
The statically installed owner binding provides its exact `Layer` from the
verified package and lock, then returns the closed `R = never` program above.
Public neither constructs nor selects a Layer. Current Program, request input,
event time, actor, catalog/view/application, validated prefix, Run, GraphCall,
Frame, cursor, retry frontier, and currentness are explicit immutable values;
none may enter Context or Layer as semantic state.

An owner atom consumes only its minimal typed semantic inputs. A definition
binding is direct only when the existing owner callable already realizes the
required relation. Otherwise the installed owner boundary supplies one
statically composed Effect callable that:

1. consumes one admitted `DefinitionCall<K, A, I, O>`;
2. structurally extracts its already admitted invocation, request, required
   authority slots, causal coordinates, and exact resource bindings;
3. preflights and reads the supplied exact resource pre-state through the
   installed stateless providers; a logical ref or digest is never treated as
   a locator, prefix, store, path, object, transaction, or credential;
4. lifts and invokes the statically selected closed owner leaves in their
   declared order; every resource-using leaf owns its local transition boundary,
   consumes the current exact binding, and returns one typed mechanical receipt;
5. has the exact semantic owner consume that receipt and either continue with
   its reissued successor binding, produce an already-frozen owner cause, or
   raise a receipt-preserving `DefinitionExecutionFault<K, A, I, O>`;
6. applies the exact `Rnn` owner-output relation only after all receipts and
   owner truth required by that relation exist, then returns the ordered receipt
   journal and exact final successor handoffs with the indexed owner output; and
7. provides the exact installed stateless capabilities so the returned Effect
   is closed.

For fixed ABG-owner append definitions `E33-E35`, each existing expected-prefix
append is one independently durable owner leaf. For recursive runtime
definitions `E29-E32`, the Public binding declares only one fixed initial-to-
final runtime-prefix arm. HoG and ABG own the invocation-dependent child leaf
sequence inside that recursive frame. Every child append consumes the prior
receipt, commits its own expected-prefix transaction, and emits a journaled
successor prefix and close handoff before another child starts. The final
resource result carries the complete child journal and latest handoff. The
child sequence is neither intrinsic Public topology nor one enclosing
transaction. A later refusal or fault does not roll back or hide an earlier
admitted ABG fact. Existing owner transaction, event, Event Calculus, replay,
and fresh-process boundaries are conserved.

The structural extraction is generic and lossless. It may be generated at
build time from the closed owner contracts. Semantic factor ordering remains
in owner-authored TypeScript and is never loaded from or interpreted through
the factorization map. No binding may translate into a legacy carrier, access
a process-local carrier store, dispatch through a string/interface
placeholder, run Effect internally, return a Promise compatibility ABI, or
call Public recursively.

Public itself constructs one closed Effect program and remains exactly:

```text
admit one common PublicExecutionCandidate carrier
  -> select exact definition K
  -> admit PublicInvocation<K>
  -> derive exactly one arm from K's closed topology family
  -> structurally admit DefinitionCall<K, A, I, O> against that arm
  -> call its installed ExactDefinitionCallable<K, A, I, O> once
  -> structurally project PublicOutcome<K>
  -> preserve the resource result in one PublicExecutionReceipt
```

Outer-carrier and resource-state structural failures use the two closed refusal
types above. Common-envelope, family-selection, semantic-request admission, and
owner refusals remain their existing typed Public outcomes. The selected binding's successful
Effect value already contains the complete indexed owner output and exact
resource-transition result. `O_K` validates and projects only the unchanged
indexed owner output; `PublicExecutionReceipt` preserves the resource result
orthogonally for the next call. Public does not author topology or accept a
caller-selected arm. It applies the definition's total owner-authored arm
selector to the already admitted request, then performs only exact equality
and carrier admission against that result. It does not infer access mode,
resolve locators, read or write resources, extract owner inputs, sequence owner
factors, rehydrate domain state, map owner refusals, interpret `Cause`, build
Layers, or execute the Effect.

Exactly one package-internal host/SDK membrane executes a closed Public Effect
program with `Effect.runPromiseExit` and applies the one canonical
`Exit`/`Cause`-to-host-receipt relation. Typed execution faults, defects, and
interruptions project to adapter exit `70` without acquiring owner meaning.
The same receipt carries the successful `DefinitionResourceSuccess` unchanged;
it does not fold that state into `PublicOutcome<K>` or owner identity.
CLI, Codex, SDK conveniences, and other host adapters call that same runner;
none interprets `Exit` or `Cause` independently. A JavaScript `Promise` may
exist only as the outward transport result of this membrane, never as the
installed definition or composition ABI. There is no nested `runPromise`,
per-binding runner, adapter-specific runner, or dual production path.

The accepted Wave 1 exported Promise host port may retain its symbol and return
shape only as an outward projection over this same singular internal Effect
HoG program. New Wave 2 definition programs call the internal Effect program
directly. The retained host port may not preserve or invoke the former
imperative traversal behind its accepted interface, so preservation of the
interface does not create dual semantics.

#### 5.6.2A Canonical resource-transition algebra

**SUPERSEDED — NON-OPERATIVE IMPLEMENTATION AUTHORITY.** The resource forms,
provider relations, and transition carriers below remain evidence about owner
effects and durability boundaries only. They do not authorize a universal
resource union, topology engine, provider framework, mode selector, or runtime
carrier. Section 5.6.2C replaces their implementation interpretation.

Every definition in the exact 18-operation/56-key family declares one closed,
nonempty canonical resource-topology arm family as part of its intrinsic
definition contract. A single-arm family is still explicit; a definition whose
admitted semantic request has more than one lawful resource shape declares
every arm in the same family. This common law is intentionally bounded to
those definition
bindings. It does not impose a universal resource carrier on every executable
GraphFunction leaf. A selected GraphFunction implementation retains its own
already-declared Product/GTL effect, write-territory, and owner-transition law;
HoG threads those exact leaf inputs without importing them into Public's
definition topology.

```text
ResourceTopology<I, O> = {
  inputs: CanonicalResourceSlotSet<I>,
  outputs: CanonicalResourceSlotSet<O>
}

ReadOnly(I, O) = identities(I) - identities(O)
Mutable(I, O)  = identities(I) intersect identities(O)
Create(I, O)   = identities(O) - identities(I)
```

These set relations are the only common access classification. They determine
which declared resource identities are observed, preserved, mutated, or
created; they do not fuse their owner-leaf atomicity boundaries. A
`read`, `write`, `create`, `mutable`, or similar caller flag may describe an
owner contract for humans but cannot select mechanics. Two slots denote the
same resource only when their provider-scoped canonical resource identities
are equal. A mutable alias, branch, pointer, or named reference is a separate
mutable resource with its own identity and version; alias resolution does not
collapse it into its target.

The common carrier is:

```text
ExpectedResourceVersion<V> =
  ExactVersion<V>
  | Absent

ProviderScopedResourceIdentity<R, P, N> = {
  provider: ReferenceDigest<P>,
  namespaceRef: N,
  ownerResourceKey: R,
  identityDigest: sha256({ provider, namespaceRef, ownerResourceKey })
}

AbgEventLogLocator = {
  kind: "abg_event_log_locator",
  eventLogPath,
  device,
  inode,
  eventContractDigest,
  locatorDigest
}

ImmutableOwnerCarrierLocator = {
  kind: "immutable_owner_carrier_locator",
  ownerContractRef,
  carrierRef,
  carrierDigest,
  locatorDigest
}

CanonicalResourceLocator<R> =
  NodeFilesystemLocator
  | AbgEventLogLocator
  | ImmutableOwnerCarrierLocator

CapabilityGrantCoordinate = {
  kind: "capability_grant",
  grantRef, grantDigest,
  capabilityId, capabilityDefinitionRef, capabilityDefinitionDigest,
  actorRef, approvalRef, policyRef,
  scopeRef, scopeDigest,
  authorityBasisRef, authorityBasisDigest
}

ResourceGrantUseBasis<K, A, S, R, P> = {
  kind: "resource_grant_use_basis",
  invocationAuthorityRef, invocationAuthorityDigest,
  definitionKey: K,
  definitionRef, definitionDigest,
  resourceTopologyFamilyRef, resourceTopologyFamilyDigest,
  resourceTopologyArmRef, resourceTopologyArmDigest,
  slotRef: S,
  provider: ReferenceDigest<P>,
  resource: ProviderScopedResourceIdentity<R, P, string>,
  actions: NonEmptyCanonicalResourceActionSet,
  grant: CapabilityGrantCoordinate,
  grantUseBasisDigest
}

ResourceBinding<K, A, S, R, V, P, OS> = {
  resource: ProviderScopedResourceIdentity<R, P, string>,
  locator: CanonicalResourceLocator<R>,
  expectedVersion: ExpectedResourceVersion<V>,
  provider: ReferenceDigest<P>,
  grantUse: ResourceGrantUseBasis<K, A, S, R, P>,
  expectedOwnerState: OS
}

ResourceStateAssertion<K, A, S, R, V, P, OS> = {
  binding: ResourceBinding<K, A, S, R, V, P, OS>,
  claimedVersion: V,
  claimedDigest: Sha256Digest,
  claimedOwnerState: OS
}

CanonicalResourceStateCandidate = {
  kind: "resource_state_candidate",
  schemaVersion: "5.0.0",
  claimedResourceTopologyFamilyRef,
  claimedResourceTopologyFamilyDigest,
  claimedResourceTopologyArmRef,
  claimedResourceTopologyArmDigest,
  inputAssertions: CanonicalIJsonArray,
  outputAssertions: CanonicalIJsonArray,
  candidateDigest
}

AdmittedResourceTransitionInput<K, A, I, O> = {
  kind: "admitted_resource_transition_input",
  definitionKey: K,
  resourceTopologyArm: SelectedIntrinsicResourceTopologyArm<K, A>,
  inputs: CanonicalResourceStateAssertionSet<I>,
  outputs: CanonicalResourceBindingSet<O>
}

ResourceOccurrenceCoordinate = {
  occurrenceRef,
  occurrenceDigest,
  ordinal: PositiveInteger
}

ResourceTransitionScope<S> =
  | { kind: "slot", slotRef: S }
  | { kind: "atomic_slot_set", slotRefs: NonEmptyCanonicalRefSet<S>,
      atomicSetRef, atomicSetDigest }

ResourceTransitionPredecessor =
  | { kind: "execution_candidate", candidateRef, candidateDigest }
  | { kind: "resource_receipt", receiptRef, receiptDigest }
  | { kind: "durable_prefix", prefix: DurablePrefixCoordinate,
      closeHandoff: EventStoreCloseHandoff }

ResourceOwnerLeafCoordinate =
  | {
      kind: "intrinsic_owner_leaf",
      ownerLeafRef, ownerLeafDigest,
      ownerContractRef, ownerContractDigest
    }
  | {
      kind: "abg_recursive_child_owner",
      ownerLeafRef, ownerLeafDigest,
      ownerContractRef, ownerContractDigest,
      admittedGraphFunctionRef, admittedGraphFunctionDigest,
      executionBasisRef, executionBasisDigest,
      eventContractRef, eventContractDigest
    }

ResourceTransitionCoordinate<
  K, A, L extends ResourceOwnerLeafCoordinate, N, S
> = {
  definitionKey: K,
  definitionRef, definitionDigest,
  resourceTopologyFamilyRef, resourceTopologyFamilyDigest,
  resourceTopologyArmRef, resourceTopologyArmDigest,
  ownerLeaf: L,
  occurrence: ResourceOccurrenceCoordinate & { ordinal: N },
  resourceScope: ResourceTransitionScope<S>,
  predecessor: ResourceTransitionPredecessor
}

ResourceTransitionReceipt<K, A, L, N, S> = {
  receiptRef,
  receiptDigest
} & (
  | {
      coordinate: ResourceTransitionCoordinate<K, A, L, N, S>,
      transitionDisposition: "observed_unchanged",
      before: CanonicalResourceStateSet,
      successorBindings: CanonicalResourceBindingSet,
      ownerEvidence: ExactOwnerResourceEvidence<K, A, L>,
      commitEvidence: null,
      compensationEvidence: null
    }
  | {
      coordinate: ResourceTransitionCoordinate<K, A, L, N, S>,
      transitionDisposition: "committed",
      before: CanonicalResourceStateSet,
      successorBindings: NonEmptyCanonicalResourceBindingSet,
      newCommit: true,
      ownerEvidence: ExactOwnerResourceEvidence<K, A, L>,
      commitEvidence: ClosedResourceCommitEvidence<K, A, L>,
      compensationEvidence: null
    }
  | {
      coordinate: ResourceTransitionCoordinate<K, A, L, N, S>,
      transitionDisposition: "idempotent_no_new_commit",
      before: CanonicalResourceStateSet,
      successorBindings: NonEmptyCanonicalResourceBindingSet,
      newCommit: false,
      ownerEvidence: ExactOwnerResourceEvidence<K, A, L>,
      existingStateEvidence: ClosedResourceObservedState<K, A, L>,
      compensationEvidence: null
    }
  | {
      coordinate: ResourceTransitionCoordinate<K, A, L, N, S>,
      transitionDisposition: "residue_or_compensation_recorded",
      before: CanonicalResourceStateSet,
      visibleBindings: CanonicalResourceBindingSet,
      ownerEvidence: ExactOwnerResourceEvidence<K, A, L>,
      commitEvidence: ClosedResourceCommitEvidence<K, A, L> | null,
      compensationEvidence: ClosedResourceCompensationEvidence
    }
  | {
      coordinate: ResourceTransitionCoordinate<K, A, L, N, S>,
      transitionDisposition: "substrate_fault",
      before: CanonicalResourceStateSet,
      visibleBindings: CanonicalResourceBindingSet,
      ownerEvidence: ExactOwnerResourceEvidence<K, A, L> | null,
      fault: ClosedResourceSubstrateFault,
      commitEvidence: ClosedResourceCommitEvidence<K, A, L> | null,
      compensationEvidence: ClosedResourceCompensationEvidence | null
    }
)

OrderedResourceTransitionReceiptSet<K, A> =
  duplicate-free readonly ResourceTransitionReceipt<K, A, *, *, *>[]
  ordered by occurrence.ordinal with every predecessor equal to the preceding
  receipt or the admitted initial execution/prefix coordinate

OwnerTransportSubstrateFault<K, A> = {
  kind: "owner_transport_substrate_fault",
  definitionKey: K,
  resourceTopologyArmRef,
  ownerContractRef,
  code: "promise_rejected" | "subprocess_exit" | "package_io",
  diagnosticRef,
  faultDigest
}

TypedDefinitionSubstrateFault<K, A> =
  | {
      kind: "resource_substrate_fault",
      definitionKey: K,
      resourceTopologyArmRef,
      transitionCoordinate,
      fault: ClosedResourceSubstrateFault
    }
  | OwnerTransportSubstrateFault<K, A>

CanonicalResourceResidueEvidenceSet<K, A> =
  canonical projection of every receipt in
  OrderedResourceTransitionReceiptSet<K, A> whose disposition is
  "residue_or_compensation_recorded" or "substrate_fault";
  no independently authored residue row is admitted

DefinitionResourceSuccess<K, A, I, O> = {
  definitionKey: K,
  resourceTopologyArm: SelectedIntrinsicResourceTopologyArm<K, A>,
  resourceReceipts: OrderedResourceTransitionReceiptSet<K, A>,
  observedInputs: CanonicalResourceStateSet<I>,
  successorBindings: CanonicalResourceBindingSet<O>,
  finalHandoffs: CanonicalResourceHandoffSet<O>
}
```

`receiptDigest` is SHA-256 over the RFC-8785 receipt row with `receiptRef` and
`receiptDigest` omitted; `receiptRef` is
`resource-transition-receipt:sha256:<receiptDigest>`. Occurrence ordinal is
local to the definition call and cannot be inferred from array position.

The grant preimage is complete. `CapabilityGrantCoordinate.grantDigest` is the
SHA-256 digest of its canonical row with `grantRef` and `grantDigest` omitted,
and `grantRef` is `capability-grant:sha256:<grantDigest>`, exactly as fixed by
the accepted S06 owner contract. `grantUseBasisDigest` covers every other field
of `ResourceGrantUseBasis` with the digest omitted. Admission proves that the
coordinate occurs in the admitted invocation authority's
`slots.capability_grants`, that actor and authority basis match that invocation,
that capability and definition match K, and that its scope covers exactly the
selected arm, provider, resource identity, slot, and actions. The provider
repeats that equality check before access. There is no grant lookup, credential
lookup, environment-variable authority, or process-local capability registry.

The mechanical carrier tags are closed rather than placeholders:

```text
NodeFilesystemLocator = {
  kind: "node_filesystem_locator",
  canonicalAbsolutePath,
  locatorDigest
}

NodeFilesystemObservation = {
  kind: "node_filesystem_observation",
  existence: "absent" | "file" | "directory",
  device: integer | null,
  inode: integer | null,
  mode: integer | null,
  byteLength: nonnegative_integer | null,
  contentDigest: Sha256Digest | null,
  canonicalTreeDigest: Sha256Digest | null,
  observationDigest
}

NodeFilesystemCommitEvidence = {
  kind: "node_filesystem_commit_evidence",
  operation: "create_file" | "create_directory" | "write_file" |
             "atomic_replace",
  before: NodeFilesystemObservation,
  after: NodeFilesystemObservation,
  writtenContentDigest: Sha256Digest | null,
  commitDigest
}

NodeFilesystemCompensationEvidence = {
  kind: "node_filesystem_compensation_evidence",
  attempted: "remove_created_path" | "restore_prior_bytes" |
             "remove_staging_path",
  disposition: "completed" | "refused",
  beforeCompensation: NodeFilesystemObservation,
  afterCompensation: NodeFilesystemObservation,
  fault: NodeFilesystemSubstrateFault | null,
  compensationDigest
}

NodeFilesystemSubstrateFault = {
  kind: "node_filesystem_substrate_fault",
  code: "not_found" | "already_exists" | "not_directory" |
        "permission_denied" | "read_only" | "no_space" |
        "io" | "unclassified_node_error",
  operation,
  locator: NodeFilesystemLocator,
  message,
  visibleState: NodeFilesystemObservation | null,
  faultDigest
}

FilesystemResourceHandoff = {
  kind: "filesystem_resource_handoff",
  successorBinding,
  successorObservation: NodeFilesystemObservation,
  handoffDigest
}

ImmutableResourceObservation = {
  kind: "immutable_resource_observation",
  ownerContractRef,
  carrierRef,
  carrierDigest,
  exactVersion,
  observationDigest
}

ImmutableResourceHandoff = {
  kind: "immutable_resource_handoff",
  successorBinding,
  carrierRef,
  carrierDigest,
  exactVersion,
  handoffDigest
}

OwnerResourceContractByCoordinate =
  closed generated map [DefinitionKey][TopologyArmKey][OwnerLeafRef] -> {
    ownerPackageExport,
    ownerTypeScriptSymbol,
    observedState,
    ownerEvidence,
    admissionValue,
    ownerRefusal
  }

AbgRecursiveChildOwnerContract<L> =
  exact installed ABG owner contract selected by
  L.ownerContractRef/L.ownerContractDigest and the admitted ExecutionBasis;
  it exposes the existing typed ABG admission value/refusal and no Public field

ExactOwnerResourceEvidence<K, A, L> =
  L.kind == "abg_recursive_child_owner"
    ? AbgRecursiveChildOwnerContract<L>["ownerEvidence"]
    : OwnerResourceContractByCoordinate[K][A][L.ownerLeafRef]["ownerEvidence"]

ClosedResourceObservedState<K, A, L> =
  NodeFilesystemObservation
  | ImmutableResourceObservation
  | DurablePrefixCoordinate
  | (L.kind == "abg_recursive_child_owner"
      ? DurablePrefixCoordinate
      : OwnerResourceContractByCoordinate[K][A][L.ownerLeafRef]["observedState"])

ClosedResourceCommitEvidence<K, A, L> =
  NodeFilesystemCommitEvidence
  | RuntimeEventTransactionResult<
      L.kind == "abg_recursive_child_owner"
        ? AbgRecursiveChildOwnerContract<L>["admissionValue"]
        : OwnerResourceContractByCoordinate[K][A][L.ownerLeafRef]["admissionValue"]
    >
  | ArtifactOwnerResult<ProductInstall>

ClosedResourceCompensationEvidence =
  NodeFilesystemCompensationEvidence

ClosedResourceSubstrateFault =
  NodeFilesystemSubstrateFault
  | EventStoreAppendRefusal

CanonicalResourceHandoff =
  FilesystemResourceHandoff
  | EventStoreCloseHandoff
  | ImmutableResourceHandoff
```

`OwnerResourceContractByCoordinate` is generated from the accepted 56-key
definition family and Table 5.6.3-B/B2/D; it is a closed compile-time map, not
a runtime registry or string dispatch. Every cell names one exact TypeScript
symbol and package export, and construction fails for a missing or additional
cell. It is generated as a type projection of the one intrinsic definition
family and cannot be authored, loaded, or admitted as another catalog. The
present owner binding families are:

| Resource boundary | Exact owner carrier/refusal/evidence binding |
|---|---|
| workspace create/open filesystem | `product/workspace_operations.ts`: `WorkspaceCreateResult`, `WorkspaceOpenProjection`, and `WorkspaceOperationRefusal`; locator comes only from the admitted owner packet's `targetRoot` and the minimal Node observation above records physical mechanics |
| Product verification | `product/contracts.ts`: `VerifyProductRequest.artifactPath`, `VerifiedProductArtifact`, and `ProductVerificationRefusal` |
| Product resolve | `product/environment.ts`: `ResolvedProductLock` and `EnvironmentRefusal`; every consumed artifact remains the exact verified carrier above |
| Product installation | `product/contracts.ts`: `InstallProductRequest.artifactPath`, `InstallProductRequest.targetRoot`, `ProductInstallCandidate`, and `ProductInstallRefusal`; durable install truth is the exact `abg/environment_admission.ts` `ArtifactOwnerResult<ProductInstall>` |
| Product materialization | `product/materialization_operations.ts`: `ProductMaterializationResult`, `ProductMaterializationRefusal`, `MaterializationRow`, `MaterializationManifestCoordinate`, and `MaterializationContentCoordinate`; the minimal Node observation supplies only physical before/after/residue evidence absent from those semantic carriers |
| ABG durable reads/appends | `abg/event_store.ts`: `DurablePrefixCoordinate`, `EventStoreReopenAuthority`, `EventStoreCloseHandoff`, `EventStoreAppendRefusal`, and `RuntimeEventTransactionResult<T>`; artifact admission additionally uses `abg/environment_admission.ts` `ArtifactOwnerResult<T>` |
| immutable Product, GTL, Validator, catalog, view, application, result, assessment, and contract reads | the exact native carrier named by the selected `Lnn`/`Jnn` row plus its already-defined ref/digest; no generic physical observation or new owner result is introduced |

The `abg_recursive_child_owner` alternative is not a Public-family cell. HoG
selects its already-loaded GraphFunction implementation under the admitted
ExecutionBasis; ABG resolves the exact existing child-owner contract and emits
its typed admission result. The journal preserves that concrete contract,
GraphFunction, basis, and event-contract identity. Public receives the final
journal but cannot enumerate, select, or execute its children.

`ExactOwnerResourceEvidence<K, A, L>` is the closed type-level lookup from K,
the selected arm A, and owner leaf L to this table and the exact Table
5.6.3-B/B2 owner symbol. A load receipt must resolve that type. `JsonValue`, an
interface-only port, a string owner name, or a caller-authored evidence object
cannot satisfy it. The Node filesystem observation/commit/compensation/fault
and successor-handoff rows are the irreducible mechanical carrier selected by
the foundation ledger in Section 10.1.3; they acquire no Product or ABG
meaning.

The type indexes name owner-declared slots; the values carry the dynamic exact
identities and versions. Input and output sets are duplicate-free and
canonically ordered. Every input requires `ExactVersion`. At preflight the
provider re-identifies the resource and its observed identity and version must
equal the binding identity and exact expected version;
`ResourceBinding.provider` must equal
`ResourceBinding.resource.provider`; `Absent` must observe absence. An
`I intersect O` row must carry the same resource, locator, provider, grant-use
basis, and expected pre-state on both sides. A definition cannot recover a missing locator
or state from a logical ref, path convention, current process, ambient
workspace, registry, fixture, or store tail.

Before any parallel or effectful step, provider-scoped identities are compared
for duplicate slots, aliases, ancestor/descendant write overlap, and output
collision. Disjointness is proven only after this preflight. Alias resolution
may produce an observation used by the exact owner, but cannot merge two
resource identities or silently redirect a write.

`transitionDisposition` reports mechanics, not semantic success or refusal.
`idempotent_no_new_commit` truthfully identifies equal existing state and never
claims a new commit. Whether an exact existing state is an idempotent success,
collision, or semantic refusal is an owner allocation/pre-state law fixed by
the selected arm's owner contract; it is never a separate topology arm and is
never chosen by a caller mode. Every `committed` or idempotent receipt reissues an exact
successor binding, version, and handoff consumable by the next owner leaf or a
later call. Residue, compensation, and substrate-fault receipts preserve every
visible binding and all evidence even when no successful `DefinitionReturn`
exists. The exact semantic owner consumes the receipt and applies the already-
frozen `Rnn` relation at its lawful locus. The generic carrier cannot invent or
normalize an owner result, nonterminal, refusal, retry, rollback, or success.

Output allocation is selected by the exact owner contract, not inferred from a
path or assumed to be content-addressed:

```text
OutputAllocation =
  caller_target_create
  | content_addressed_derivation
  | owner_versioned
  | server_allocated
```

The transition laws are:

1. **Read-only** — identify and read the declared exact version, return an
   `observed_unchanged` receipt, and perform no write.
2. **Same-resource mutation** — validate the exact pre-state, default to one
   writer, transform, re-identify immediately before the owner commit, apply
   the exact owner-selected conditional commit, and reissue the successor. ABG
   expected-prefix admission is a true atomic compare-and-append. The current
   Product filesystem owners use only the atomicity actually supplied by their
   exact create/write/stage/rename operation; they do not claim a generic
   multi-file CAS and preserve residue if a later file step fails. Product
   selects Node filesystem identity/content/tree observations for workspace
   mechanics; it does not presently define a Git commit as workspace state.
   Git may refine that state only when an exact Product owner contract selects
   and types it. A different concurrency law requires an existing owner
   requirement and ABG-admitted safety basis; the generic provider cannot
   select it.
3. **Distinct-output creation** — preserve every input and apply exactly one
   owner-declared allocation. `caller_target_create` requires the caller-bound
   absent target. `content_addressed_derivation` derives identity from exact
   bytes and permits no unequal collision. `owner_versioned` derives identity
   from the owning version relation. `server_allocated` accepts only an owner-
   authorized identity returned by that server. An existing equal output is
   idempotent only when the owner contract declares that law and yields an
   `idempotent_no_new_commit` receipt. Independent outputs are mechanically
   parallel-safe only after provider-scoped identity and write-territory
   preflight proves them disjoint.

Each resource-using `L`, `J`, or `X` leaf owns its own atomicity boundary and
emits one receipt before composition continues. Multi-resource work does not
acquire a generic distributed transaction. One owner expression must use an
already selected atomic provider boundary or its declared staging, recovery,
and compensation law. Effect `Scope` may guarantee mechanical release and
invoke an owner-selected compensation callable; it does not invent Saga,
retry, rollback, publication, or refusal meaning.

ABG append is the existing ABG-owner refinement of same-resource mutation. Each
expected-prefix append checks one exact predecessor, atomically admits its
owner event batch, and returns a successor prefix and owner-issued close
handoff. That receipt becomes the next leaf's input. No common provider groups
separate ABG appends, physical effects, or replay into one transaction.

Owner refinements preserve stronger state rather than weakening the common
carrier:

| Resource owner/refinement | Required exact pre-state | Required successor or read evidence |
|---|---|---|
| Product mutable worksite | provider-scoped canonical root identity, exact `NodeFilesystemObservation`, provider and complete grant-use basis; a Git commit/tree is added only by an exact Product refinement that types it | committed successor filesystem observation and handoff; exact no-new-commit equality; or visible residue/compensation/fault evidence |
| ABG durable event resource | provider-scoped store identity, `DurablePrefixCoordinate`, and matching `EventStoreReopenAuthority`/prior close handoff | one independently durable expected-prefix owner result plus successor prefix and owner-issued close handoff |
| immutable carrier/file/object/artifact | provider-scoped identity, credential-free canonical locator, and exact object version/content digest | exact bytes/value and digest read; or owner-allocated output identity/version, equality/collision disposition, and reissued binding |
| database/API transactional resource when an exact 18/56 owner selects it | provider-scoped resource identity plus owner-selected transaction/version token | owner transaction result and successor token/version, idempotent equality, or exact residue/compensation/fault evidence |

`WorkspaceBinding`, Product, Program, GraphFunction, overlay, catalog, and
other immutable semantic carriers remain distinct from mutable worksite
versions. A new worksite observation does not mutate any of those identities.
Program entry threads the exact resource pre-state; selected implementation
effects perform only the declared transformation; the semantic owner consumes
each receipt and decides its result/refusal; and ABG admits the causal runtime
truth when the governing event-admission contract requires it. Resource
mechanics never become GTL topology, HoG traversal, ABG currentness, or Event
Calculus truth.

Effect providers are stateless capabilities only. Their closed mechanical
surface for the exact 18/56 topology forms is `identify`, `read`, `create`,
`write`, `commit`, and `compensate`; each installed definition
receives only the subset named by its selected intrinsic topology arm.
Providers cannot carry a current resource, selected version, semantic input,
actor, Run, cursor, or event prefix in `Context` or `Layer`. The installed host
loads the verified binding whose private closure has already provisioned the
Layer once and exposes only an `R = never` definition program.

This common algebra does not claim publication, subprocess execution, external
side effects, deletion, remote allocation, or arbitrary GraphFunction effects.
Where an exact 18/56 trace crosses one of those boundaries, its existing `Xnn`
or semantic owner retains the complete law and either returns evidence into the
typed receipt or marks the transition not applicable at this Wave. In
particular, `X02` retains its exact Product install/subprocess behavior and
`X04` remains unreachable in Wave 2. No generic provider acquires their
semantics.

OS permissions, Git access, IAM, database grants, and remote API security
authenticate and enforce physical access outside ABIogenesis. A
`ResourceBinding` carries the complete digest-bound `ResourceGrantUseBasis`
and accepted grant coordinate, never a
credential, token, private key, or secret; its canonical locator is likewise
credential-free. ABIogenesis validates that the declared capability, provider,
actor, and resource scope match the admitted
definition. The resolved grant must equal one admitted invocation-authority
grant and cover that exact provider/resource/action scope; a provider
cannot widen it. ABIogenesis records only the required actor, resource pre/post
identity, GraphFunction, invocation, provider, causation, and provenance facts.
Secrets and credentials never enter Public identity, ABG events, replay,
projections, or evidence artifacts. External enforcement does not acquire
Product, admission, traversal, or lifecycle meaning.

#### 5.6.2B Intrinsic topology and installed-binding identity

**SUPERSEDED — NON-OPERATIVE IMPLEMENTATION AUTHORITY.** The `T0-T9` forms and
the family/arm/load identities below remain a historical proof partition over
the fixed 18/56 census. They are not TypeScript runtime types, callback
registries, per-key construction requirements, or a primitive budget. Section
5.6.2C replaces this subsection for implementation.

The exact reusable topology forms are closed for the 18/56 family:

| Form | Canonical slots and required pre-state | Required capability/refinement | Successor, allocation, and atomicity |
|---|---|---|---|
| `T0 value_only` | no physical or durable resource slot; all required values are complete immutable admitted inputs | none | no resource receipt or allocation; owner relation is pure |
| `T1 carrier_read<S>` | named immutable carrier/file/object/package slots `S`, each with provider-scoped identity, locator, exact version and digest | stateless `identify/read`; exact immutable-carrier, filesystem-object, installed-package, or load-receipt refinement selected by the intrinsic contract | one independently validated `observed_unchanged` receipt per slot; no allocation |
| `T2 worksite_read<W>` | named worksite `W` at exact Product-selected filesystem version/observation; an exact future Git refinement may additionally carry repository/worktree identity, commit, and complete tree | stateless `identify/read` | unchanged observation; no allocation or write |
| `T3 caller_target_create<W>` | named output `W` with caller-bound provider identity/locator and `Absent` | stateless `identify/create/commit/compensate`; Product filesystem refinement | exclusive caller-target creation; exact successor binding/tree/handoff or residue/fault receipt; owner-leaf atomicity |
| `T4 caller_target_create_or_idempotent<W>` | named output `W` with `Absent` for creation or exact existing version for the owner-declared idempotent case | `T3` capabilities plus exact equality read | caller-target or owner-versioned allocation as fixed by the class row; equal existing state yields `idempotent_no_new_commit`, unequal state collides; owner-leaf atomicity |
| `T5 worksite_mutation<W>` | the same provider-scoped worksite identity occurs in input and output at exact expected version | stateless `identify/read/write/commit/compensate`; exact Product filesystem refinement | single-writer expected-version revalidation plus only the per-operation filesystem atomicity selected by Product; exact successor observation/handoff or visible residue/compensation/fault; no generic multi-file CAS |
| `T6 content_derivation<S,O>` | immutable inputs `S` plus distinct output slots `O` with identities derived from exact bytes and expected `Absent` or exact equal existing version | stateless `identify/read/create/commit/compensate`; immutable object/file refinement | content-addressed allocation only; inputs preserved; each output independently receipts created/idempotent/collision/residue under the owner staging law |
| `T7 abg_prefix_read<A>` | provider-scoped ABG store `A`, exact `DurablePrefixCoordinate`, and matching reopen/prior-close handoff | stateless exact-store open/read mechanics plus ABG prefix validator; no generic event interpretation | unchanged exact-prefix receipt; no append or successor event truth |
| `T8 abg_prefix_append<A>` | the same ABG store is input/output with exact predecessor prefix/reopen authority | existing ABG owner candidate/admission callable over stateless exact-store mechanics | one independently durable expected-prefix transaction; successor prefix and owner-issued close handoff reissued before the next leaf |
| `T9 recursive_abg_prefix_frame<A>` | one provider-scoped ABG store and exact initial `DurablePrefixCoordinate` plus reopen/prior-close handoff; one final slot names the same store at its latest successor | existing HoG/ABG recursive owner execution over stateless exact-store mechanics | one fixed initial-to-final resource relation whose result is the complete ordered child receipt journal and latest close handoff; every child append is separately durable and no enclosing atomic commit is implied |

`server_allocated` remains a lawful allocation tag in the common carrier, but
no current Wave 2 definition selects it. Publication, subprocess, deletion,
and arbitrary external effects are not smuggled into `T0-T9`; their exact owner
relations remain outside the shared provider surface.

A `T9` arm's `ownerLeafAtomicityRefs` names the existing closed ABG recursive-
child owner-contract family, not an invocation-specific child list. Each
journal receipt then names the concrete admitted GraphFunction, ExecutionBasis,
owner contract, event contract, occurrence, predecessor, and successor. This
keeps the intrinsic family fixed while making every realized child transition
exact.

The intrinsic topology is identity-bearing and source independent:

```text
IntrinsicResourceTopologyArm<K, A> = {
  kind: "intrinsic_resource_topology_arm",
  definitionKey: K,
  expressionClass: E01 | ... | E40,
  armKey: A,
  armRef,
  inputSlots: CanonicalResourceSlotSpecificationSet,
  outputSlots: CanonicalResourceSlotSpecificationSet,
  orderedTransitionForms: readonly (T0 | ... | T9)[],
  requiredProviderCapabilityRefs: CanonicalRefSet,
  ownerLeafAtomicityRefs: CanonicalRefSet,
  ownerResourceBindingContractRefs: CanonicalRefSet,
  outputAllocationBySlot: CanonicalAllocationMap,
  armDigest
}

topologyArmDigest(K, A) =
  sha256(RFC8785(IntrinsicResourceTopologyArm<K, A>
    with armRef and armDigest omitted))

topologyArmRef(K, A) =
  resource-topology-arm:sha256:<topologyArmDigest(K, A)>

IntrinsicResourceTopologyFamily<K, A> = {
  kind: "intrinsic_resource_topology_family",
  definitionKey: K,
  expressionClass: E01 | ... | E40,
  resourceTopologyFamilyRef,
  arms: NonEmptyCanonicalMap<A, IntrinsicResourceTopologyArm<K, A>>,
  armSelection: {
    kind: "owner_request_discriminant",
    selectorContractRef,
    selectorContractDigest,
    totality: "exactly_one_for_every_admitted_request",
    cases: NonEmptyCanonicalArmDiscriminantMap<A>
  },
  requiredProviderCapabilityRefs: CanonicalRefSet,
  resourceTopologyFamilyDigest
}

resourceTopologyFamilyDigest(K) =
  sha256(RFC8785(IntrinsicResourceTopologyFamily<K, A>
    with resourceTopologyFamilyRef and resourceTopologyFamilyDigest omitted))

resourceTopologyFamilyRef(K) =
  resource-topology-family:sha256:<resourceTopologyFamilyDigest(K)>

SelectedIntrinsicResourceTopologyArm<K, A> = {
  definitionKey: K,
  resourceTopologyFamilyRef, resourceTopologyFamilyDigest,
  resourceTopologyArmRef, resourceTopologyArmDigest,
  armKey: A,
  inputSlots,
  outputSlots,
  ownerResourceBindingContractRefs
}

selectTopologyArm<K, A>(
  IntrinsicResourceTopologyFamily<K, A>,
  PublicInvocation<K>
) -> exactly one SelectedIntrinsicResourceTopologyArm<K, A>

IntrinsicDefinitionDigestProjection<K> includes {
  resourceTopologyFamilyRef,
  resourceTopologyFamilyDigest,
  completeTopologyArmRefsAndDigests,
  armSelectorContractRef,
  armSelectorContractDigest,
  requiredProviderCapabilityRefs
}

CallableContractProjection<K, A> = {
  definitionRef,
  definitionDigest,
  executionBindingSpecificationDigest,
  resourceTopologyFamilyRef,
  resourceTopologyFamilyDigest,
  completeTopologyArmRefsAndDigests,
  requiredProviderCapabilityRefs,
  callContract: DefinitionCall<K, A, I[A], O[A]>,
  returnContract: DefinitionReturn<K, A, I[A], O[A]>,
  executionFaultContract: DefinitionExecutionFault<K, A, I[A], O[A]>,
  effectRuntime: "effect@3.22.1"
}

callableContractDigest(K) =
  sha256(RFC8785(CallableContractProjection<K, A>))

DefinitionBindingLoadReceipt<K, A> = {
  installedProduct, productSet, dependencyLock,
  resolvedExport, resolvedExportDigest,
  definitionRef, definitionDigest,
  callableContractRef, callableContractDigest,
  resourceTopologyFamilyRef, resourceTopologyFamilyDigest,
  completeTopologyArmRefsAndDigests,
  requiredProviderCapabilityRefs,
  resolvedProviderIdentities,
  resolvedOwnerResourceBindingContracts,
  layerProvisionEvidence,
  providerCapabilityEqualityDisposition: "exact"
}

LoadedDefinitionBinding<K, A> = {
  kind: "loaded_definition_binding",
  definitionRef, definitionDigest,
  callableContractRef, callableContractDigest,
  resourceTopologyFamilyRef, resourceTopologyFamilyDigest,
  completeTopologyArmRefsAndDigests,
  resolvedProviderIdentities,
  loadReceipt: DefinitionBindingLoadReceipt<K, A>,
  invoke: <Arm extends A>(
    DefinitionCall<K, Arm, I[Arm], O[Arm]>
  ) -> ExactDefinitionProgram<K, Arm, I[Arm], O[Arm]>
}

DefinitionBindingLoadFault<K, A> = {
  kind: "definition_binding_load_fault",
  definitionKey: K,
  resourceTopologyFamilyRef,
  code: "installed_product_mismatch" | "dependency_lock_mismatch" |
        "export_absent" | "export_digest_mismatch" |
        "callable_contract_mismatch" | "topology_family_mismatch" |
        "owner_resource_contract_mismatch" |
        "provider_capability_mismatch" | "provider_load_fault",
  evidenceRefs: CanonicalRefSet
}

LoadInstalledDefinitionBinding<K, A> =
  (verified installed Product, ProductSet, dependency lock,
   intrinsic definition and callable contract)
    -> Effect.Effect<
         LoadedDefinitionBinding<K, A>,
         DefinitionBindingLoadFault<K, A>,
         Scope.Scope
       >
```

Every family is nonempty and its digest covers the complete arm map and total
selector. The selector reads only an already admitted semantic request
discriminant or exact owner-contract coordinate. It is deterministic and total:
zero or multiple matching arms is an intrinsic construction defect before any
resource access, not a caller-visible fallback. A `resourceStateCandidate`
cannot select an arm, and absent versus exact-existing idempotent pre-state is
an owner allocation law within one arm.

The complete conditional-arm audit is closed:

| Definition class | Closed arm keys | Total selector source |
|---|---|---|
| `E03 catalog_list` | `workspace_catalog`, `session_view` | the admitted visibility basis plus the matching invocation-authority catalog-scope state fixed by the Product catalog owner contract |
| `E04 catalog_describe` | `workspace_catalog`, `session_view` | the admitted visibility basis plus the matching invocation-authority catalog-scope state fixed by the Product catalog owner contract |
| `E22 product_verify` | `packed_artifact`, `installed_artifact` | the admitted verification-source variant |
| `E36 validator_attest` | `program_only`, `declared_inventory` | the admitted Validator conformance variant |

Every other exact definition key has one arm. `E01` clean/imported and the
`E35` witness cases are already distinct definition keys, so their member key
selects a single family rather than hiding a conditional arm. Runtime start,
continuation, retry, and semantic result variants do not change the `E29-E32`
initial-to-final prefix arm. No other request-dependent resource shape was
found in the exhaustive `E01-E40` audit. Adding one later requires a
requirement/design re-entry and changes the family digest; it cannot appear as
an optional slot.

The topology family, complete arm set, selected arm, and required provider-
capability set participate in the intrinsic definition, callable-contract,
call, transition-receipt, load-receipt, and host-receipt identities. Concrete
provider identity is selected only by the admitted installed Product/lock and
is proven equal to the intrinsic capability set by the load receipt. The load
receipt itself remains downstream evidence and does not enter intrinsic,
family, Product-content, invocation, event, or replay identity.

`LoadedDefinitionBinding` exposes only immutable identity/load evidence and the
closed `invoke`. The installed loader resolves provider implementations,
constructs and provides the exact Effect `Layer` once inside its load `Scope`,
and returns an invocation with `R = never` valid only for that scope. Closing
the scope releases the mechanical providers. No `providerLayer`, `Context`,
mutable provider state, or provider-construction hook escapes the loader.
Public cannot provide, replace, or inspect the Layer.

This explicitly supersedes the accepted unary PFC-F05 call/load relation. Its
conserved replacement is:

```text
PFC-F05 InvokeInstalledDefinitionBinding<K, A, I, O>(
  admitted DefinitionCall<K, A, I, O>,
  exact LoadedDefinitionBinding<K, A>
)
  -> Effect<
       DefinitionReturn<K, A, I, O>,
       DefinitionExecutionFault<K, A, I, O>,
       never
     >
```

Public still selects one already loaded binding and calls it once. It neither
constructs the topology, selects or builds providers, interprets receipts,
sequences owner leaves, nor applies `Rnn`. One package-internal host membrane
runs the closed Effect and emits the canonical `PublicExecutionReceipt`.

#### 5.6.4 Exact 56-key functional factorization map

Path abbreviations below are relative to
`build_tenants/abiogenesis/typescript/code/src/`: `P` is `product`, `A` is
`abg`, `G` is `gtl`, `H` is `hog`, and `V` is `validator`. `Raw binding` means
the useful function accepts a lower owner packet/carrier rather than the exact
installed `PublicInvocation<K>` ABI. `Legacy composition` means the useful
leaves exist but are still sequenced in the replacement target
`public/operations.ts`; it is a deletion input, never an accepted owner path.

| Exact definition key `K` | Entity / class | Canonical operator expression | Semantic owners and static composition | Current callable loci | Effect and current gap |
|---|---|---|---|---|---|
| `abg.operation.workspace.create#clean` | Workspace / artifact-effect | validate clean policy -> inspect target -> construct authority and manifest -> exclusive materialize | Product | `P/workspace_operations.ts:createWorkspace` | Raw binding; schema/carrier mismatch; multi-file failure boundary requires staging or compensation. |
| `abg.operation.workspace.create#imported` | Workspace / artifact-effect | validate import authority and preservation -> inspect existing target -> construct authority and manifest -> exclusive materialize | Product; same parameterized creation callable, distinct preservation law | `P/workspace_operations.ts:createWorkspace` | Raw binding; preservation is recorded but recursive non-overwrite proof remains incomplete. |
| `abg.operation.workspace.open#open` | Workspace / read | read and parse manifest -> reconstruct and digest-check -> compare expected authority -> readiness projection | Product | `P/workspace_operations.ts:openWorkspace` | Raw binding; result schema must admit nullable malformed/stale coordinates carried by the lawful projection. |
| `abg.operation.project.read#catalog_list` | CatalogSnapshot / read | validate source and visibility -> canonical row selection -> projection envelope | Product | `P/project_read_ports.ts:projectCatalogList` | Derived projection; raw binding; contract/live row shape and installed export differ. |
| `abg.operation.project.read#catalog_describe` | CatalogEntry / read | validate source/view -> exact handle selection -> description projection | Product | `P/project_read_ports.ts:projectCatalogDescription` | Derived projection; preserves typed unknown/ambiguous/hidden; raw binding and carrier rehydration gap. |
| `abg.operation.project.read#workspace_status` | WorkspaceBinding / read | rehydrate lock, ProductSet, and binding -> validate coherence -> status projection | Product over ABG-projected admitted binding | `P/project_read_ports.ts:projectWorkspaceStatus` | Derived projection; coordinate-to-carrier rehydration and result-shape gap. |
| `abg.operation.project.read#run_status` | Run / read | validated prefix -> Event Calculus and replay -> scoped lifecycle projection | ABG | `A/project_read_ports.ts:projectRunStatus` | Derived projection; raw binding only. |
| `abg.operation.project.read#graph_call_status` | GraphCall / read | validated prefix -> Event Calculus and replay -> scoped lifecycle projection | ABG | `A/project_read_ports.ts:projectGraphCallStatus` | Derived projection; raw binding only. |
| `abg.operation.project.read#run_result` | RunResult / read | replay terminal truth -> exact result, stop, or gap projection | ABG | `A/project_read_ports.ts:projectRunResult` | Derived projection; raw binding only. |
| `abg.operation.project.read#graph_call_result` | GraphCallResult / read | replay scope -> admitted CCall outcome/result -> projection | ABG | `A/project_read_ports.ts:projectGraphCallResult` | Derived projection; raw binding only. |
| `abg.operation.project.read#run_evidence` | RunEvidence / read | scoped replay rows -> common causal evidence projection | ABG | `A/project_read_ports.ts:projectRunEvidence`, `evidenceProjection` | Derived projection; shared evidence algebra; raw binding only. |
| `abg.operation.project.read#graph_call_evidence` | GraphCallEvidence / read | scoped replay rows -> common causal evidence projection | ABG | `A/project_read_ports.ts:projectGraphCallEvidence`, `evidenceProjection` | Derived projection; shared evidence algebra; raw binding only. |
| `abg.operation.project.read#result_evidence` | ResultEvidence / read | exact result -> CCall scope -> common causal evidence projection | ABG | `A/project_read_ports.ts:projectResultEvidence`, `evidenceProjection` | Derived projection; shared evidence algebra; raw binding only. |
| `abg.operation.project.read#assessment_evidence` | AssessmentEvidence / read | admitted assessment event -> common causal evidence projection | ABG | `A/project_read_ports.ts:projectValue` | Missing projection: currently returns `target_absent` unconditionally although assessment admission exists. |
| `abg.operation.project.read#witness_evidence` | WitnessEvidence / read | admitted witnessed event -> common causal evidence projection | ABG | `A/project_read_ports.ts:projectValue` | Missing projection: currently returns `target_absent` unconditionally although witness admission exists. |
| `abg.operation.project.read#install_evidence` | ProductInstallEvidence / read | admitted install plus immutable manifest -> evidence projection | Product over ABG-projected install | `P/project_read_ports.ts:projectInstallEvidence` | Derived projection; raw binding; coordinate/full-carrier and result-shape gap. |
| `abg.operation.project.read#release_evidence` | ReleaseCutEvidence / read | release-owner result -> immutable snapshot evidence projection | release owner then Product projection | `P/project_read_ports.ts:projectReleaseEvidence` | Refusal projection only until a real release success exists; success read remains held. |
| `abg.operation.project.read#workspace_replay` | WorkspaceReplay / read | validated prefix and range -> workspace-scoped replay projection | ABG | `A/project_read_ports.ts:projectWorkspaceReplay` | Derived projection; raw binding only. |
| `abg.operation.project.read#run_replay` | RunReplay / read | validated prefix -> semantic Run replay projection | ABG | `A/project_read_ports.ts:projectRunReplay`; `A/replay.ts:projectRunSemanticReplayProjection` | Derived projection; raw binding only. |
| `abg.operation.project.read#graph_call_replay` | GraphCallReplay / read | validated prefix -> GraphCall/CCall replay projection | ABG | `A/project_read_ports.ts:projectGraphCallReplay` | Derived projection; raw binding only. |
| `abg.operation.project.read#interaction_replay` | InteractionReplay / read | replay -> pending/responded interaction projection | ABG | `A/project_read_ports.ts:projectInteractionReplay` | Derived projection; raw binding only. |
| `abg.operation.project.read#continuation_replay` | ContinuationReplay / read | replay -> exact continuation projection | ABG | `A/project_read_ports.ts:projectContinuationReplay` | Derived projection; raw binding only. |
| `abg.operation.project.read#c_call_replay` | CCallReplay / read | replay -> exact CCall outcome projection | ABG | `A/project_read_ports.ts:projectCCallReplay` | Derived projection; raw binding only. |
| `abg.operation.project.read#workspace_gaps` | WorkspaceGapSet / read | admitted route/replay truth -> workspace-scoped gap rows | ABG | `A/project_read_ports.ts:projectWorkspaceGaps`, `gapRows` | Derived projection; never evaluates a new action; raw binding only. |
| `abg.operation.project.read#run_gaps` | RunGapSet / read | admitted route/replay truth -> Run-scoped gap rows | ABG | `A/project_read_ports.ts:projectRunGaps`, `gapRows` | Derived projection; shared gap algebra; raw binding only. |
| `abg.operation.project.read#run_lawful_actions` | NextActionProjection / read | replay -> already admitted lawful-action rows | ABG | `A/project_read_ports.ts:projectRunLawfulActions` | Derived projection; must never call `evaluateNext`; raw binding only. |
| `abg.operation.project.read#ticket_consensus` | TicketConsensus / read | validate admitted Consensus result -> accepted AF-03 `projectTicketConsensus` relation -> indexed envelope | Product using the GTL-owned result relation | `P/project_read_ports.ts:projectConsensusTicket`; `G/consensus.ts:projectTicketConsensus` | Unique Product trace is selected by accepted M03 Consensus design and exists in current code. Only admitted-result source rehydration, installed binding, and exact indexed envelope remain C2 gaps; no Product re-entry is required. |
| `abg.operation.product.verify#verify` | VerifiedProductArtifact / non-mutating validation/attestation | physically read exact artifact target -> inventory/content/manifest/native-contract checks -> immutable verified carrier | Product | `P/verification_operation.ts:verifyProductArtifact`; `P/verify_product.ts:verifyProduct` | Deterministic physical reads with no mutation; raw binding; live path request is narrower than the accepted packed/installed target sum. |
| `abg.operation.product.resolve#resolve` | ResolvedProductLock / pure | validate verified requirements -> derive rows and edges -> cycle/native-closure checks -> construct lock | Product | `P/environment_operations.ts:resolveProductEnvironment`; `P/environment.ts:constructResolvedProductLock` | Raw binding; coordinate-to-verified-carrier rehydration and explicit requirement join absent. |
| `abg.operation.product.install#install` | ProductInstall / artifact-effect | verify lock membership -> physical install -> verify installed payload -> Product candidate -> ABG expected-prefix admission | Product physical owner plus ABG admission, one static binding | `P/install_operation.ts:materializeProductInstall`; `P/install_product.ts:installProduct`; `A/environment_admission.ts:admitProductInstall` | Exact composition missing; current Product wrapper stops before ABG; carrier mismatch and physical compensation boundary. |
| `abg.operation.workspace.bind#bind` | WorkspaceBinding / artifact-effect | project admitted installs -> construct ProductSet and authority -> binding candidate -> ABG expected-prefix immutable binding admission | Product construction plus ABG admission, one static binding | `P/environment_operations.ts:constructExactWorkspaceBinding`; `A/environment_admission.ts:admitWorkspaceBinding` | Exact composition missing; current wrapper stops at candidate; coordinate rehydration absent. |
| `abg.operation.catalog.admit#admit` | GraphFunctionCatalog / pure | raw-admit GTL carriers -> validate publication and Programs -> readiness/dependency/provenance conservation -> immutable catalog | Validator plus Product, one static binding | `P/catalog_operations.ts:constructReadyCatalog`; `V/raw_admission.ts:rawAdmitValue`; `V/validation.ts:validatePublication`, `validateProgram` | Eventless by law; raw binding; exact coordinate-to-readiness-basis reconstruction absent. |
| `abg.operation.catalog.view#allowlist` | CatalogView / pure | validate catalog and allowlist -> narrow-only selection -> view digest | Product | `P/catalog_operations.ts:constructCatalogView`; `P/catalog.ts:narrowGraphFunctionCatalog` | Eventless; raw binding; full unauthorized/inadmissible/not-ready refusal relation incomplete. |
| `abg.operation.catalog.apply#node_type` | CatalogApplication / pure | verify member kind and exact view row -> validate node target/value/contributor -> deterministic application | Product; same parameterized callable, node-type law | `P/catalog_operations.ts:constructCatalogApplication`; `P/catalog.ts:applyCatalogDeclaration` | Eventless; raw binding; validation receipt, provenance, and full refusal fields incomplete. |
| `abg.operation.catalog.apply#overlay` | CatalogApplication / pure | verify member kind and exact view row -> validate overlay value/contributor -> deterministic application | Product; same parameterized callable, overlay law | `P/catalog_operations.ts:constructCatalogApplication`; `P/catalog.ts:applyCatalogDeclaration` | Eventless; raw binding; same carrier/result gap. |
| `abg.operation.run.invoke#invoke` | Run and GraphCall / runtime-mutation | exact catalog selection -> invocation admission -> graph/implementation basis -> atomic open -> HoG traversal -> replay/result | Product, GTL, Validator, ABG, HoG in one installed static binding | lower leaves in `P/invocation.ts`, `A/invocation_admission.ts`, `G/graph_construction.ts`, `V/graph.ts`, `A/execution_basis.ts`, `A/open_call.ts`, `H/graph_execute.ts`; legacy sequence `public/operations.ts:applyRunInvoke` | Exact owner composition missing; sequencing must leave Public; lifecycle mutations use expected-prefix ABG transactions. |
| `abg.operation.run.invoke#start` | Run and nullable GraphCall / runtime-mutation | resolve declared public start -> same admitted execution chain | same owners; distinct target/mode/until law | `G/public_start.ts:resolveProgramStart` plus invoke leaves; legacy `public/operations.ts:applyRunInvoke` | Exact owner composition missing; no new global plan or Public selection. |
| `abg.operation.run.continue#current_intent` | Continuation / runtime-mutation | rehydrate current intent/basis/cursor -> derive successor input/cursor -> atomic resume -> HoG continuation | Product, ABG, HoG in one installed static binding | `A/continuation.ts`, `A/fh_resume_relation.ts`, `H/graph_execute.ts`; legacy `public/operations.ts:applyRunContinue` | Exact owner composition missing; current legacy branch handles only this member. |
| `abg.operation.run.continue#selected_action` | ConstructionIntent and successor / runtime-mutation | rehydrate admitted NextActionProjection -> admit ConstructionIntent -> invoke exact declared target | Product, ABG, GTL, HoG in one installed static binding | reusable truth in `A/traversal_route.ts:rehydrateConstructionIntentForCursorAtPrefix`; no exact binding | Entire member composition missing; must not conflate with current-intent resume or let caller choose topology. |
| `abg.operation.interaction.respond#select` | F_H response / runtime-mutation | rehydrate pending interaction -> Product evaluate declared choice/value -> ABG expected-prefix response admission | Product plus ABG, one parameterized static binding | reusable `P/semantics.ts:evaluateInstalledInteractionResponse`, `A/continuation.ts:prepareFhInteractionResponse`, `commitFhInteractionResponseAtExpectedPrefix`; no exact binding | Missing member realization; only this member carries non-null declared choice. |
| `abg.operation.interaction.respond#approve` | F_H response / runtime-mutation | same response composition | Product plus ABG; approve contract | same leaves; legacy `public/operations.ts:applyInteractionRespond` | Exact binding missing; sequencing must leave Public. |
| `abg.operation.interaction.respond#reject` | F_H response / runtime-mutation | same response composition | Product plus ABG; reject contract | same leaves; no exact binding | Missing member realization. |
| `abg.operation.interaction.respond#assess` | F_H response / runtime-mutation | same response composition | Product plus ABG; interaction-assessment contract | same leaves; no exact binding | Missing member realization; distinct from `result.assess`. |
| `abg.operation.interaction.respond#answer_escalation` | F_H response / runtime-mutation | same response composition plus Product correction-disposition validation | Product plus ABG; escalation-answer law | same leaves; legacy `public/operations.ts:applyInteractionRespond` | Exact binding missing; sequencing must leave Public. |
| `abg.operation.result.assess#assess` | ResultAssessment / runtime-mutation | rehydrate exact result/evidence/current basis -> validate Product assessment -> expected-prefix assessed event | Product assessment semantics plus ABG admission in owner module | `P/result_assessment_operation.ts:assessResult` | Raw binding; event admission exists, but matching evidence projection is missing. |
| `abg.operation.witness.admit#reprice` | WitnessedAct / runtime-mutation | validate actor, authority-basis subject, typed content, evidence/provenance -> atomic witnessed event | ABG; one parameterized admission callable | `A/witness_admission_operation.ts:admitWitnessedAct` | Raw binding; matching evidence projection missing. |
| `abg.operation.witness.admit#attest` | WitnessedAct / runtime-mutation | same admission with evidence-claim subject and basis context | ABG | `A/witness_admission_operation.ts:admitWitnessedAct` | Raw binding; matching evidence projection missing. |
| `abg.operation.witness.admit#hygiene-stamp` | WitnessedAct / runtime-mutation | same admission with workspace subject/context | ABG | `A/witness_admission_operation.ts:admitWitnessedAct` | Raw binding; matching evidence projection missing. |
| `abg.operation.witness.admit#intake` | WitnessedAct / runtime-mutation | same admission with intake-item subject and segment context | ABG | `A/witness_admission_operation.ts:admitWitnessedAct` | Raw binding; matching evidence projection missing. |
| `abg.operation.witness.admit#run-resumed` | Run + WitnessedAct / runtime-mutation | validate operator-stopped currentness -> construct actor-attributed transition candidate -> expected-prefix admit `run_resumed` | ABG | `A/witness_admission_operation.ts:admitWitnessedAct` | This is the lifecycle admission required by `REQ-R-ABG3-WITNESS-006`, not an attestation of an earlier resume event; caller assertion and duplicate lifecycle paths are excluded; raw binding and evidence projection remain incomplete. |
| `abg.operation.witness.admit#run-stopped` | Run + WitnessedAct / runtime-mutation | validate active Run currentness -> construct actor-attributed transition candidate -> expected-prefix admit `run_stopped` | ABG | `A/witness_admission_operation.ts:admitWitnessedAct` | This is the lifecycle admission required by `REQ-R-ABG3-WITNESS-006`, not an attestation of an earlier stop event; caller assertion and duplicate lifecycle paths are excluded; raw binding and evidence projection remain incomplete. |
| `abg.operation.conformance.evaluate#gtl_program` | ProgramConformance / pure attestation | strict I-JSON -> raw GTL admission -> whole-Program validation -> evidence and diagnostics | Validator | `V/conformance_operation.ts:evaluateGtlProgramConformance`; `V/validation.ts:validateProgram` | Raw binding; no execution or repair is lawful. |
| `abg.operation.product.materialize#context_bootstrap` | ProductMaterialization / artifact-effect | validate workspace/binding -> order content-addressed inputs -> exclusive/idempotent writes -> manifest/provenance | Product | `P/materialization_operations.ts:materializeContextBootstrap`, `persistManifest` | Raw binding and carrier mismatch; orphan content before manifest requires explicit recovery/compensation law. |
| `abg.operation.product.materialize#configuration` | ProductMaterialization / artifact-effect | validate binding/contract/I-JSON -> content-addressed write -> manifest/provenance | Product | `P/materialization_operations.ts:materializeConfiguration`, `persistManifest` | Raw binding and carrier mismatch; accepted refresh/default refusal relation incomplete. |
| `abg.operation.release.snapshot#published_rc` | ReleaseSnapshot / artifact-effect | authenticate native pre-RC subject/law/verdict, empty bypass and prospective identity -> exact immutable RC/snapshot publication | release owner | `P/release_snapshot_operations.ts:snapshotPublishedRc`, `ReleaseSnapshotPort.published_rc` | Banked refusal-only callable behavior and `v.never()` success schema remain. Native qualification integration, contract closure and physical publication remain D6 work, not completed by this design. |
| `abg.operation.release.snapshot#tapped_release` | ReleaseSnapshot / artifact-effect | authenticate native installed-RC verdict and actual human acceptance -> external addendum identifying the same unchanged RC | release owner | `P/release_snapshot_operations.ts:snapshotTappedRelease`, `ReleaseSnapshotPort.tapped_release` | Banked refusal-only callable behavior and `v.never()` success schema remain. D6 removes the old second-cut request, closes exact proof/resource/result contracts and implements only the acceptance-addendum effect. |

## 15. Pre-Baseline ABIogenesis Application (Historical Selection)

This section preserves the earlier W2-05 selection and evidence in its original
coordinates. Its selection and advancement language is non-operative. Current
Goals and T-287 own the RC6 migration and Wave 2 baseline `HOLD`; this section
grants no implementation, repair, acceptance, or release effect.

Wave 1 is the accepted functional runtime substrate. Its frozen artifact is
`ab6dd512678b873d1ef4f4a07c8286ff3621ea86b39627e6061652110238c878` and its
accepted interface receipt is
`c8c26047d36b930a820559d276daa17a51c4589605767463a51be2eb2eba0d7d`.

Wave 2 is active at `W2-05` whole-family static constructability for the exact
Program-only odd_glc Hello sentinel. W2-03 is frozen at `8e288391`; W2-04 is
complete; and banked commit `e7e252ed` records legacy/current behavior and
callability for 37/56 definitions. That behavior set is 35 active definitions
plus two release-snapshot definitions whose only lawful Wave 2 behavior is
their frozen qualification refusal. It is not proof of the newly operative
Section 5.6.2C algebra: demonstrated conformance is 0/56 pending reconciliation,
migration, or exact proof for every banked closure. The dirty five-member
interaction experiment and exact implementation subject `bf193b3d` are
distinct rejected evidence. Neither advances these axes or story points, and
`bf193b3d` does not promote the ledger to 39/56.

The remaining exact binding disposition is:

| Definition group | Count | Current disposition |
|---|---:|---|
| banked legacy/current callable behavior | 37/56 | banked at `e7e252ed`; 35 active plus two refusal-only release snapshots; all require 5.6.2C reconciliation, migration, or exact proof |
| demonstrated 5.6.2C conformance | 0/56 | no banked binding has yet been accepted under the new algebra |
| absent/non-callable owner-ready | 11 | materialize 2, result assess 1, witness admit 6, and run invoke 2 |
| shared continuation carrier gap | 2 | `run.continue#current_intent` and `run.continue#selected_action`; held pending accepted carrier |
| E33 interaction family | 5 | rejected dirty attempt excluded; implement once from the operative static kernel after exact carriers exist |
| held `release_evidence` read | 1 | owner relation exists but no accepted installed binding |

The absent/non-callable remainder is 19/56: `11 + 2 + 5 + 1 = 19`. The two release
snapshots belong to the banked 37 behavior set, not that 19, but remain contract-
final held because their current success result schemas are `v.never()`.

Construction now follows Section 5.6.2C: establish the shared three-combinator
foundation; wire `run.invoke` first and prove the twelve-key sentinel route;
close the full owner-ready group; resolve the one continuation-carrier gap;
bind the five E33 packets to one static kernel; bind `release_evidence`; then
prove 56/56 packed static loadability and complete legacy exclusion. W2-06,
W2-07, and W2-08 follow only after that mechanical W2-05 exit.

Sections 5.6.2, 5.6.2A, 5.6.2B, and 16.6 no longer authorize
`PublicExecutionCandidate`, topology arms, a generic resource/provider runtime,
or C1F/D6 stage advancement. Their classifications remain evidence. The
accepted HoG algebra, ABG event resource and expected-prefix admissions, Event
Calculus, replay, indexed owner outcomes, Effect `3.22.1` ABI, and legacy
deletion boundary remain fixed. Product and requirements do not change.

