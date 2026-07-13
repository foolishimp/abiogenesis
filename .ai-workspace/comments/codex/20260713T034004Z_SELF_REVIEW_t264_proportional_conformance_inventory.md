# T-264 Self-Review - Proportional Conformance Inventory

## Verdict

Pass at the F_H-narrowed structural boundary. T-264 closes proportional scope,
derived declaration inventory, transitive effect visibility, and matchable
effect-requirement projection. It does not claim tenant capability
compatibility.

## Authority Review

- The implementation changes M03 read-model behavior only. It adds no GTL
  atom, runtime controller, product-specific branch, or second declaration
  authority.
- `submitted_structure` and `declared_complete_program` are closed scope
  values. Missing or unknown scope fails toward the stronger complete-program
  branch.
- Optional expected coverage and feature manifests are lawful only for bounded
  submitted structure. Supplied assertions remain exact. Complete-program
  assertions remain mandatory.
- Structural inventory is derived from admitted Module, GraphFunction,
  GraphVector, C-program, plugin-selection, handler, Job, and Role carriers.
  Human labels and URI spelling do not create applicability.
- Effect identities remain separate from plugin and handler identities.
  `Operator.binding` cannot become plugin-selection authority.
- Capability status is either not applicable for no effects or explicitly
  deferred for lack of an exact profile. No name-based compatibility is minted.

## Adversarial Review

The focused negative matrix covers missing and invalid scope, lawful empty
bounded structure, complete-program zero counts, duplicate and missing
transitive effects, effect/plugin authority collision, direct plugin bindings,
missing exact scalar seams, missing handler bindings, and unused handler
configs. A generic non-Consensus Module proves the behavior is not keyed to
Consensus.
The T-252 body proves declaration extraction does not erase its real C,
target-carrier, edge-closure, traversal, HOF, recursion, or runtime gaps.

The review also re-ran the legacy T-150/T-152 conformance suite. Seven stale
assertions assumed hand-authored feature rows were the only inventory source.
They were repriced into explicit-only evidence, structurally derived evidence,
and the independent F-star composition contract. The resulting legacy lane is
97/97.

## Evidence

- `npm run test:t264`: 82 GTL-law tests and 106 focused/legacy tests passed.
- Full semantic suite: 1,587/1,587 tests passed.
- T-223 packed/publication gate: 70/70 tests passed.
- T-250 constitutional drift gate: 13/13 tests passed.
- Registered design render: 3/3 diagrams passed with Mermaid 11.3.0.
- `npm run build:host`: strict TypeScript passed.
- `git diff --check`: passed before closure-state generation.
- T-252 canonical body digest is unchanged:
  `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
- Regenerated manifest digest:
  `sha256:6ba07d11efc6b34b895a30ec6688d2e6e2d3a10871da11f350b41f446edc0b41`.
- Derived inventory digest:
  `sha256:795387deaa63932ea568959cbc322ae926f16eb7bddc66b21129dad8bb20d779`.
- The active successor frontier is 16 singularly owned families with no
  duplicate or unowned family.

## Retained Boundary

T-255/DS-4 must admit the exact tenant capability profile before proving
effect-to-capability compatibility. Refs, plugin selections, handlers, package
versions, and passing tests are not substitutes for that authority.
