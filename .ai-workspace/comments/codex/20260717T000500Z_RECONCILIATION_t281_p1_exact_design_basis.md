# T-281 P1 Exact Design Basis Reconciliation

**Disposition**: exact candidate reconciled; independent review and F_H
acceptance remain pending. No P1 implementation or P2 publication is
authorized by this receipt.

The integration line now carries the byte-exact P1 design from checkpoint
`5dc7a5a6` with SHA-256
`f4228920cbf91152be569604e9fa7586903feb7b92ef81b456457a3ea2252c8b`.
The source branch's ticket was not replayed: the integration ticket retains the
later accepted Phase A source-resolution repair and T-274A closure truth.

The design cites Ontology projection
`039c19d3b6639ebc0357b40d8f12a6e8340e55ba0f8ef2f41c1e8cab914f53f1`.
The integration projection is
`bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615`;
the files differ only in the recorded `GOALS.md` digest row. The accepted
semantic candidate, 27 atomic families, seven compositions, 19 operation
identities, 35 non-read variants, 27 read cases, and 62 definition keys are
unchanged. This is a projection-basis rebind, not a P1 semantic change.

No runtime, Phase A implementation, public schema, package export, catalog,
SDK, CLI, or T-274A code changed in this reconciliation.

The exact reconciled tree passes the Mermaid render gate (`32` files, `96`
diagrams), Prime contraction gate (`8` accepted designs, T-281 as the sole
pending design, no failures), DS governance gate (`19` tickets, `77` comment
references, no failures), and `git diff --check`.
