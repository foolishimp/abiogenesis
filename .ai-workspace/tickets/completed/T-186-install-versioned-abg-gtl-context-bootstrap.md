---
id: T-186
title: Install versioned ABG/GTL context bootstrap without target-local product payloads
type: requirement_realization
ticket_category: install_context_bootstrap
status: completed
goal: >-
  Make the ABG installer own versioned GTL/ABG context compression and target
  workspace bootstrap, so downstream projects can refresh current context and
  local binding truth without hand-editing AGENTS/CLAUDE or installing the
  GTL/ABG product payload inside each project.
change_intent: >-
  T-185 corrected the program/traversal abstraction, but stale bootloader text
  and downstream manual edits can re-seed the old abstraction. The installer
  shall carry the selected ABG/GTL version's context compression and idempotently
  refresh target cold-agent surfaces while binding the workspace to an already
  installed shared product version.
change_class: requirement_reprice
re_entry_point: install_context_bootstrap
owner: abiogenesis
priority: high
triaged_at: 2026-07-03
created_at: 2026-07-03
updated_at: 2026-07-03
governance_scope: STDO Method, SPEC_METHOD, RELEASE_METHOD, REQ-P-INSTALL, TypeScript Installer
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-185-ratify-gtl-program-overlay-and-abg-traversal-monad.md
source_documents:
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
review_status: self_reviewed
proof_status: passed
target_truth: >-
  Product payload materialization and target workspace bootstrap are distinct.
  The full installer materializes immutable ABG/GTL product payloads under the
  shared toolchain root. The `abg.install` command bootstraps a target workspace
  by writing `.abiogenesis/toolchain-binding.json`, refreshing version-owned
  ABG/GTL context in `.abiogenesis/context/ABG_GTL_CONTEXT.md`, `AGENTS.md`,
  and `CLAUDE.md`, and initializing `.ai-workspace` mutable state directories.
superseded_truth: >-
  Each downstream project installs or hand-maintains its own GTL/ABG context
  and can drift from the selected ABG/GTL product version.
closure_law: >-
  Close only when installer law names version-owned context bootstrap and the
  TypeScript installer proves both paths: full product install records the
  context, and `abg.install` bootstraps a target by binding to an already
  installed shared product version without target-local product payloads.
non_closure_conditions:
  - `abg.install` installs the GTL/ABG product payload into the downstream
    target instead of writing local binding/context truth.
  - Target context compression is hand-authored downstream instead of owned by
    the selected ABG/GTL product version.
  - Refresh duplicates or deletes unrelated `AGENTS.md` / `CLAUDE.md` guidance.
  - `.ai-workspace` mutable roots remain absent after target bootstrap.
  - A malformed marker pair is silently ignored.
required_work:
  - Add install requirement law for versioned context compression and
    target-workspace bootstrap.
  - Make the TypeScript installer write `.abiogenesis/context/ABG_GTL_CONTEXT.md`
    and marker-refresh `AGENTS.md` / `CLAUDE.md`.
  - Add an `abg.install` command that runs target context bootstrap rather than
    the full product installer.
  - Record context evidence in installer manifest/topology.
  - Prove idempotent refresh and absence of target-local product payload.
acceptance_criteria:
  - `REQ-P-INSTALL` distinguishes shared product payload materialization from
    target workspace bootstrap.
  - Full install records installed context and instruction-file evidence.
  - `abg.install` writes `.abiogenesis/toolchain-binding.json` for the selected
    shared product version.
  - `abg.install` refreshes stale context markers and preserves unrelated
    project guidance.
  - `abg.install` initializes `.ai-workspace` mutable roots and does not create
    a target-local `node_modules/@abiogenesis/typescript-tenant` payload.
proof_commands:
  - git diff --check
  - cd build_tenants/abiogenesis/typescript && npm run test:t076
  - rg -n "REQ-P-INSTALL-033|REQ-P-INSTALL-034|REQ-P-INSTALL-035|REQ-P-INSTALL-036" specification/requirements/product/REQ-P-INSTALL.md
notes:
  - The existing `abiogenesis-ts install` command remains the full product
    installer/materializer. `abg.install` is the downstream-target convenience
    bootstrap and context refresh command.
---

# T-186: Versioned ABG/GTL Context Bootstrap

Closed on 2026-07-03.

The corrected split is:

```text
shared product toolchain root: immutable ABG/GTL product payload
target workspace: binding + context + mutable state roots
```

`abg.install` is intentionally target-local and idempotent. It binds the target
to the selected installed ABG/GTL product version and refreshes context
compression. It does not install GTL/ABG inside each downstream project.
