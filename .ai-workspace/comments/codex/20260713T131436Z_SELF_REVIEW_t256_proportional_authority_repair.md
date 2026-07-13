# T-256 Proportional Authority Repair Self-Review

**Date**: 2026-07-13
**Base checkpoint**: `660b822`
**Verdict**: repair complete; ready for independent re-review; do not close T-256 or start T-257

## Repair Disposition

1. **Selected catalog authority is exact.** The public join now requires the
   selected catalog entry ref, resolves only that execution binding, and uses
   Module containment solely to verify the exact T-255 helper. An unrelated
   sibling entry cannot authorize the helper, while another entry in the same
   Module no longer creates false ambiguity.
2. **Relevance and compression are declared decisions.** The instruction Rule
   carries closed policy identity plus mode. T-256 admits only selected-vector
   source closure and full admitted content, derives decisions from the exact
   vector, carriers, required sections, content digests, and policy modes, and
   rejects unsupported modes or optional sections without an admitted decision.
   No generic policy engine or implicit fallback was introduced.
3. **Work class is derived, not protocol-authored.** The protocol no longer
   carries `instruction_work_kind`. The exact selected composition role derives
   semantic, dependency-disambiguation, or target work. Dependency
   disambiguation now requires target-scoped candidate node, candidate edge, or
   typed-gap truth; null or empty truth fails canonical T-183 compilation.
4. **The selected result contract is conserved.** The exact result-contract ref
   is distinct from the aggregate target contract set and is retained by the
   compiled plan, instruction envelope, replayable prompt manifest, and F_P
   request. Prompt-asset output contracts remain excluded from worker-result
   truth.

## Proof

- `npm run test:t256`: pass; GTL 82/82, focused T-256 lane 55/55, packed API 1/1.
- `npm run test:t188`: pass; shared instruction compiler 70/70.
- `npm run test:t252`: pass; body/probe 11/11 and ten real canonical joins.
- T-252 body digest remains `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
- `npm run test:semantic`: pass; 1,618/1,618.
- `npm run lint:semantic`: pass with zero warnings.
- `npm run check:design-mermaid`: pass; 27 diagrams across 9 files.
- `npm run check:abg-product-publication`: pass; 63 schemas and 33 publication assets exact.
- `git diff --check`: pass.

## Proportionality Boundary

- No general policy language, policy runtime, or new instruction carrier was
  introduced.
- No Consensus-specific runtime branch, prompt shell, response admission,
  traversal implementation, or effects path was added.
- T-267 still owns traversal conservation and every request remains
  startup-blocked before effects.
- T-268 still owns tenant-conformance admission.
- T-257 remains blocked until independent review and human acceptance close
  T-256.
