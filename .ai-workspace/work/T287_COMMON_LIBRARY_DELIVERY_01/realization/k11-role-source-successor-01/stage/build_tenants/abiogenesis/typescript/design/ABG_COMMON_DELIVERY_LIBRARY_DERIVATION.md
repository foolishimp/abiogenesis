# ABG Common Delivery Library Derivation

**Status**: Completed
**Date**: 2026-04-24
**Purpose**: Derive the first tenant-local ABG common delivery library from
the repeated delivery-boundary mechanics now visible in the TypeScript line so
installed-root plans, verification, and instruction-file injection are not
rebuilt per ticket.

## 1. Source Material

This library derives from:

- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/genesis/install.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`
- `build_tenants/abiogenesis/typescript/design/M04_INSTALL_BOOTSTRAP_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md`
- `.ai-workspace/tickets/completed/T-020-realize-typescript-m04-bootloader-and-project-facing-delivery-operations-under-explicit-bootloader-law.md`

## 2. Position

This library does not own bootloader meaning, installed runtime meaning, or
kernel/runtime semantics.

It owns only reusable delivery mechanics:

- installed directory/file refs
- pure delivery plans
- delivery materialization/verification helpers
- instruction-file marker injection helpers

## 3. Preserved Boundary Truth

The common delivery library preserves these truths:

- delivery surfaces remain below kernel semantics
- delivery helpers consume admitted delivery carriers only
- verification is explicit rather than shell-owned
- instruction-file mutation is explicit and idempotent rather than ambient
  helper behavior

## 4. Demoted Ticket-Local Detail

The library intentionally does **not** own:

- `T-019` installed package contract meaning
- `T-020` bootloader document content
- project-specific instruction-file policy
- package-manager execution or sandbox behavior

Those stay in the owning tickets.

## 5. First Library Target

The first delivery-library slice should realize only:

- one reusable delivery plan family
- one reusable delivery verification family
- one reusable delivery writer interface
- one reusable instruction-file injection contract/result pair
- one reusable materialize/verify helper surface

## 6. Required Next Assets

Before shared code opens, this derivation must be followed by:

- the common delivery-library first-slice IACS
- the common delivery-library structural carrier diagram in Mermaid UML
- the shared strict-lane expansion

Only then is the first common delivery-library wave ready for implementation.
