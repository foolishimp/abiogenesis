# Trusted-host late lookup binding

This design extends the Graphify support realization under FD-005/006. The
existing native public `context.index` and `context.read` routes still require
their genuine provider preflight. A different Product can use the same lookup
checks and pager inside its trusted process without inventing such a preflight.
This is a source candidate, not a released supplement or downstream adoption.

## Binding and operation

The trusted host constructs `ac_support_core.HostLookupBinding(runtime,
selection, reacquire)`. `runtime` is a selected existing provider policy and
principal with its existing artifact and composition-history callbacks; the
constructor reloads that policy at its exact digest. `selection` is a closed
object binding owner, admission, Context, subject, basis and current epoch as
`Identity` values, plus the original nonempty `owner_coordinates` object,
principal, actor, grant, executor, the exact `context.read` operation, policy
digest and currentness-projection digest. The owner coordinates are opaque to
this provider and retained verbatim in prepared evidence; the host is
responsible for their meaning and authenticity. Treat them as potentially
sensitive host evidence.

The trusted, parameterless `reacquire` returns `HostLookupResolution(selection,
context, recheck)` from current host-owned state, or no resolution. It must
authenticate the original admission and its binding to the exact Context,
actor, grant, executor, operation, subject, basis and epoch; authenticate owner
coordinates; and establish the selected recheck from current state. It is not
an actor-callable adapter selector or a serialized `admitted` flag. An
implementation receiving requests over process boundaries must protect its
own resolver and transport; this API itself provides no operating-system
confinement or cross-language authentication.

`recheck` uses the existing `a_c.fd-support.recheck/1` object: exact policy
digest, Product definition and method-profile SourceRefs, and the `sources`,
`observations`, and `executor_dependencies` arrays. The arrays must cover the
packet and acquired Context materials, grant authority/outcome/admission and
preconditions, Product owner, selected composition and notification authority
when applicable, packet observations, and executor dependencies. Additional
entries are also checked for currentness. This is a currentness projection,
not a new admission record; it must come from the trusted host binding.

The actor-facing selection is only `binding.read(key, offset, max_bytes)`.
The provider reloads the selected policy, checks the existing operation and
composition route/history, resolves and compares the binding, validates the
Context, principal, registered grant and executor, required material coverage,
currentness, declared source and scope, then computes the same bounded page as
the native path. It reacquires the binding and checks source identity again
before returning. Unsupported or incomplete bindings and selected formal gates
without a qualified host verification mapping fail closed. The host owns any
other required admission predicates; this interface does not perform the
provider's `contract.preflight` or equate another owner's admission to it.

The result contains `value`, a prepared `acquisition` and its content reference,
and `publication: not_performed`. It does not persist, deliver, or publish an
artifact. The host must protect the actual publication boundary, re-establish
currentness and record actual delivery using its own admitted lifecycle. Two
reacquisitions do not guarantee atomicity at that later boundary. As with the
native pager, the limit is on returned bytes; entire selected content is read
and hashed, and aggregate budget or active-context fit is not established.

Existing source engines and composition authorization remain controlling.
Retained host bytes may be supplied through the existing artifact resolver, but
where composition requires a provider-form evidence artifact, arbitrary
host-owned bytes do not satisfy that requirement. A host must supply the
already-supported authenticated evidence/history representation or receive a
refusal; this seam does not manufacture it. Explicit source roles, governing
criterion enforcement, native ABG admission and any released identity remain
separate obligations.

## Presentation

`ac_context_presentation.present` accepts exact previously captured public
`context.read` response bytes and independently held wire digests. The caller
is responsible for capture authenticity. It verifies response identities,
consistent Context and SourceRef, individual page hashes and continuations,
and the full reconstructed selected-source digest. It decodes once after
complete reassembly, including UTF-8 split between pages. Refused, incomplete,
non-UTF-8 or NUL-containing inputs retain their original response objects and
identities; corrupt or inconsistent inputs refuse. This is presentation only:
it neither authenticates a producer nor grants access, admission, delivery or
semantic understanding. Its output does not itself reduce model usage unless
a host actually chooses and measures that presentation path.
