# Review - T-281 Phase A Source-Resolution Rejection

## Verdict

Reject the Phase A closure claim at committed span `5d3aedd3..eeb286bc`
pending the bounded repair below. The native packet, canonical projection, and
neutral M03 owner direction remain useful; P1 and T-274A closure remain gated.

## Findings

1. `defineNativeContract` accepts a caller-supplied schema beside a separately
   supplied locator. A caller can therefore mint a witness naming one source
   while projecting another schema. Test-only locator comparison does not close
   the production boundary.
2. A family-owned `v.check` predicate can change while its stable check
   identity and projected JSON Schema remain equal. The witness must bind the
   deterministic compiled owner implementation basis without hashing
   `Function.toString` or adding another registry.
3. The Consensus admission path retains a local recursive freezer even though
   `freezeNativeValue` is the accepted shared immutable-value mechanism.
4. Nine T-274A domain-schema witnesses do not close
   `project.read(ticket_consensus)`. T-281 owns the generic request/refusal and
   absent-nonterminal wrapper; T-274A supplies only the existing
   `ConsensusResult` source and `TicketConsensusProjection` result coordinates.

## Bounded Repair

- Resolve a fixed-root `semantic_build` locator through own data properties to
  one recursively frozen Valibot schema and mint an opaque WeakMap-backed
  source carrier. `defineNativeContract` accepts that carrier, never a raw
  schema/locator pair.
- Hash the exact compiled owner-module bytes into the source basis and witness;
  refuse in-process module-byte changes so ESM cache state cannot diverge from
  the claimed basis.
- Append `schema` to the accepted `88e5a8e3` neutral M03 owner locators and
  deep-freeze their source graph. Authority and identity remain sibling owner
  metadata; no M03 dependency on M04 is introduced.
- Replace the local Consensus freezer with `freezeNativeValue`.
- Keep T-274A's nine-schema exit unchanged. Record the two-owner P1
  composition in T-281, T-274, the M04 design, and GOALS.

## Required Proof

Wrong-schema, forged-source, missing/inherited member, traversal/absolute path,
unfrozen schema, and ESM cache-change negatives must refuse. An opposite-
predicate differential must show equal projected schema digest but distinct
source-basis and witness digests. Focused neutral-owner, Phase A, T-274A, type,
direction, full semantic, GTL, governance, design, Prime, and diff gates must
pass before independent re-review.
