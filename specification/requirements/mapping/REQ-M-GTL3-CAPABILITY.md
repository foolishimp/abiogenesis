# REQ-M-GTL3-CAPABILITY — Engine Capability Profiles

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [INTENT.md](../../INTENT.md) INT-001 and INT-006,
[PRODUCT.md](../../PRODUCT.md)
**Wave**: 3

---

## Purpose

Engines and build tenants publish a versioned conformance manifest so GTL
programs and installed consumers can determine mapping fidelity against exact
public contract and capability identities.

## Acceptance Criteria

**REQ-M-GTL3-CAPABILITY-001**: An ABG-conformant engine or build tenant shall publish a versioned tenant-conformance manifest declaring which GTL constructs and public capability contracts it can interpret.

**REQ-M-GTL3-CAPABILITY-002**: Tenant-conformance manifests shall align with the active GTL, ABG, and mapping requirement families and shall cite exact published public contract and capability identities rather than implementation-language, source-path, or private design identities.

**REQ-M-GTL3-CAPABILITY-003**: GraphFunction effects declarations shall be matchable against engine capability profiles for dispatch validation.

**REQ-M-GTL3-CAPABILITY-004**: An ABG tenant-conformance manifest shall declare its schema version, manifest identity, manifest version, digest, engine identity, engine version, and the exact public contract and capability identities against which the tenant claims conformance.

**REQ-M-GTL3-CAPABILITY-005**: The manifest shall identify the supported GTL declaration and GraphFunction publication contracts, ABG runtime event/result/replay contracts, catalog and installed-product contracts, public operator contracts, and worker effect/result capability contracts needed by the tenant.

**REQ-M-GTL3-CAPABILITY-006**: A conformance claim shall bind to one exact manifest identity, version, and digest. It shall claim only the listed contract and capability identities; package presence, an unversioned feature name, or an unrelated test pass shall not imply conformance.

**REQ-M-GTL3-CAPABILITY-007**: An incompatible or unresolved contract identity, capability identity, manifest dependency, or declared GraphFunction effect shall produce an explicit conformance gap and shall fail closed before the affected execution is admitted.

**REQ-M-GTL3-CAPABILITY-008**: A change to the meaning of a published contract or capability identity shall require a new versioned manifest claim. Replay and qualification evidence shall preserve the exact manifest identity and digest under which the work executed.

**REQ-M-GTL3-CAPABILITY-009**: The tenant-conformance manifest is declaration and read-model truth. Conformance, admission, runtime, and qualification surfaces may consume it, but it shall not create a second semantic compiler, runtime authority, release checker, or tenant-local control plane.

**REQ-M-GTL3-CAPABILITY-010**: A conformance-enforcement profile shall classify
submitted carriers as root/declaration, causal, derived, transition, or
closure-bearing before applying predecessor and behavioral-effect rules. The
classification and applicable rule identities shall be published contract
truth, not inferred from filenames or test inventories.

**REQ-M-GTL3-CAPABILITY-011**: A causal, derived, transition, or closure-bearing
carrier whose declared contract requires an admitted causal predecessor shall
fail conformance when that predecessor is absent, incompatible, or not
traceable through admitted identity. A root or declaration carrier shall not
be rejected merely because it lawfully begins a causal chain.

**REQ-M-GTL3-CAPABILITY-012**: Conformance shall reject behavioral F_D leakage:
an implementation declared F_D that performs semantic quality, intent
satisfaction, acceptance, open-domain judgment, or other non-total behavior in
place of the mechanical total finite-state predicates allowed by
`REQ-R-ABG3-HANDLERS`. A root declaration describing an F_D contract shall not
be rejected as behavioral execution merely for declaring that contract.

**REQ-M-GTL3-CAPABILITY-013**: The bounded enforcement proof shall include
positive root/declaration fixtures and negative missing-predecessor and
behavioral-F_D fixtures. The exact-candidate release manifest shall cite that
owning proof; it shall not reproduce the enforcement rules in a release-local checker.

**REQ-M-GTL3-CAPABILITY-014**: The exact public contract and capability
identities claimed by a tenant shall resolve through the installed product's
`publicContractCatalog` governed by `REQ-P-PUBLIC-CONTRACTS`. The tenant
manifest shall bind that catalog's identity, version, and digest. Requirement
names, feature prose, package presence, test names, and private export scans
shall not substitute for catalog rows.

**REQ-M-GTL3-CAPABILITY-015**: Each claimed capability row shall identify its
stable capability identity, owning public contract identity/version/digest,
supported disposition, and any required dependent capability identities. A
tenant builder shall be able to populate these rows by reading the public
contract catalog and this requirement family without consulting source or
design history.
