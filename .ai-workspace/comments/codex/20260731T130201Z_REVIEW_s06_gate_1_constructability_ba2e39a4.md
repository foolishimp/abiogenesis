# Review — S06 Gate 1 Constructability `ba2e39a4`

Date: 2026-07-31T13:02:01Z

Review role: cold independent Gate 1 constructability reviewer

Subject:

- branch: `codex/t286-abi5-root`
- commit: `ba2e39a4b51f2192d88089294edeef364cf53043`
- tree: `3d5686d4c845c050c38b9f4c12e05f53014910bf`
- accepted census blob: `efe88cac85bd3bb071d4b5dd451dfadaec893c4f`

Verdict: **REJECT — constructability counterexamples found.**

This review inspected only the frozen subject. It did not inspect donor code,
edit the subject, execute held falsifiers, or author replacement features.

## Counterexamples

### C-01 — The 24 `project.read` rows do not bind exact owner-local contract members

Accepted invariant: T-281 requires every key's construction row to bind its
selected concrete port, request/result/refusal/non-terminal slots, effect,
installed closure, and deletion impact
(`.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md:274-279`),
and rejects an interface, string, or proposed name without exact concrete
ownership (`:321-323`). The candidate design separately requires owner-local
packet values to be the sole contract source
(`build_tenants/abiogenesis/typescript/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:50-55`).

Counterexample: the closure ledger names only the aggregate exports
`PRODUCT_PROJECT_READ_CONTRACTS` and `ABG_PROJECT_READ_CONTRACTS`
(`M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:403-404`).
The 24-row table then lists each key's callable port and target/closure, but no
row lists an owner-local contract member coordinate (`:454-484`). For example,
`catalog_list` binds `Product.CatalogProjectionPort.list` at `:461`, but the
subject never binds that key to a member of `PRODUCT_PROJECT_READ_CONTRACTS`.
The accepted census supplies only the derived Public coordinate
`PROJECT_READ_CONTRACTS.catalog_list` (`.ai-workspace/comments/codex/20260731T113200Z_CENSUS_abiogenesis_5_0_s06_exact_56_key_construction.md:230`),
not the missing owner-local source member.

Therefore constructing `PROJECT_READ_CONTRACTS` requires choosing an owner
contract member relation that the frozen subject does not specify. That fails
the claimed total derived join and the every-key owner-local contract
predicate; the Public join cannot be proven to author no owner meaning.

### C-02 — `AX-F09` has no implementable proposed ingress coordinate

Accepted invariant: every falsifier must name its current ingress, proposed
exact-family ingress, boundary, fixture, mutation, observable oracle, expected
baseline signature, and masking controls
(`.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md:424-435`).

Counterexample: `AX-F09` names its proposed ingress only as “admitted
retry-input projector plus HoG resume”
(`.ai-workspace/comments/codex/20260731T113200Z_CENSUS_abiogenesis_5_0_s06_exact_56_key_construction.md:701`).
The design describes an `ExecutableRetryInput` result but does not name a
target module, runtime export, or callable member for the projector or resume
boundary (`M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:309-317`).
The closure rows mention only the categories `ABG ... retry` and `HoG direct
execute` (`:409-410`). This contradicts the design's claim that every proposed
callable name is bound by Sections 10.2 through 10.4 (`:531-537`): there is no
callable coordinate to import or invoke for this record. Implementing the
falsifier would first require selecting new ingress meaning.

### C-03 — `AX-F08` does not freeze an expected baseline signature

Accepted invariant: the same T-281 record grammar requires an expected
baseline signature (`T-281-publish-prime-19-operation-definition-family.md:424-435`),
and Increment 0A must freeze row-addressed expected-red evidence without later
weakening or changing the characterization (`:443-455`).

Counterexample: `AX-F08` covers initial cursor, continuation reconstruction,
F_H response/resume, three closure modes, and refusal causation, but its entire
expected baseline is only “one or more actions refuse or cite the unrelated
global-tail event”
(`20260731T113200Z_CENSUS_abiogenesis_5_0_s06_exact_56_key_construction.md:700`).
It identifies neither which per-fixture action must fail nor the exact refusal
or causal coordinate expected at any target point. Any non-empty subset of the
listed observations can satisfy that wording, so the later row-addressed
baseline cannot be frozen without choosing new expected behavior. The
candidate's assertion that every record already fixes its baseline signature
(`M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:531-537`)
is false for this record.

## Other reviewed claims

No separate counterexample was found in the exact 18-operation/56-key
arithmetic, the common installed `@abiogenesis/typescript-tenant` `./public`
member coordinate, the named callable port destinations, the census
slot/effect/deletion row joins, the owner-to-Public prohibition, or the stated
whole-`dist`/all-56 tarball rule. Those observations do not cure C-01 through
C-03 and do not accept any later Gate.

The exact frozen subject returns to direct F_H under the Gate 1 review
contract. This receipt authorizes no repair or implementation.
