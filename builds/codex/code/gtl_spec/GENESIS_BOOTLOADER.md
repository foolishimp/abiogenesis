# Genesis Bootloader

This is the Codex build operating model for abiogenesis.

## Commands

- `genesis gaps`: derive convergence state for the scoped jobs.
- `genesis iterate`: run one bind-and-iterate pass on the first unconverged job.
- `genesis start --auto`: loop until convergence or a blocking condition.
- `genesis emit-event`: append a governed prime operator event.
- `genesis check-*`: deterministic diagnostics allowed inside `F_D` evaluators.

`F_D` evaluators are leaf predicates. They must not invoke orchestration subcommands such as `start`, `iterate`, `gaps`, or `emit-event`.

## Convergence

- `F_D` re-runs live every iteration.
- `F_P` convergence is satisfied by `assessed{kind: fp, result: pass}` bound to the current `spec_hash`.
- `F_H` convergence is satisfied by operative approval events and reopened by revocation.

The control layer owns orchestration. Evaluators observe. The event stream records.

## Build Surface

The Codex build lives under `builds/codex/`:

- `code/genesis/`: runtime engine
- `code/gtl/`: vendored GTL type system
- `code/gtl_spec/`: Codex build package surfaces and bootloaders
- `tests/`: Codex build validation
- `design/adrs/`: build-specific design notes
