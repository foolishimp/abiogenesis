# S06 Design Self-Review: Portability And Reflection

## Subject

- design commit:
  `6aaedf8d826f846a11291676413bd35f93df0ef4`
- candidate tree:
  `a1a0f5d1303a6e238894491096ad424c209b8855`
- design:
  `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`
- complete design SHA-256:
  `fb9e71bccf3e98972179df81a7c22ee7dbc266175d6cda1ae8bc5dff875429b3`
- changed boundary: Section 14 only

## Verdict

Pass. Section 14 is a bounded design extension over the accepted direct-GTL
architecture. It resolves the material S06 identities, public boundary, and
authority split without changing Product meaning.

## Requirement Fit

The design closes the exact `ABG5-S06` scenario:

- native SDK and CLI invoke one installed public contract without a host;
- a bounded Codex delegate transports the same CLI contract with no copied
  semantics;
- an independently packed flavored Product publishes and applies node-type and
  overlay declarations and invokes its GraphFunction through installed public
  ABIogenesis contracts; and
- observer/tuner behavior is realized over replay truth before S04
  qualification.

The observer/tuner boundary preserves `A5-F12`,
`REQ-R-ABG3-TUNER-001..014`, and the existing public operation and event
identities. `catalog.apply` and `tuning.transition` were already constitutional
public operations. `tuner_draft_admitted`, `tuner_draft_ratified`, and
`tuner_draft_rejected` were already required event kinds. The design invents no
operation or event family.

## Authority Review

- Product domains own declarations, observation meaning, signals, and draft
  meaning.
- GTL owns Program and GraphFunction topology.
- HoG traverses admitted GTL directly.
- ABG admits catalog applications, runtime facts, draft transitions, events,
  and replay.
- human or declared policy authority ratifies or rejects.
- Public transports typed operations and derives read-only projections.
- the Codex adapter delegates to the installed CLI and owns no Product or
  runtime behavior.

The paused Python Codex tenant is correctly classified as a rival runtime and
is transactionally retired by the implementation cut. Observer and tuner may
produce evidence and candidates only; neither can mutate live authority.

## Proportionality

The design adds one section to the existing M05 carrier rather than another
ticket or design pack. Its three semantic views and IACS table remove material
ambiguity at the new Product, adapter, public-operation, and event boundaries.
Micro contract details remain free to co-evolve in code.

No compiler, lowering carrier, controller, scheduler, second runtime, second
truth store, feature-specific Public branch, or source-tree downstream
dependency is authorized.
