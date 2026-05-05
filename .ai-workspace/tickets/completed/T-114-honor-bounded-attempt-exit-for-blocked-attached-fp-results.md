---
id: T-114
title: Honor bounded attempt exit for blocked attached F_P results
status: completed
change_class: realization_refactor
created_at: 2026-05-05T00:00:00+10:00
updated_at: 2026-05-05T12:35:00+10:00
owning_repo: abiogenesis
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t107_traversal_modulation_unit.test.mjs
evidence_refs:
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test70.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260505T121548493Z_pid99396
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test70.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260505T123118988Z_pid15169
related_tickets:
  - odd_sdlc:T-128
---

# T-114 Honor bounded attempt exit for blocked attached F_P results

## Problem

A test70 Claude live run exited its worker after a fully observed API retry storm and wrote the process summary, worker failure postflight, and gap dossier. The parent `odd-sdlc-ts start --until converged` process did not return a public envelope.

The traversal attempt envelope for the edge carried `mustExitAfterBoundedAttempt: true`. The ABG runner honored bounded exit for no-artifact blocked dispatches, but the blocked attached-artifact path could still enter retry continuation logic instead of terminalizing the bounded attempt.

## Lawful re-entry

`realization_refactor`.

The graph semantics and traversal strategy surface remain unchanged. The runner is corrected to obey an existing traversal-attempt carrier field.

## Required behavior

- If a modulated F_P attempt has `mustExitAfterBoundedAttempt: true`, a blocked attached F_P result that would otherwise plan a retry must return a terminal `gap_stop` for the bounded attempt.
- The runner must not emit `retry_repair_planned` for that bounded attempt exit.
- The async and sync engine paths must preserve the same behavior.
- Downstream callers such as `odd_sdlc` must receive control after worker failure postflight evidence is written.

## Closure evidence

- `npm run build:semantic` passed in `build_tenants/abiogenesis/typescript`.
- `node --test test_env/tests/test_t107_traversal_modulation_unit.test.mjs` passed 16/16, including the bounded blocked attached-artifact regression.
- `data_mapper.test70.TS.cl` was reinstalled with the patched ABG tarball.
- Live Claude retry-storm run `20260505T123118988Z_pid15169` returned a public `worker_failed` envelope instead of hanging after worker postflight. The emitted runtime event list ends in `actor_invocation_closed`, `vector_evaluated`, `terminal_reached` and contains no `retry_repair_planned`.
