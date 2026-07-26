# T-281 Public Operation Definition Family Review

- review seat: independent Codex subagent `/root/t275_reconciled_design_review`
- reviewed semantic candidate: `6021994ae88bcd8d83909d6e50f94805db4b624a5ff124835295ce9ddd7b0e1a`
- accepted status projection: `2b5153aedb06dc5c814bf356de45b1ec5bc3b91a766d107002d0f2b3176e6f6e`
- verdict: accept for P1 implementation only

## Findings

No blocking finding remains.

The design defines exactly 19 public operation identities and a closed
27-case `project.read` relation, including `ticket_consensus`. Each variant has
an exact request, result, refusal, nonterminal, capability, authority, effect,
event or manifest, disposition, schema, SDK, CLI, and exit contract packet.

One closed value-level contract algebra drives native inference, raw admission,
canonical digest, and schema projection. Conditional inputs use explicit
discriminants or present nullable values rather than permissive optional-field
combinations. Required catalog-view identity and allowlist preserve current
product law; implementation must pin their equality.

The non-Consensus `workspace.create(clean)` fixture is reachable at the P1
source-build state before P2 publication. Public and packed invocation remain
blocked until handler binding and full packed parity close.

## Verification

- exact public operation identities: 19/19 unique
- exact `project.read` cases: 27/27 unique
- Mermaid: 3/3
- Prime gate: pass
- governance gate: pass
- Pandoc: pass
- target `git diff --check`: pass

Implementation watch items are allowlist-to-`CatalogView` equality and source
scans for unchecked casts, permissive indexes, parallel rosters, and legacy
facades. P2 remains excluded and release-blocking.
