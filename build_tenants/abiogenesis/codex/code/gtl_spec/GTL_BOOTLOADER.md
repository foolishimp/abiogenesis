# GTL Bootloader

This bootloader is the concise constitutional primer for the Codex build.

## Core Types

- `Asset`: typed graph node with `id_format`, lineage, and `markov` stability conditions.
- `Context`: snapshot-bound constraint document resolved by locator and digest.
- `ContractRef`: semantic reference from a GTL job to an executable contract target.
- `Edge`: typed transition between assets, with operators, rule, and standing context.
- `Evaluator`: convergence predicate on an edge.
- `Job`: durable semantic work contract.
- `Operator`: execution capability bound to one functor category.
- `Package`: bounded constitutional world containing assets, edges, operators, rules, contexts, overlays, and requirement keys.
- `Role`: semantic capability class required to realize work.
- `Rule`: approval and dissent rule bound to an edge.
- `ExecutableJob`: runtime realization of one semantic job against one edge.
- `Worker`: runtime actor identity with executable capability and role bindings.
- `WorkSurface`: immutable execution dossier carrying evidence, consumed context, emitted context, and artifacts.
- `F_D`: deterministic evaluator/operator regime.
- `F_P`: agent evaluator/operator regime.
- `F_H`: human evaluator/operator regime.

## Execution Model

The engine traverses a typed asset graph. GTL declares semantic jobs and roles; runtime workers realize executable jobs against edges.

Each executable job is evaluated in the fixed escalation order:

1. `F_D` deterministic checks
2. `F_P` agent work if deterministic checks pass
3. `F_H` human gate if deterministic checks and agent checks pass

`iterate()` never skips this ordering. Agent work is dispatched only against a clean deterministic surface.

## Events

Prime operators:

- `found`
- `approved`
- `assessed`
- `revoked`
- `intent_raised`

Control events such as `vector_started`, `fp_dispatched`, `fh_gate_pending`, and `edge_converged` describe orchestration state but are not prime operators.
