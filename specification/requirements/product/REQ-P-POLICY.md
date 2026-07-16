# REQ-P-POLICY — Product and Runtime Policy

**Status**: Active
**Category**: Governance
**Date**: 2026-04-19
**Derives from**: [INTENT.md](../../INTENT.md) INT-001 and INT-005,
[PRODUCT.md](../../PRODUCT.md)
**Wave**: 3; ABG 5.0 public operator contract

---

## Purpose

Product-level policy (feature closing, human proxy, merge gates, CLI behavior) lives above the GTL/ABG constitutional stack.

## Acceptance Criteria

**REQ-P-POLICY-001**: Product policy (feature closing, visibility rules, human proxy mode, CLI loop behavior) shall be expressed as product-layer requirements, not GTL language law or ABG interpreter law.

**REQ-P-POLICY-002**: Policy may consume GTL tags, evaluator results, and convergence state — but policy logic shall not be embedded in the language or interpreter kernel.

**REQ-P-POLICY-003**: CLI and control-plane summaries shall be product-layer projections over canonical ABG run truth. They shall not define independent boolean lifecycle truth that can contradict the canonical run/event model.

**REQ-P-POLICY-004**: Product-layer `start` control modes shall treat yielded ABG handoff truth as a lawful control seam. They shall not flatten yielded handoff into terminal success and shall not blindly redispatch the same constructive lane without first honoring the yielded observer or routing handoff.

**REQ-P-POLICY-005**: Repeated proof failure on one current work identity shall project to product-layer control-plane hold truth. That hold truth shall be replay-derived from canonical `proof_failed`, `proof_passed`, and scoped `reset` events rather than hidden controller memory or a rival mutable run-state store.

**REQ-P-POLICY-006**: Product-layer proof-hold behavior shall resolve through one consumed hold-policy surface. That resolved surface shall govern whether hold is enabled and the failure threshold. Any runtime specialization shall resolve into that one product-consumed policy surface rather than becoming CLI-local truth.

**REQ-P-POLICY-007**: The proof-hold identity shall be keyed by `edge`, `work_key`, `spec_hash`, and `workflow_version`. Hold projection shall survive process restart and shall clear only by lawful replay-visible causes: proof success on the same identity, identity supersession by new `spec_hash` or `workflow_version`, or an explicit scoped `reset` over the held boundary.

**REQ-P-POLICY-008**: Product-layer advancement and observation surfaces shall consume the same proof-hold projection. `start`, `gaps`, and live run status may report hold, but they shall not redefine ABG run lifecycle truth in order to do so.

**REQ-P-POLICY-009**: `start` traversal request truth shall be expressed as `scope + target + until`. Supervision, F_H proxying, and similar recovery behavior shall be modeled as orthogonal product-policy control modes outside that traversal request grammar.

**REQ-P-POLICY-010**: When product policy publishes `asset:<published_handle>` as a `start` target family, that family shall resolve only through one published operator asset registry and ownership surface. Each published asset handle shall resolve to one governing traversal boundary, and unresolved, unowned, unsupported, or ambiguously owned asset handles shall fail closed.

**REQ-P-POLICY-011**: The current public `start` control-mode families shall be:
- `fh_mode`
- `root_mode`
Those mode families are product-policy truth above the adapter. Literal flags or service parameters are bindings of those same mode families, not the source of truth for them.

**REQ-P-POLICY-012**: The current public `fh_mode` values shall be:
- `direct`
- `human-proxy`
`direct` is the default. `human-proxy` is a public operator option that may proxy F_H review under product policy. `fh_mode` shall remain outside `scope + target + until` and shall be lawful only when `until = converged`.

**REQ-P-POLICY-013**: The current public `root_mode` values shall be:
- `direct`
- `supervised`
`supervised` is the default. It is root-level convergence control around repeated `start` advancement. `direct` is the public operator option to opt out of root supervision. `root_mode` shall remain outside `scope + target + until` and shall be lawful only when `until = converged`.

**REQ-P-POLICY-014**: The primary operator workflow shall be an interactive
One Surface loop declared by an admitted GTL program and interpreted by ABG. An
operator shall be able to define or refine current assets, invoke or start
admitted work, receive one truthful stop, hold, or gap signal, remove one
ambiguity or roadblock through the interactive agentic coder surface, inspect
the current projection, and continue the same lawful workflow without
inventing a second runtime or controller model.

**REQ-P-POLICY-015**: Website, service, or installer shells may bind the
public operator contract, but they shall remain delivery bindings. The primary
flexible operator surface shall remain interactive work with an agentic coder
interface over substrate truth. Concrete transports such as `claude`, `codex`,
or `gemini` are bindings of that same product law, not rival control models.

**REQ-P-POLICY-016**: Product-layer stop, hold, and gap reporting for the
interactive operator workflow shall be explicit enough that an operator can
decide the next lawful action: continue by restarting `start`, inspect
with `gaps`, remove an ambiguity, satisfy a missing capability, or supply
human decision. Downstream wrappers shall not need to reconstruct that next
step from hidden controller-local state.

**REQ-P-POLICY-017**: Public command-line grammar shall be tenant-invariant
for supported GTL/ABG operator commands. Python, TypeScript, or any other
tenant may use different executable prefixes, installation mechanics, or
package bindings, but the command suffix after the binary shall preserve the
same subcommands, public flags, target grammar, control-mode grammar, output
contract, and stop classification. A tenant-specific binary shall bind the
shared product command grammar; it shall not define a rival operator command
language.

**REQ-P-POLICY-018**: Gap triage shall be downstream product policy expressed
through published graph-function-addressable work. ABG may expose replay-derived
gap, hold, stop, continuation, and unresolved-observation truth, but it shall
not own ticket priority, ticket closure, backlog state, or process mechanics.
When a downstream product creates or changes a ticket from gap truth, that
behavior shall be governed by the downstream product and `TICKET_METHOD.md`.

## Public Operation Contract

**REQ-P-POLICY-019**: Abiogenesis shall publish one versioned public operation
contract shared by its SDK and command-line adapter. One closed
`PublicFunctionDefinition<K>` family shall own every operation identity,
variant, request/result/refusal contract, authority and effect class,
operation-indexed workspace-binding requirement, capability ref, and adapter
coordinate. The contract shall be source-blind and shall classify every
function as public read, public runtime mutation or attestation,
install/configuration operation, release operation, or internal-only behavior.

**REQ-P-POLICY-020**: Each public operation contract row shall define its stable
operation identity, required and optional inputs, defaults, admitted value
domains, capability requirements, input and output contract identities,
successful and non-success dispositions, typed errors or refusals, exit
semantics, replay or provenance effects, whether it reads or changes truth, and
the operation-and-variant-indexed workspace-binding requirement
`forbidden | exactly_one`. No concrete variant shall carry a freely optional
binding, and no public adapter shall supply missing contract meaning from local
convention.

**REQ-P-POLICY-021**: The public operation set shall be exactly the 19
identities in `REQ-P-PUBLIC-CONTRACTS-008`. Their closed variants shall retain
all of the following product behavior:

- workspace create, open, and immutable product binding;
- product verification, resolution, installation, context bootstrap, and
  configuration materialization;
- catalog admission, narrowing view derivation, list and describe projection,
  non-callable node-type and overlay application, and GraphFunction invocation;
- start and invoke through one run-invocation function, plus replay-derived
  continuation through one run-continuation function;
- status, result, evidence, replay, gap, lawful-action, observer, and tuning
  reads through one typed projection function;
- F_H selection, approval, rejection, assessment, and escalation response;
- result assessment and witnessed-act admission;
- tuning proposal, ratification, and rejection transitions;
- GTL-program conformance evaluation; and
- qualified RC and tapped-release snapshot materialization.

Tenant or host bindings may express a variant through ergonomic subcommands or
typed SDK methods, but shall bind one of those exact identities and shall not
retain a legacy identity, compatibility facade, parallel register, default, or
fallback. This is the STDO hard break.

**REQ-P-POLICY-022**: The public SDK and CLI shall expose equivalent operation
semantics. Given the same admitted inputs and bound product identities, they
shall preserve the same operation identity, validation, defaults, disposition,
typed result or refusal, event or provenance effects, and exit classification.

## Traversal And Run Operations

**REQ-P-POLICY-023**: The `start` variant of
`abg.operation.run.invoke` shall accept one admitted traversal request with
`scope`, public `target`, and `until`, plus declared session policy and
capability inputs such as control modes and catalog view. It shall resolve only
public target identities inside one admitted GTL program and shall return a
typed run and GraphCall identity, current disposition, stop or terminal
classification, and relevant result, gap, interaction, evidence, and replay
references. Public ingress admits and transports the request; the admitted
program and ABG own One Surface ordering, selection, invocation, evaluation,
continuation, and closure.

**REQ-P-POLICY-024**: `abg.operation.run.continue` shall identify an existing
admitted run or continuation boundary, the acting operator, and any declared
continuation input. ABG shall validate substrate, admitted-program, binding, and
declaration compatibility and resolve the lawful frontier. The caller shall not
construct, select, or mutate private frame, frontier, continuation, traversal,
retry, intent, or action-selection state.

**REQ-P-POLICY-025**: Repeated use of the `start` variant over the same admitted
program, immutable workspace binding, and public target may continue the primary
operator workflow only through current replay and admitted state. It shall not
create a caller-local continuation model or silently discard prior stop, hold,
gap, F_H, result, or provenance truth.

**REQ-P-POLICY-026**: The runtime-status variant of
`abg.operation.project.read` shall be a read-only projection for an admitted run
or GraphCall identity. It shall report the canonical current disposition, stop
or terminal classification, active or pending interaction, relevant result,
gap, evidence, and replay references, and substrate identity without redefining
lifecycle truth.

**REQ-P-POLICY-027**: The result variant of
`abg.operation.project.read` shall be a read-only projection of an admitted
GraphCall or result identity. It shall preserve the declared result contract,
disposition, closure eligibility, residuals, evidence, artifact, assessment,
provenance, and replay references applicable to that result.

**REQ-P-POLICY-028**: The replay variant of
`abg.operation.project.read` shall be a read-only query over admitted event and
projection truth for a workspace, run, GraphCall, or supported subordinate
identity. Its ordering, cursor or range, event identities, source identities,
and projection basis shall be explicit. It shall not re-execute probabilistic
work or mutate runtime truth.

## Gap, Action, And Human Interaction Operations

**REQ-P-POLICY-029**: The gaps variant of
`abg.operation.project.read` shall be a read-only replay-derived projection. It
shall expose typed stop, hold, gap, missing-capability, unresolved-observation,
and pending-human-interaction truth with implicated asset, GraphFunction,
reason, evidence, and replay references sufficient for the operator to choose a
lawful next interaction. Reading gaps shall not run `evalGap` or `evaluateNext`.

**REQ-P-POLICY-030**: The lawful-actions variant of
`abg.operation.project.read` shall project the current replay-derived
`NextActionProjection` at an admitted frontier. Each row shall identify its
action kind, public target or pending-interaction identity, eligibility or
blocker, required input or capability, provenance, and replay basis. Querying
actions shall not run `evaluateNext`, select, admit, or execute one.

**REQ-P-POLICY-031**: The closed `select | approve | reject | assess |
answer_escalation` variants of `abg.operation.interaction.respond` shall support
an existing escalation or pending human interaction. Every request shall
identify the pending interaction, actor, declared decision or response contract,
supplied value or choice, evidence references, and capability provenance
required by that interaction.

**REQ-P-POLICY-032**: An F_H request that does not match one pending interaction,
declared choice or response contract, actor capability, or current basis shall
fail as a typed refusal. A human response shall be admitted as actor-attributed
truth; it shall not directly select private traversal, emit arbitrary runtime
events, or decide closure outside ABG projection law.

**REQ-P-POLICY-033**: The public interactive workflow shall be complete through
the shared contract: `run.invoke(start)` reaches one truthful stop, hold, gap,
pending F_H interaction, or terminal result; the operator inspects the applicable
`project.read` variants; the operator or agent changes an external asset,
supplies a missing capability, or submits one typed
`interaction.respond` variant; and `run.continue` or repeated
`run.invoke(start)` continues through the admitted program plus ABG-owned replay
and frontier truth.

## Retained Public Behavior Variants

**REQ-P-POLICY-034**: `abg.operation.result.assess` shall admit assessed F_P result truth only
for the expected result, assessment, actor or capability, contract, evidence,
and current basis identities. Its output shall distinguish admitted, rejected,
blocked, and retry-eligible non-close truth. Assessing prose alone shall not
become runtime or closure truth.

**REQ-P-POLICY-035**: `abg.operation.witness.admit` shall retain the public acts `reprice`,
`attest`, `hygiene-stamp`, `intake`, `run-resumed`, and `run-stopped`. A witness
request shall identify its actor, subject, typed reason or payload, evidence,
and applicable run, segment, workspace, or basis. Each accepted witness act
shall be an actor-attributed admitted event.

**REQ-P-POLICY-036**: The observer-report and observer-drafts variants of
`abg.operation.project.read` shall remain read-only replay-derived projections.
Their outputs shall identify observation basis, source events or projections,
findings or draft identities, evidence, and provenance without admitting intent
or mutating runtime truth.

**REQ-P-POLICY-037**: The tuning-report variant of
`abg.operation.project.read` shall remain a read-only projection. The
`propose | ratify | reject` variants of
`abg.operation.tuning.transition` shall identify the draft, actor or admitted
policy authority, basis, rationale, evidence, and resulting draft disposition.
Ratification shall not directly rewrite effective configuration; the ratified
draft shall re-enter through its owning admitted change boundary.

**REQ-P-POLICY-038**: The public `gtl_program` variant of
`abg.operation.conformance.evaluate` shall accept a submitted GTL program and
return a typed conformance result with program or inventory
identity, passed or failed disposition, stable diagnostics, violated law or
contract references, evidence, and admissible repair affordances. It shall not
silently repair or execute an inadmissible program.

**REQ-P-POLICY-039**: `abg.operation.product.materialize` variants,
`abg.operation.product.install`, and `abg.operation.release.snapshot` shall each
publish exact request, result, refusal, provenance, and exit contracts. Their
outputs shall identify the affected workspace, product, configuration, or
release identities and the manifests or evidence that carry the operation
result.

**REQ-P-POLICY-040**: `abg.operation.release.snapshot` shall refuse a release
subject unless its exact same-subject and same-law-basis qualification verdict
is green with an empty bypass set. A snapshot or release cut shall be output
only; it shall not qualify itself or serve as candidate-freeze input.

## Read, Mutation, And Adapter Boundaries

**REQ-P-POLICY-041**: Every catalog, runtime, evidence, replay, gap,
lawful-action, observer, and tuning-report variant of
`abg.operation.project.read` shall be a pure public read. A read shall admit no
runtime mutation event and shall not change installed, bound, catalog, run,
continuation, draft, assessment, intent, selection, or closure truth.

**REQ-P-POLICY-042**: `run.invoke`, `run.continue`,
`interaction.respond`, `result.assess`, `witness.admit`, and
`tuning.transition` shall route through one typed public-invocation admission
boundary. Every accepted variant that changes or attests runtime truth shall
produce actor-attributed admitted event truth. Admission shall not make ingress
the owner of One Surface orchestration.

**REQ-P-POLICY-043**: Install, configuration, and release operations shall
produce typed manifest or provenance truth appropriate to their product
boundary. They shall not be represented as ordinary traversal events merely to
share a transport adapter.

**REQ-P-POLICY-044**: A public CLI shall be a thin adapter over the public SDK
and operation contracts. It may parse, validate, invoke, and render those
contracts; it shall not import private runtime authority, call workers directly,
emit runtime events directly, construct continuations, retry traversal, rank
private actions, widen catalog or allowlist views, or decide closure.

**REQ-P-POLICY-045**: A Codex, Claude, service, website, manager, or other host
adapter shall delegate to the same public SDK or CLI operation contract. It
shall not copy GraphFunction logic, own a catalog or truth store, call workers
directly, select private traversal, emit ABG events, manage continuation or
retry, or become required for native ABG operation.

**REQ-P-POLICY-046**: Deterministic configuration, product binding, catalog,
allowlist, input-contract, and capability failures shall be typed preflight or
admission results and shall not consume an F_P retry budget. Malformed,
incomplete, or contradictory F_P output after successful dispatch shall remain
typed retry, rejection, or blocked non-close truth under its declared response
contract.

## Bounded 5.0 Scope

**REQ-P-POLICY-047**: Conformance to the ABG 5.0 public operation contract shall
not require a hosted registry or storefront, billing, ranking, organization
RBAC, multi-user approval administration, signing service, external scheduler,
automatic wake controller, or more than one host-adapter qualification.

**REQ-P-POLICY-048**: The public operation contract shall not imply product
update, disable, unbind, uninstall, registry retirement, revocation, or
supersession lifecycle behavior. Those capabilities require separately admitted
product requirements.

## Catalog, Invocation, And Install-Time Operations

**REQ-P-POLICY-049**: `abg.operation.product.verify` shall validate a supplied product,
descriptor, contribution manifest, resolved lock, artifact identity, and
compatibility inputs without installing, binding, admitting, or invoking them.
Its result shall identify every checked identity, the verification disposition,
typed residuals or refusals, and provenance.

**REQ-P-POLICY-050**: `abg.operation.product.resolve` shall accept declared product and
compatibility requirements and return one exact resolved-lock result or a typed
unresolved, incompatible, ambiguous, or cyclic disposition. Producing a lock
shall not install a product or alter a workspace binding.

**REQ-P-POLICY-051**: `abg.operation.workspace.bind` shall accept one admitted workspace and one
exact verified product set and resolved lock. It shall return the resulting
immutable workspace-binding identity and manifest or a typed refusal. Binding shall not
silently install missing products, admit contributions, start traversal, or
broaden the selected set. A different product set, lock, authority basis, or
declared root set shall create a separately admitted immutable binding identity;
it shall not mutate an earlier binding or a global current-binding pointer.
Every workspace- or execution-scoped invocation shall select exactly one such
binding. Introducing a different binding onto a continued execution spine shall
require the explicit new binding plus its exact covering reprice. Ordinary
observation, replay, process, file, or artifact change shall not mutate or
invalidate a binding.

**REQ-P-POLICY-051A**: `abg.operation.catalog.admit` shall accept one exact workspace binding,
its resolved lock, and the bound products' verified descriptors and
contribution manifests. It shall return one admitted catalog identity plus
typed admitted, rejected, incompatible, conflicting, unready, or unresolved
row dispositions. Admission shall not invoke a GraphFunction, widen a session,
emit traversal events, or change the workspace binding.

**REQ-P-POLICY-052**: The catalog-list and catalog-describe variants of
`abg.operation.project.read` shall operate over admitted workspace catalog
truth. They shall preserve kind, canonical
handle, owning product, readiness, eligibility, callability, compatibility,
session visibility, contract, and provenance truth as applicable to the result.

**REQ-P-POLICY-053**: `abg.operation.catalog.view` shall validate and construct one
narrowing-only session catalog view from an admitted workspace catalog and
declared allowlist. It shall return the effective view identity and typed
unknown, duplicate, ambiguous, unauthorized, inadmissible, or not-ready
residuals without widening or changing workspace catalog truth.

**REQ-P-POLICY-054**: The `invoke` variant of
`abg.operation.run.invoke` shall accept one admitted GTL program, one canonical
admitted GraphFunction handle published by that program, its declared input,
one immutable workspace binding, and declared session policy and capability
inputs. The exact function constraint narrows the program-published
`ActionCatalog`; it shall not bypass `evaluateNext` or treat the function as the
whole program. ABG shall begin one GraphCall only after One Surface admits the
selected construction intent and shall return the call, run, result or stop,
evidence, and replay references required by the GraphFunction contract. It
shall not invoke any non-GraphFunction catalog kind.

**REQ-P-POLICY-055**: The evidence variant of
`abg.operation.project.read` shall be a read-only projection for a supported
run, GraphCall, result, assessment, witness, install, or release identity. It
shall preserve evidence identity, kind, subject, content or artifact reference,
producer, basis, digest when published, provenance, and replay references
without manufacturing evidence from adapter-local observations.

**REQ-P-POLICY-056**: The `context_bootstrap` variant of
`abg.operation.product.materialize` shall accept one admitted target workspace
and exact selected product binding and shall return a typed bootstrap
manifest identifying the context surfaces created, refreshed, preserved, or
refused. It shall not replace project-owned authority or select a mutable source
project as installed product truth.

**REQ-P-POLICY-057**: `abg.operation.product.install` shall accept exact supplied artifact and product
contract identities and shall return typed verification, materialization,
installed-product, and provenance dispositions. A failed
verification shall not produce installed, bound, admitted, or callable truth.
Workspace binding and catalog admission remain the explicit
`abg.operation.workspace.bind` and `abg.operation.catalog.admit` functions.

**REQ-P-POLICY-058**: The `configuration` variant of
`abg.operation.product.materialize` shall accept one admitted configuration
contract, selected product binding, and declared inputs and shall return exact
configuration content identity, validation disposition, provenance, and typed
residuals. It shall not silently read mutable source defaults or change runtime
truth merely by producing configuration.

**REQ-P-POLICY-059**: `abg.operation.release.snapshot` shall accept one exact
qualification basis, the matching qualification-law basis, one same-basis green
non-bypassed verdict, and the requested `published_rc | tapped_release`
identity. The `published_rc` variant shall accept only a `pre_rc_candidate`
basis, require the requested identity to equal its basis-bound prospective RC
identity, and publish the exact qualified artifact bytes unchanged. The
`tapped_release` variant shall accept only a `final_tap_candidate` basis and
shall additionally require the accepted-RC lineage, exact installed-RC
qualification basis and green non-bypassed verdict, and verified final-tap
delta after every affected pre-publication gate. An `installed_rc` basis or
verdict is authorization evidence for final-basis construction only and shall
never directly materialize a cut or snapshot. The operation shall return the
immutable release-cut identity, artifact and snapshot-manifest identities,
digests, qualification disposition, residuals, and provenance, or a typed
refusal without publishing a release-grade result.

**REQ-P-POLICY-060**: Workspace `create` shall accept an admitted target
location and explicit clean/imported authority mode and shall return one typed
workspace identity and creation/bootstrap eligibility result. It shall not
install a product, bind a product set, admit a catalog, scaffold project-owned
authority by omission, or create runtime events merely by creating the
workspace boundary.

**REQ-P-POLICY-061**: Workspace `open` shall accept an existing target location,
admit its workspace identity, stable workspace-authority basis, and current
binding/configuration state, and
return typed missing, malformed, stale, incompatible, or ready dispositions.
Opening shall be a read of existing workspace/product truth and shall not
silently install, rebind, re-resolve, admit, widen, or start work.

**REQ-P-POLICY-062**: ABIogenesis shall publish one versioned host-neutral
`PublicInvocation<K>` descriptor family and one corresponding
`PublicOutcome<K>` result/refusal/non-terminal family for all 19 public
operations. The invocation shall carry at minimum its schema and public-function-definition
identity/version/digest, operation identity and variant, exact
`InvocationAuthority<K>`, and the operation-indexed required or forbidden
workspace, product-binding, dependency-lock, catalog-view, admitted-program,
GraphFunction, input-contract, payload, session-policy, capability-grant,
actor-attribution, and transport-steering truth. The `run.invoke` variants shall
add the canonical GraphFunction interface or public start target and
`scope + target + until` where applicable.

**REQ-P-POLICY-063**: A native caller, `abg.cli`, or host adapter may construct
or transport the same admitted `PublicInvocation<K>` and may transport the
corresponding `PublicOutcome<K>`. The descriptor shall not
contain a worker invocation, private frame/frontier/continuation state,
adapter-local graph logic, event payload authority, retry loop, selection,
evaluation, or closure decision. Host-specific metadata may wrap the descriptor
but shall not change its public operation meaning. The owning semantic function,
not ingress or an adapter, shall construct the outcome.

**REQ-P-POLICY-064**: Every operation in the complete public contract shall use
the exact `abg.operation.*` identity and addressable request/result/error/
invocation schemas defined by `REQ-P-PUBLIC-CONTRACTS`. The operation's
`PublicFunctionDefinition<K>` row owns its defaults, closed variants and value domains, actor and
mutation class, typed refusals, disposition, and adapter exit classification.
CLI flags, SDK overloads, and host projections bind those rows; they do not
complete or reinterpret an absent row. Legacy operation identities and a
parallel compatibility register shall fail publication and conformance.

## Public Operation Acceptance

The public operation contract is not complete until a source-blind installed
consumer can use the SDK and CLI to:

- create or open a source-blind workspace;
- resolve and verify exact supplied products, install them, bind one
  multi-product workspace, and admit its catalog without source access;
- inspect the bound catalog through `project.read` and narrow a session through
  `catalog.view`;
- apply admitted node-type or overlay declarations through `catalog.apply`
  without making them callable;
- invoke or start an admitted GTL program and program-owned GraphFunction
  through `run.invoke`, then inspect status, result, evidence, and replay through
  `project.read`;
- inspect gaps and lawful actions;
- submit an `interaction.respond` variant against a pending interaction;
- continue or restart the same lawful operator workflow to convergence;
- use result assessment, witness, observer, tuner, conformance, install,
  materialization, and release variants through their exact definitions; and
- obtain equivalent typed dispositions from the SDK and CLI without either
  adapter owning runtime truth or orchestration, and without any legacy
  operation identity or parallel contract register.
