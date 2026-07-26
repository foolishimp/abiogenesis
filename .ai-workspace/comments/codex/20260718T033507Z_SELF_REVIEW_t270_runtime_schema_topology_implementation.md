# T-270 Runtime Schema Topology Implementation Self-Review

## Scope

This review covers the bounded runtime-schema capability implementation and the
design amendment accepted at digest
`2df86cb900cf263383b552a9a81459cac11889f5bc2ee4e8dd094f4ff3079471`.

## Review Findings And Repairs

1. M04 previously admitted strict flat metadata rows without proving that their
   GraphFunction, Node, and symbolic schema identities belonged to the carried
   Module. M04 now validates every row against exactly one
   `module.graphFunctions` member and the member's exact contained Node set:
   inputs, outputs, environment requires/provides/carries, and inline-graph
   nodes. Equal ids deduplicate only when the complete Node values agree.
2. The accepted design incorrectly said both duplicate tuples and repeated
   contract keys refuse. The corrected design rejects duplicate
   GraphFunction/Node/schema tuples while allowing many rows to join one exact
   asserted native definition for a repeated distinct contract key. Duplicate
   native definitions for one key still refuse.

The complete Module metadata family and complete distinct native-definition
family are admitted before selected-GraphFunction capability construction. M04
remains the sole native-definition asserter and neutral capability-constructor
caller. M03 receives only sealed bases and the separate identity-free
process-local callable envelope. No callable enters Module metadata, a stable
digest, ingress identity, replay, persistence, or a registry.

## Negative Proof

The non-Consensus Scenario-09 proof now covers:

- foreign GraphFunction refusal;
- foreign contained-Node refusal;
- lawful internal environment/inline-graph Node admission;
- divergent complete Node truth under one contained identity refusal;
- mismatched symbolic schema ref refusal;
- duplicate metadata tuple refusal;
- lawful repeated contract-key contraction to one native definition;
- missing, extra, duplicate, and reforged native-definition refusal; and
- unchanged neutral-brand and exact-basis matching.

## Verification

- strict TypeScript build: passed
- touched-source/test ESLint: passed with zero warnings
- direct T-270 runtime-schema lane: `7/7`
- neutral T-270/T-272 contracts: `9/9`
- existing T-270 ingress projection: `9/9`
- T-255 focused lane: `27/27`
- T-267 focused lane: `59/59`
- T-267 packed proof: `1/1`
- GTL law: `82/82`
- design Mermaid gate: passed, 32 files and 96 diagrams
- Prime contraction gate: passed
- DS governance gate: passed
- `git diff --check`: passed

The full semantic run completed `1908/1914`. All six failures were reproduced
unchanged on a detached copy of base commit `5e01f17d`: four share the stale
`product-toolchain-manifest.json`, one is the T-223 runtime-catalog fixture's
execution-binding mismatch, and one is the T-251/T-273 omitted-register
negative. They are baseline failures and were not changed or hidden by this
bounded implementation.

## Drift Review

No Consensus body/schema roster, F_H carrier, public operation, public catalog,
schema identity, event, store, or runtime controller changed. The only stable
carrier addition remains the neutral digestible basis already accepted by
T-270. The correction strengthens malformed-input refusal and removes one
Prime contradiction without widening the product surface.
