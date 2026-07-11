# T-223 - Realize Installed Catalog, SDK, And CLI Steel Thread

- id: T-223
- title: Realize installed catalog, SDK, and CLI steel thread
- type: feature
- ticket_category: ordinary
- status: active
- activated_at: 2026-07-11
- goal: abg-5-0-full-product-delivery
- phase: DS-1
- priority: high
- change_intent: >-
    Implement the approved DS-1 design as one packed-product Hello World path
    over the existing ABG runtime, then prove its bounded likely failures.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-222
- build_tenant: typescript
- admission_condition: T-222 is completed and its design is current
- affected_boundary: M02 publication and M04 install/public SDK/CLI over reused M03 catalog and runtime authority
- dependencies:
  - T-222
- authority_refs:
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_IACS.md
  - build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md
  - build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_STRUCTURAL_CARRIER_DIAGRAM.md
  - .ai-workspace/tickets/completed/T-222-design-installed-catalog-sdk-cli-steel-thread.md

## Target Truth

From a clean workspace created or opened through the public contract, an exact
candidate tarball and one minimal catalog fixture install, bind, and admit
without source imports. The public SDK and `abg.cli`
list and describe the generic metadata of retained catalog rows, narrow an
allowlist, invoke Hello World by canonical GraphFunction handle, and read typed
result and replay truth. Kind-specific node/overlay semantics remain T-179/T-228 work.

## Required Work

1. Implement the approved descriptor, contribution, resolved-lock, install,
   binding, explicit catalog-admission, catalog-state, SDK, and CLI carriers
   through the designated modules.
2. Extend `product-toolchain-manifest.json` with the admitted public contract
   catalog, static schema assets, baseline contract-group rows, exact locators,
   canonical non-circular digest verification, mandatory GTL/install schema
   rows, and product-root-relative path admission; publish DS-1 operation rows
   without claiming later rows.
3. Implement distinct source-blind workspace create/open operations and the
   versioned host-neutral invocation descriptor.
4. Package a source-blind publisher-authored Hello World fixture containing
   declarations and permitted assets only.
5. Preserve M03 as the only runtime-selection and execution authority.
6. Prove the sunny-day installed SDK and CLI paths first.
7. After deterministic installed proof and one typed transport/capability
   preflight, run one packed-and-installed live Hello World sandbox through the
   same public path and preserve its response, result, event, and replay evidence.
8. Add focused negatives for incompatible identity/range/digest/interface,
   unresolved dependency or handle, duplicate identity/shadow, allowlist
   widening, malformed input, missing capability preflight, and source/private import.
9. Re-run existing semantic, install, registry, start, result, and replay suites.

## Closure Law

Close only when the DS-1 installed vertical proof passes from packed artifacts,
all seven bounded negative families return typed failures at their owning
boundary, existing gates remain green, and the implementation matches the
approved design without private imports or a second controller.

## Non-Closure Conditions

- The proof runs from the source tree or a test-only runtime shim.
- The fixture is treated as a separately supported release product.
- CLI and SDK paths differ in runtime meaning.
- Any worker, event, continuation, traversal, or closure authority is duplicated.
- Broad hostile-local hardening displaces the constructive path.

## Proof Surface

- deterministic TypeScript suite and semantic lint
- package dry-run and closed file census
- fresh installed Hello World through public SDK
- fresh installed Hello World through `abg.cli`
- one preflighted packed-product live Hello World sandbox
- typed result and replay assertions
- seven bounded negative differentials
- phase-end code review against T-222, T-218, and PRODUCT

## Execution Record

### Foundation checkpoint - 2026-07-11

Implemented and reviewed the DS-1 lower boundary before publication and adapter
work:

- strict I-JSON/JCS identity and closed public carrier admission;
- exact product resolution, verification, installation, workspace create/open,
  multi-product binding, and durable verification records;
- M03-owned catalog admission, replay projection, session narrowing, and exact
  GraphFunction execution binding;
- complete DS-1 operation metadata and lookup-bound resolved operation
  contracts; and
- typed refusal paths for malformed serialized assets, stale or incompatible
  identities, unresolved declarations, duplicate/shadow conflicts, and
  allowlist widening.

Self-review against T-222, T-218, and `PRODUCT.md` found no duplicated worker,
event, continuation, traversal, or closure authority and no hostile-local
hardening. Review findings repaired before checkpoint: whole-log ordinal
admission, Module lookup authority, exact catalog execution basis, product-root
layout, complete installed inventory verification, profile sovereignty,
operation-contract parent binding, lookup-only resolved-contract construction,
native declaration-inventory verification, catalog-schema JSON admission, and
typed workspace read failures.

Verification at this checkpoint:

- host build: pass;
- semantic build and GTL guard: pass;
- focused T-223 suite: 25/25 pass;
- semantic lint and diff check: pass;
- all 1,456 semantic behavior tests pass; four pack/install tests that collided
  under parallel build-output mutation were rerun serially and passed.

The ticket remains active. Static contract publication, generated schemas,
publisher-authored Hello World, public SDK implementation, `abg.cli`, packed
consumer proofs, and the one preflighted live sandbox remain required.

### Public SDK and CLI checkpoint - 2026-07-11

Implemented and reviewed the DS-1 upper public surface over the installed
catalog foundation:

- 63 strict generated JSON schemas and one 54-row DS-1 public contract catalog,
  with checked-in publication parity and package-export locator verification;
- the host-neutral public SDK for all 13 DS-1 operations, including generic
  invocation admission and SDK-owned derivation of the runtime host descriptor;
- one M03-owned catalog invocation path with exact catalog-basis execution,
  input admission, instruction startup, operation attribution, typed result,
  and bounded replay projection;
- a thin `abg.cli` with the exact DS-1 grammar, explicit workspace and request
  inputs, SDK-equivalent result rendering, and contract exit codes;
- a deterministic declarations-only Hello World fixture with detached product
  descriptor and contribution sidecars, one callable GraphFunction, and
  non-callable node and overlay catalog rows; and
- the standard live F_P dispatch and evaluator profile, selected by governed
  GraphFunction declarations and constructed only by the bound Node context.

Self-review repaired the following drift before checkpoint: CLI ownership of
live capability construction, missing fixture plugin declarations, a
catalog-specific request carrier exposed as the generic public operation
contract, actor attribution outside durable event truth, opaque-overlay
causation loss, a second execution-basis admission, and instruction startup
that did not preserve the exact catalog binding. The fake transport
differential now reaches both standard F_P seams, emits both prompt manifests,
and performs no registry re-admission.

The deterministic fake invocation truthfully returns the existing typed
non-terminal `assurance_block` after both F_P effects. DS-1 does not invent an
assurance provider to turn that into convergence: T-218 assigns the complete
runtime and current hook scopes, as well as the distinct A5-SP3 conformance
gate, to DS-2. The packed live proof must still show the worker response and
runtime evidence before accepting that typed stop.

Verification at this checkpoint:

- focused T-223 suite: 58/58 pass;
- T-220 algebra, compiler, execution-basis, and malformed-F_P gate: 35/35 pass;
- semantic lint, schema parity (63/63), publication parity, and diff check:
  pass;
- package dry-run: `5.0.0-dev.0`, 1,002 files, closed published contract
  assets present; and
- production dependency audit: zero known advisories.

The ticket remains active. The exact ABG candidate tarball and detached
sidecars, the design-mandated Module-backed SYSTEM GraphFunction contribution,
fresh packed SDK/CLI equivalence, all seven bounded negative families, and the
preflighted packed-product live Hello World sandbox remain required.
