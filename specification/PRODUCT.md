# Abiogenesis — Product

**Product ID**: PROD-001
**Date**: 2026-04-03
**Status**: Draft
**Derives from**: INT-001, INT-005, INT-006, INT-007

---

## Purpose

This document defines the current product shape of abiogenesis as the GTL + ABG
product line.

It is a product-definition bridge surface. It exists to make the following
things explicit:

- what abiogenesis is releasing
- what GTL owns
- what ABG owns
- what belongs in mapping and product policy above them
- what a release is actually claiming
- where active product goals should live

It does not replace the live requirement surface. Requirements remain the
detailed constitutional law. This document stabilizes product identity, release
framing, and goal-setting above that requirement split.

---

## Product Statement

Abiogenesis is the reference product that ships:

- `GTL 3` as the declaration language for graph-native workflows
- `ABG 3` as the canonical interpreter, binding, execution, and runtime-truth
  substrate for GTL
- mapping and provenance law that preserves the GTL to runtime boundary
- product-layer policy, qualification, and scenario surfaces that make the
  system operationally provable

The product is not a downstream domain workflow such as `genesis_sdlc`.
Downstream products are consumers and proving domains for GTL + ABG. They are
not the GTL + ABG product itself.

---

## Product Layers

### 1. GTL

`GTL` is the language layer.

It owns the declaration-side truth for:

- graph structure and typed nodes
- vectors and outer contract boundaries
- operators, evaluators, and rules
- jobs and roles as semantic work declarations
- `GraphFunction` as the primary reusable workflow program
- lawful composition, substitution, recursion, and higher-order graph operators
- module publication and engine-independence boundaries

GTL does not own runtime binding, transport policy, business-choice logic, or
product-layer release governance.

### 2. ABG

`ABG` is the canonical runtime layer.

It owns the runtime truth for:

- lawful interpretation of GTL declarations
- graph-function materialization and selection application
- worker, binding, run, and lineage semantics
- event emission, projection, correction, and convergence
- replayable provenance over execution and runtime identity
- transport and self-hosting execution behavior

Runtime identity in ABG remains structured. Reporting projections such as
`build` must not overwrite canonical worker/backend/authority truth.

ABG does not own business policy, hidden domain logic, or the semantic
definition of GTL itself.

### 3. Mapping

The mapping layer is the bridge between GTL constitutional truth and engine
realization.

It owns:

- preservation of GTL meaning into executable runtime surfaces
- capability-visible mapping boundaries
- graph-function and materialization provenance
- graph-derived bundle provenance where runtime execution depends on derived
  structural surfaces

Mapping does not redefine GTL semantics and does not excuse ABG from lawful
runtime behavior.

### 4. Product Layer

The product layer sits above GTL, ABG, and mapping.

It owns:

- product policy
- qualification infrastructure
- scenario and proving surfaces
- release claims
- operator-facing product behavior above pure language/runtime law

This layer may consume GTL declarations and ABG runtime truth, but it must not
smuggle product policy down into the language or interpreter kernel.

---

## Product Boundary

Abiogenesis should be understood as a product with a clean boundary between its
constituent layers:

| Surface | Owns | Does not own |
| --- | --- | --- |
| `GTL` | language, graph law, reusable workflow structure, outer contracts | runtime binding, transport, product policy |
| `ABG` | execution, binding, runs, lineage, correction, provenance | business-choice logic, product policy, language semantics |
| `Mapping` | faithful bridge from GTL to runtime realization | ad hoc semantic rewrite |
| `Product` | policy, qualification, scenarios, release shape, goals | hidden kernel semantics |

Within that boundary, ABG owns canonical run algebra, failure classification,
and event-emission law. Product policy, including CLI auto-loop behavior and
operator-facing summaries, must be projections over ABG truth rather than a
second semantic center.

The product boundary also separates abiogenesis from its downstream consumers:

- abiogenesis owns the GTL + ABG product
- downstream products own their domain truth and use abiogenesis as the
  language/runtime platform

---

## Current Product Shape

The current product should be read as:

- a graph-native workflow language, not a private configuration dialect
- a canonical interpreter/runtime, not a domain-specific planner
- a reference implementation and proving surface for graph-native product
  systems
- a platform that should support downstream products without leaking one
  downstream domain into the GTL or ABG core

Today that means:

- the canonical released realization is `build_tenants/abiogenesis/python/`
- `build_tenants/abiogenesis/codex/` remains a paused alternate realization
- downstream proving domains such as `genesis_sdlc` are important evidence
  surfaces, but they are not the GTL + ABG product definition

---

## Release Framing

A release of abiogenesis is not only a code cut.

A release claim should answer, at minimum:

1. What GTL language surface is current?
2. What ABG runtime surface is current?
3. What mapping/provenance surface preserves the GTL to runtime boundary?
4. Which realization is the released carrier?
5. What qualification and scenario evidence proves the claim?
6. Which downstream proving domains were in scope for the cut?

The purpose of this document in the release process is to define what the
release is releasing.

Release metadata, taps, and version identifiers remain separate release-process
surfaces. This document describes present product truth rather than release-line
history.

---

## Product Goals

Goals belong here because they are product-direction and release-focus
statements, not detailed requirement families.

Once a goal hardens into constitutional obligation, it should flow down into the
intent, requirement, design, code, and evidence surfaces.

### Active Goals

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status |
| --- | --- | --- | --- | --- | --- |
| `GOAL-001` | `GTL` + `ABG` + `Mapping` | Make cumulative environment an executable runtime law over real composed and recursive carriers, not only a static GTL contract. | ABG resolves per-boundary environment truth, late steps can read carried bindings from earlier steps, and missing internally produced bindings block dispatch rather than converging or silently running. | `test_m03_engine_kernel_integration.py`, `test_sandbox_usecases_fake.py`, `test_sandbox_usecases_live.py`, downstream `gsdlc_lite` proving routes | Active |

### Goal Template

Use the following shape for new goals:

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status |
| --- | --- | --- | --- | --- | --- |
| `GOAL-001` | `GTL` / `ABG` / `Mapping` / `Product` / mixed | Short statement of the product move | What would make it clearly true | Scenario, qualification lane, or downstream product that proves it | Proposed / Active / Closed |

### Goal Writing Rule

A product goal should say:

- which layer or layers it is trying to move
- why that move matters to the product as a whole
- what success looks like in observable terms
- what proving surface will show the goal is real

Goals should not be written as pseudo-requirements. They are directional product
statements that focus the next wave of requirement, design, implementation, and
qualification work.

---

## Product Consequence

With this definition in place, abiogenesis can be discussed more cleanly in
product terms:

- `INTENT.md` states why the product exists and what directional gaps matter
- `PRODUCT.md` states what the product currently is and what a release is
  claiming
- `requirements/` decomposes that product into constitutional obligations
- realization and qualification prove the product operationally

That is the intended role of this document.
