# ABIogenesis Axiomatic Context

This directory is the current source-linked `a_c.ABI` development context for
T-287. It is a read model, not specification, accepted design, GTL, runtime
truth, or release evidence by existence.

- program URI: `urn:axiom-indexer:program:abiogenesis:mutable-worksite-spine:1`;
- canonical program SHA-256:
  `ea83a30d8ddb16ce513e4d1a60f7de8dcd1b4a2bb8fdbe4060d792805d3fcbfa`;
- logical map SHA-256:
  `321313a0fb6125afed4bc8495791972813791e7fcf8f7b365f7e54099c3dc642`;
- validation: `valid`, zero diagnostics, 11 symbols, 12 clauses, three
  explicit residuals.

Validate and reproduce the map with the exact installed Axiom Indexer:

```sh
python3 .genesis/development-products/axiom-indexer/build_tenants/core/code/ac.py \
  validate \
  --program .ai-workspace/context/axiomatic/axiomatic-program.json \
  --bindings .ai-workspace/context/axiomatic/bindings.json \
  --output .ai-workspace/context/axiomatic/validation-report.json \
  --emit-map .ai-workspace/context/axiomatic/logical-constraint-map.json
```

Start work from `logical-constraint-map.json`. Re-enter the exact source URI
when a selected clause, residual, or decision requires it. Revalidate after an
authority source changes.

`executive-review-sections.json` records the exact caller-selected order and
content of the first bounded review request. `executive-review-request.txt` is
its byte-exact pure-join output. Their file SHA-256 values are
`bba41e7877212c9040f96c504acbaceb1fb25dd4d7d5fab4497461df09bcb8af`
and `eb50c952fd9a6eddd84698ba8e4bad16e4307a9a014c20141a562d182ad2b7ad`.
