# ABIogenesis Axiomatic Context

This directory contains derived, source-linked ABI context for T-287. The
operative STDO basis and companion Product composition are selected once in
`stdo_abiogenesis.json`. The corresponding exact installs are reached through
`.genesis/development-products/`. Upstream STDO and the declared source owners
retain authority; these files are context and evidence.

Use the released Axiom Indexer to validate and regenerate this local map:

```sh
python3 -B .genesis/development-products/axiom-indexer/build_tenants/core/code/ac.py \
  validate \
  --program .ai-workspace/context/axiomatic/axiomatic-program.json \
  --bindings .ai-workspace/context/axiomatic/bindings.json \
  --output .ai-workspace/context/axiomatic/validation-report.json \
  --emit-map .ai-workspace/context/axiomatic/logical-constraint-map.json
```

Re-enter the exact source routes whenever a material relation is stale,
conflicting, missing, or insufficient. Re-author affected meaning before
regeneration; mechanically valid output does not establish semantic fidelity.
Compare a fresh validation's resolved source digests and derived map with the
retained evidence before relying on a previous report.

`executive-review-sections.json` and `executive-review-request.txt` are an
unactivated Reviewer context template. They do not select the former Stage 1/2
work plan, any current baseline repair, or a migration review subject. Review
applicability and its exact activation come from current Goals and T-287. Their
presence activates no actor and changes no work or review disposition. The request is
produced by the exact installed Axiom Indexer `join` command from the ordered
sections.

## Current Derived Identities

The program owns its URI and authored content. The generated map owns its
canonical program/map identities and observed source digests; the validation
report records the corresponding mechanical check. Do not copy those changing
values into a rival context summary. Revalidate after changing any selected
source, including Goals, Product, the ticket and design routes.

The map covers the bounded mutable-worksite spine, not the complete ABI Product
or STDO corpus. It records accepted Wave 2, selected Wave 3 and bounded remaining qualification,
while preserving Stage 1/2 predecessor limitations as history. It does not model
the complete Wave 3 Product or activate work. The exact installed
STDO Representation owns the complete released method compression and its
available frame-index views.

## History

Pre-update bytes and operational evidence are retained at
`history/20260905T025248Z-pre-rc4-adoption/`.
They are historical evidence and do not select the current basis.

The complete pre-RC6 context is preserved in Git commit
`29846fc36c6a455e5aab642a5965a47fbfeb815d` at this same directory. It is
superseded context, not a current activation. See the
[RC6 migration evidence](../../comments/codex/20260906T152118Z_STDO_RC6_MIGRATION/README.md).
