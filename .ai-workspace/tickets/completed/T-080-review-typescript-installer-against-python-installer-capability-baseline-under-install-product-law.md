---
id: T-080
title: Review TypeScript installer against Python installer capability baseline under install product law
type: review
ticket_category: installer_product_contract
status: completed
goal: abg-typescript-installed-substrate-contract
change_intent: Reconcile the full TypeScript installer contract against the useful Python installer capability baseline before closing the TypeScript installer RC path.
change_class: requirement_reprice
re_entry_point: requirements
affected_boundary: TypeScript installer product law, Python installer capability precedent, installed substrate manifests, installed docs/standards, clean/imported target behavior, install verification, installer archive proof
priority: high
triaged_at: 2026-04-27T12:38:53Z
created_at: 2026-04-27T12:38:53Z
updated_at: 2026-04-27T18:41:58Z
completed_at: 2026-04-27T18:41:58Z
dependencies:
  - REQ-P-INSTALL active
  - T-076 completed
  - T-077 completed
  - T-078 completed
  - T-079 completed
  - T-081 completed
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: STDO review of the new installer product contract against Python found that T-079, T-078, and T-077 are necessary but not exhaustive. Python installer capability also includes full standards tree, docs/bootloader distribution, clean-target scaffold behavior, install event/provenance, verify mode, and sandbox archive expectations.
requirement_authority:
  - specification/PRODUCT.md Installed Substrate Contract
  - specification/requirements/product/REQ-P-INSTALL.md
python_reference_surfaces:
  - build_tenants/abiogenesis/python/code/gen-install.py
  - build_tenants/abiogenesis/python/code/genesis/install.py
  - build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py
  - build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py
review_post:
  - .ai-workspace/comments/codex/20260427T184158Z_REVIEW_typescript_installer_against_python_baseline_t080.md
target_truth: The TypeScript installer RC path has a complete feature map against Python capability precedent, with every retained capability traced to REQ-P-INSTALL and either implemented by an owning ticket or explicitly rejected as incidental Python precedent.
superseded_truth: T-079 standards-copy implementation alone is sufficient to claim installer product-contract completeness.
closure_law: close only when the feature map is posted, every Python installer capability is classified as adopted/deferred/rejected/incidental, all adopted gaps have owning tickets or implementation proof, and the TypeScript installer design/module surfaces are updated or ticketed before implementation closure.
---

# T-080: Full Installer Capability Review

## Closure Result

Completed by:

- `.ai-workspace/comments/codex/20260427T184158Z_REVIEW_typescript_installer_against_python_baseline_t080.md`

The review classified the Python installer baseline across the required feature
map:

1. substrate root topology
2. package/runtime materialization
3. GTL/ABG runtime binding
4. install manifests and installer manifests
5. full standards tree and templates
6. installed docs and bootloader docs
7. marker-governed instruction files
8. `.ai-workspace` skeleton
9. clean-target scaffold mode
10. imported-target preservation mode
11. install event/provenance
12. public verification/doctor behavior
13. rerun/idempotency behavior
14. sandbox archive/postmortem proof
15. downstream consumption boundaries

## Findings

The TypeScript installer intentionally differs from Python where the product
line differs:

- `.genesis/` is replaced by `.abiogenesis/`
- copied Python runtime modules are replaced by package-backed
  `node_modules/@abiogenesis/typescript-tenant`
- clean-target project scaffolding is replaced by explicit
  `cleanTargetPolicy: "no_scaffold"`
- Python `genesis_installed` event proof is replaced by
  `.abiogenesis/install-provenance.json`
- Python `--verify` is replaced by public typed topology verification through
  `verifyAbiogenesisTypescriptInstallTopology(...)`
- Python root instruction injection is downstream product-owned in TypeScript,
  while ABG keeps substrate docs/domain-neutral references under
  `.abiogenesis/docs/`

## Downstream API Follow-Up

At review closure, one Python-baseline capability remained as a live design
question:

- `T-077`: whether to export a public reusable TypeScript M05
  sandbox/archive API for downstream products.

That follow-up is now completed. Current ABG installer qualification preserves
persistent archive proof, and `T-077` publishes the reusable downstream M05 API
shape.

## Verification

This is a review ticket. No code was required.

Related implementation proof already passed in prior installer tickets:

- `npm run test:t076`
- `npm run test:t019`
- `npm run lint:semantic`
