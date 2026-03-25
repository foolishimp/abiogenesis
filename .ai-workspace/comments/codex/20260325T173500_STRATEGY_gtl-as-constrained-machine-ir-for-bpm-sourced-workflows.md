# STRATEGY: GTL as Constrained Machine IR for BPM-Sourced Workflows

**Author**: codex
**Date**: 2026-03-25T17:35:00+11:00
**Addresses**: GTL positioning, ABG runtime scope, BPM-sourced regulatory workflow fulfillment, enterprise workflow modernization
**For**: all

## Summary
GTL fits the role of a constrained semantic intermediate representation. Source inputs are business-facing artifacts such as natural language, business requirements documents, policy text, SOPs, and BPM/BPMN models. ABG executes the resulting graph with lineage, convergence, correction, replay, and provenance.

This position supports a product built from existing regulatory BPM workflows. The product compiles those workflows into GTL, hydrates ABG into the target environment, and fulfills the workflow with durable execution truth.

## GTL Position
GTL is not a human-facing workflow notation.

GTL is the machine-constrained graph that sits between enterprise source artifacts and execution.

Its job is:

- normalize heterogeneous source artifacts into one typed workflow surface
- constrain LLM generation and materialization against explicit graph structure
- expose lawful contracts for operators, evaluators, rules, graph functions, composition, and substitution
- preserve replayable traceability from source artifact to executed workflow

This gives GTL a different role from BPMN.

- BPMN is a business-facing process description
- GTL is the semantic execution IR derived from that description

## Source-to-GTL Compilation
The authoring inputs are:

- natural language intent
- business requirements documents
- policy and procedure text
- BPM/BPMN workflow models
- data contracts and interface definitions

The compilation layer extracts:

- typed artifacts and states
- transition contracts
- deterministic checks
- probabilistic disambiguation points
- human review gates
- reusable subflows
- policy and materialization parameters

That output becomes GTL.

The important rule is explicit traceability. Each GTL node, vector, graph function, and policy-bearing decision should be attributable to source clauses, BPM elements, or requirement sections.

## ABG Position
ABG remains the runtime owner.

ABG owns:

- run identity
- lineage
- convergence truth
- correction and supersession
- provenance and replay
- lawful application of graph-function selection

This keeps GTL portable.

The system can compile the same source workflow into GTL and hydrate ABG into different environments without rewriting the semantic model.

## Product Implication
This supports a product for regulatory workflow fulfillment where the customer already has BPM representations of the workflow.

The product value is not workflow drawing.

The product value is:

- compiling documented workflows into an executable semantic graph
- binding that graph to real enterprise services and calculation engines
- executing with durable provenance
- supporting correction, amendment, replay, and audit

Representative workflow family:

- policy -> interpretation -> data acquisition -> reconciliation -> calculation -> review -> filing

Representative environment bindings:

- AWS Bedrock for model transport
- AWS Step Functions for orchestration
- deterministic calculation engines for tax or liquidity logic
- enterprise stores, queues, approval systems, and reporting targets

## Why This Matters
Many regulatory organizations already have process documentation. They often lack a rigorous execution model.

The gap usually appears in:

- inconsistent interpretation of BPM models
- undocumented environment-specific glue
- weak replay of filings and approvals
- poor traceability from policy text to executed result
- fragile handling of amendments, exceptions, and late-arriving data

GTL plus ABG addresses that gap if GTL is treated as the constrained IR rather than the human authoring surface.

## Architectural Rule
The source artifacts remain business-facing.

The execution truth remains machine-facing.

That yields a stable stack:

- source layer: natural language, BRDs, BPM/BPMN, policy text
- semantic layer: GTL
- runtime layer: ABG
- environment layer: hydration and capability bindings

This avoids pushing business users into a new formal language while still giving the system a rigorous execution contract.

## Recommended Action
1. Treat BPM/BPMN, business requirements, and policy documents as first-class source inputs to GTL compilation.
2. Keep GTL positioned as semantic IR and constraint surface, not analyst-facing notation.
3. Add source-to-GTL traceability as a formal requirement family.
4. Define a regulatory workflow scenario family that starts from BPM-sourced workflows and executes through GTL + ABG + hydration.
5. Use this framing in product design for regulatory reporting, tax, liquidity, and other governed enterprise workflows.
