# abiogenesis RC Notes

This note records release-candidate caveats and accepted framework behavior
for the current `abiogenesis` wave.

## Accepted Framework Behavior

### Provenance-Ready Runtime Is Now Mandatory

The current RC removes `"unknown"` as a lawful governed-runtime provenance
mode.

That means:

- governed runtime initialization now requires valid workflow metadata
- missing or malformed active-workflow metadata is a runtime defect, not a
  compatibility fallback
- CLI and runtime entry points fail closed when provenance metadata is absent
  or invalid

This is an interface cut in the substrate runtime boundary, not a downstream
compatibility feature.

### Install And Bootstrap Seed Workflow Truth By Construction

The current RC treats provenance readiness as part of the install/bootstrap
contract.

That means:

- install/bootstrap writes active workflow metadata into the runtime surface
- fresh installed workspaces start provenance-ready rather than degrading at
  first use
- runtime truth now assumes versioned workflow metadata exists because install
  guarantees it

### Approval And Runtime Identity Are Versioned More Strictly

The current RC strengthens the identity carried by runtime approvals and
probabilistic assessment reuse.

That means:

- bare edge-name `F_H` approvals no longer authorize governed traversal
- runtime `spec_hash` now binds workflow version, executable-job structure, and
  requirement truth
- stale probabilistic assessments reopen when active workflow or requirements
  truth changes

## Current Known Limitation

### Downstream Consumers Must Refactor To The Released Boundary

This RC does not provide a backward-compatibility shim for removed provenance
fallback behavior.

That means:

- downstream consumers such as `odd_method` must consume this RC through their
  installer path
- downstream `.genesis` truth is refreshed by install, not by manual source
  mirroring
- downstream green status is a separate refactor/proof wave, not part of this
  ABG RC note itself

## Current Verification Footer

The current release-candidate proving footer is:

- `257 passed`
- `5 deselected`
- `24.43s`

from:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
