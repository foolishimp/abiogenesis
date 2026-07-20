# ABIogenesis - Intent

**Intent ID**: INT-001
**Date**: 2026-03-15
**Updated**: 2026-07-20
**Status**: Active - accepted by T-283 F_H closure
**Change authority**: T-283 `intent_reprice`
**Acceptance receipt**:
`.ai-workspace/comments/codex/20260720T021524Z_DECISION_fh_accept_t283_and_authorize_m2.md`

---

## The Problem

Probabilistic software construction needs more than an agent, a prompt, or an
imperative workflow. It needs a program form that preserves declared structure,
typed boundaries, authority, evidence, continuation, and closure while
probabilistic work is occurring.

Conventional orchestration hides meaning in controllers, service methods,
prompt loops, and adapter state. That makes a plausible execution difficult to
distinguish from the declared program, and it makes replay, correction, and
assurance depend on remembered implementation behavior.

ABIogenesis exists to make the complete program inspectable before execution
and the complete runtime episode replayable after execution.

## Governing Intent

ABIogenesis is the reference implementation and released product for an
LLM-first graph programming model. It shall:

1. provide `GTL.TypeScript` as one typed, graph-first program language for
   deterministic, probabilistic, and human work;
2. represent programs as admitted GTL graph compositions whose topology,
   starts, callable membership, interfaces, policies, effects, results, and
   proof obligations are explicit;
3. publish `GraphFunction` as the sole named callable work contract, with a
   replayable GTL template that materializes graph structure for traversal;
4. validate authored and serialized GTL through TypeScript and one
   non-lowering GTL validator that reports typed validity, invalidity, or
   unresolved semantics before prohibited effects;
5. execute the original admitted GTL value directly through HoG rather than
   compiling it into a second executable program language or runtime plan;
6. surround HoG traversal with one ABG runtime-truth substrate that owns
   admission, events, replay, lineage, evidence, correction, continuation, and
   closure;
7. preserve `F_D`, `F_P`, and `F_H` as distinct compute and authority
   regimes inside one traversal model;
8. publish one admitted module and catalog boundary for programs,
   GraphFunctions, contracts, types, and compatible implementation bindings;
9. expose one source-independent SDK and thin `abg.cli` shell for inspection,
   validation, program start, GraphFunction invocation, runtime reads, human
   response, and continuation without creating another controller;
10. preserve the practical ABIogenesis 4.6 behavior and repairs through an
    explicit semantic conservation ledger rather than through names, source
    ancestry, or accidental implementation retention;
11. apply its own conformance, proof, qualification, and release law to the
    exact product candidate without self-minted assurance or product
    exemption; and
12. release one immutable source-independent ABIogenesis 5.0 product before
    recursive dogfooding or downstream GLC maturation becomes a release
    concern.

## Program And Runtime Boundary

### GTL owns program meaning

GTL declares:

- graphs, nodes, vectors, contexts, interfaces, and attributes;
- programs, GraphFunctions, modules, jobs, roles, operators, evaluators, and
  rules;
- composition, substitution, recursion, fan-out, fan-in, gates, promotion, and
  identity;
- `C` composition and selected `F_D`, `F_P`, and `F_H` regimes;
- starts, callable membership, policies, effects, result contracts, and proof
  obligations; and
- publication, compatibility, refinement, and termination boundaries.

An LLM may construct a lawful GTL value under specification authority. It may
not replace missing structure with hidden control logic.

### The GTL validator owns non-runtime judgment

TypeScript owns locally decidable authoring constraints. Raw admission applies
the same law to serialized input. The GTL validator owns closed
cross-reference, membership, interface, completeness, cardinality, and
whole-program semantic judgments.

The validator may produce canonical serialization, diagnostics, indexes, and
other subordinate read models. It does not lower GTL into an executable
intermediate representation, select runtime work, emit runtime truth, or become
a second program authority.

Facts that depend on the operating environment or probabilistic output remain
runtime-admission concerns. An unresolved semantic relation remains typed
pressure; it is not converted into a fabricated pass.

### HoG owns direct traversal

HoG is the executor framework that traverses the original admitted GTL program
and its materialized GraphFunction graphs. It follows declared topology and
compute composition.

HoG may derive invocation-local frames, cursors, queues, resolved bindings, and
caches. Those values are subordinate to one admitted program and invocation.
They cannot be published, resumed, or selected as a rival executable program.

### ABG owns admitted runtime truth

ABG owns:

- product, workspace, catalog, program, invocation, graph-call, frame, attempt,
  and continuation admission;
- worker and capability binding at declared seams;
- event and payload admission;
- replay-derived state and projection;
- result, evidence, consequence, and judgment truth;
- retry, repair, re-entry, human hold, continuation, block, non-admission, and
  closure; and
- provenance, lineage, correction, qualification, and assurance evidence.

HoG advances the admitted traversal. ABG records and admits what occurred and
derives the lawful runtime state from the declared program plus admitted facts.
There is one causal episode, not separate HoG and ABG execution paths.

### Compute regimes remain distinct

`F_D` owns total mechanical functions over declared closed inputs. `F_P`
owns bounded semantic construction or evaluation whose output remains
candidate material until admitted. `F_H` owns attributed human-authority
decisions and responses, exercised directly or through a lawfully admitted
proxy.

One regime may consume another regime's admitted evidence. It may not silently
impersonate the other regime or inherit its authority.

## Product Direction

ABIogenesis 5.0 is the feature-complete, source-independent successor to the
practical ABIogenesis 4.6 product.

The immutable 4.6 RC5 release is the semantic origin baseline. Git ancestry,
source-file similarity, and retained class names do not prove successor
conservation. Every baseline behavior and repair receives an explicit
disposition and behavioral witness.

The 4.6 semantic compiler historically validated admitted declarations and
lowered them into a normalized executable handoff. ABIogenesis 5.0 retains its
typing, normalization, diagnostics, repair relations, pre-effect refusal, and
complete-handoff obligations while superseding the lowered executable plan with
direct HoG traversal of admitted GTL.

Stable 5.0 is released before self-use. Installed 5.0 may then become the
development product for 5.0.1. odd_glc remains a separately released downstream
catalog product and is not a 5.0 build, qualification, or release dependency.

## Established Directional Constraints

### INT-002 - Bootloader Documents As Governed Projections

Cold-agent bootloaders and context documents are derived read models. Their
claims must remain consistent with active GTL, HoG, and ABG authority and must
carry enough identity to detect staleness. They never become a second
constitutional or executable program surface.

### INT-003 - Tenant-Neutral Constitutional Boundary

Specification states tenant-neutral product meaning. Build tenants may choose
host-language types, package layouts, transports, and command spellings, but
those choices do not create tenant-specific language or operator semantics.

### INT-004 - Recursive Work Identity And Compositional Graphs

Work identity, attempt identity, recursive refinement, composition, and
foldback are first-class law. Refinement may add internal graph structure while
preserving the caller's outer contract. Child completion rejoins its parent
only through admitted result and evidence.

### INT-005 - Event-Sourced Run Governance

Run state, failure classification, retry, correction, bounded subwork,
continuation, and closure derive from one admitted event history. Operator,
worker, SDK, and CLI summaries project that truth; they do not create a rival
lifecycle. Correction preserves history.

### INT-006 - Programs And Callable GraphFunctions

An admitted GTL graph composition is the program. It owns topology, starts,
callable membership, policy, effects, results, and proof obligations.

`GraphFunction` is the sole named callable library function and work contract
inside that program. Every GraphFunction supplies a GTL template that
materializes a graph. An implementation binding may realize a declared leaf
seam, but it cannot replace the GraphFunction body or graph with an
implementation-only callable.

### INT-007 - Job, Role, Worker, Run, And Implementation Separation

`Job` is a durable semantic work contract. `Role` is a semantic capability
class. `Worker` is a concrete actor identity. `Run` is one execution
instance. An implementation, plugin, or tool realizes a declared seam.

None of these identities owns program topology, traversal, event truth,
continuation, or closure merely because it performs work.

## Product Use Context

The supported 5.0 environment is one trusted developer desktop. Native
in-process code, the local filesystem, and repository or Git transport are
trusted within this boundary.

The product defends likely malformed boundaries:

- authored and serialized GTL;
- probabilistic response and artifact output;
- product, dependency, workspace, catalog, program, contract, allowlist, and
  capability identity;
- runtime event, replay, continuation, and closure truth; and
- candidate, qualification-law, RC, final-delta, and release coherence.

Probability orders proportionate proof within that declared boundary. It does
not waive constitutional hard stops, retained release claims, data integrity,
or authority conservation.

## Explicit Exclusions

ABIogenesis 5.0 does not include:

- a second GTL source language, executable IR, bytecode, generated HoG program,
  or runtime-program registry;
- controller authority in an SDK, CLI, installer, fixture, worker, plugin,
  Consensus surface, or One Surface projection;
- a second event stream, retry loop, continuation model, result ledger, or
  closure authority;
- an RLM-specific, Consensus-specific, or recursive-agent-specific runtime;
- automatic ticket mutation, automatic wake, or ABG-owned scheduling;
- hosted marketplace, billing, IAM, RBAC, multi-user, or distributed service
  functionality;
- hostile-workstation resistance, remote attestation, signing, or malicious
  publisher defense;
- self-hosting or ABIogenesis-builds-ABIogenesis as a 5.0 release gate; or
- odd_glc or another GLC product as a 5.0 release dependency.

These are separate future product decisions. They cannot enter 5.0 through an
adapter, fixture, design convenience, or implementation precedent.

## Directional Success

The intent is satisfied when the released product:

1. installs and runs from exact immutable artifacts without mutable source;
2. validates and executes admitted GTL through the declared
   GTL-validator-HoG-ABG path;
3. preserves the complete retained 4.6 traversal behavior with no silent loss;
4. exposes one usable catalog, SDK, CLI, event, replay, continuation, and
   projection surface;
5. proves deterministic, probabilistic, human, recursive, Consensus,
   self-conformance, and downstream portability behavior through the Product's
   cumulative scenarios; and
6. qualifies and publishes one exact stable 5.0 cut under one complete tapped
   STDO basis.

The complete feature, scenario, root-outcome, exclusion, and release definition
belongs to `PRODUCT.md`. Requirements and scenarios provide traceable
decomposition and executable acceptance without becoming another Product
definition.
