# T-272 Proxy Decision: Accept Product-Owned Public Next And Asset Targets

## Authority

Direct human instruction on 2026-07-25 delegated authority to Codex to
continue the accepted ABIogenesis 5.0 plan through completion or until the
human returns for status review.

This decision exercises that authority as a bounded `F_H` proxy. The human
remains the underlying authority. The proxy may accept implementation and
design cuts that preserve the accepted Product and current ticket plan. It
does not authorize a Product reprice, a new ticket hierarchy, a compiler,
controller, second runtime, or replacement Product trajectory.

## Exact Subject

- implementation candidate:
  `7432bac3a34e35c72ec9414f336e70733ed772fd`
- candidate tree:
  `20487522a25d46f7a5414056e211ef68a2a4c73b`
- complete M05 design SHA-256:
  `d090ff67ae86b444f39ecce2bef528f9e577dc8a7fe3a360e8ea1969de5404bd`
- packed artifact SHA-256:
  `26e658300e487f6a096b1fb02f1d5c0373bc124e8589b146f861139ec05f7602`
- Product content digest:
  `sha256:501b40515838defcb052429f6dead40700d8280d34d83949b03596fe2dd28793`
- manifest digest:
  `sha256:37e72a66666599c44a3dd2ef8b26c7609ab919c544052045d254ad581489cd12`

## Review

The candidate advances one developer-visible S03 outcome through the same
independently packed external Product:

1. the Product declares its default public start and optional asset-to-start
   ownership rows;
2. the GTL validator checks unique handles, unique asset ownership, declared
   start membership, and the default-start reference without lowering;
3. Public transports `next` or `asset:<handle>` and does not select a
   GraphFunction;
4. ABG independently admits the raw request against the exact Program,
   resolved start, and GraphFunction; and
5. HoG performs the selected ordinary GraphFunction traversal.

The asset remains non-callable. Direct `first_traversal` control cannot carry
the supervised One Surface gap-reentry authority. Installed mutations refuse
a missing default, unknown asset, and duplicate asset ownership before a Run
opens.

Verification:

- `test:m5`: `99/99`;
- `test:m4`: `26/26`;
- external developer Product: `28/28`;
- conservation projection: `57` pass and `5` explicit TODO, representing
  `35` proven rows and `5` open rows;
- two independently produced package archives are byte-identical; and
- `git diff --check` passes.

No compiler, lowering carrier, public controller, second runtime, new event
family, new public operation, or new ticket was introduced.

## Decision

Accept implementation candidate `7432bac3`, M05 Section 12.9, and complete
design digest `d090ff67...404bd`. The `advance_next` and `asset_target`
conservation rows are proven. T-272 and S03 remain active for one governed
correction outcome covering the five explicitly open consequence and runtime
disposition obligations.
