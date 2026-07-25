# S06 Proxy Decision: Accept Portability And Reflection Design

## Authority

Direct human instruction on 2026-07-25 delegated authority to Codex to
continue the accepted ABIogenesis 5.0 plan through completion or until the
human returns for status review.

This decision exercises that authority as a bounded `F_H` proxy. It may accept
design and implementation cuts that preserve the accepted Product, current
ticket graph, and GTL/HoG/ABG authority split. It does not authorize a Product
reprice, new ticket hierarchy, compiler, controller, second runtime, or
replacement trajectory.

## Exact Subject

- design commit:
  `6aaedf8d826f846a11291676413bd35f93df0ef4`
- candidate tree:
  `a1a0f5d1303a6e238894491096ad424c209b8855`
- complete M05 design SHA-256:
  `fb9e71bccf3e98972179df81a7c22ee7dbc266175d6cda1ae8bc5dff875429b3`
- changed boundary: Section 14
- self-review:
  `20260725T014500Z_SELF_REVIEW_s06_portability_reflection_design.md`

## Decision

Accept M05 Section 14 and release S06 implementation under T-281 and T-268.

The accepted implementation boundary is:

1. one public `catalog.apply` relation for admitted non-callable declarations;
2. one independently packed flavored Product using installed public contracts;
3. native SDK and CLI plus one semantics-free Codex CLI delegate;
4. one Product-owned observer and tuner publication over ABG replay;
5. read-only observer/tuning projections;
6. the already-required tuner draft admission, ratification, and rejection
   events; and
7. transactional retirement of the paused Python Codex runtime.

Implementation may co-evolve inside these identities. Any change to Product
meaning, event ownership, public operation identity, or the direct
GTL-to-HoG-to-ABG authority relation returns to design.
