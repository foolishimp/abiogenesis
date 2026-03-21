# GTL Bootloader

This bootloader is the concise constitutional primer for the Codex build.

## Core Types

- `Asset`: typed graph node with `id_format`, lineage, and `markov` stability conditions.
- `Context`: snapshot-bound constraint document resolved by locator and digest.
- `Edge`: typed transition between assets, with operators, rule, and standing context.
- `Evaluator`: convergence predicate on an edge.
- `Job`: executable unit of work over one edge.
- `Operator`: execution capability bound to one functor category.
- `Package`: bounded constitutional world containing assets, edges, operators, rules, contexts, overlays, and requirement keys.
- `Rule`: approval and dissent rule bound to an edge.
- `Worker`: actor defined by the jobs it can execute.
- `F_D`: deterministic evaluator/operator regime.
- `F_P`: agent evaluator/operator regime.
- `F_H`: human evaluator/operator regime.

## Execution Model

The engine traverses a typed asset graph. Each job is evaluated in the fixed escalation order:

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

Control events such as `edge_started`, `fp_dispatched`, `fh_gate_pending`, and `edge_converged` describe orchestration state but are not prime operators.
