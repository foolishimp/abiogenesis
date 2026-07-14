# Self-Review: T-277 PC-001 Through PC-003 Consensus Realization

**Scope**: bounded Prime migration owned by T-274 and T-275

**Closure claim**: T-277 rows PC-001 through PC-003 are ready for independent
review; T-274 and T-275 feature closure is not claimed

## Result

1. `ConsensusContractFamily` is a strict schema-first authoring model. Native
   types and admission derive from the same Valibot schemas. The nine public
   identities and two vocabularies remain distinct projections.
2. The first implementation attempt was rejected during self-review because
   it mirrored every field roster in interfaces and hand-written decoders.
   It was replaced before checkpointing; the final realization has one field
   roster per required variant.
3. `ABG_CONSENSUS_MODULE_DECLARATIONS` remains as a compatibility projection,
   but it is generated from the exact admitted T-252 Module and outer
   GraphFunction. A different Module digest fails before declaration output.
4. The 14 open `ConsensusCarrier<Kind>` aliases and permissive `fields`
   payload are removed. Public and graph-private variants admit through one
   closed schema map. Graph-private variants are not package exports.
5. Admission recursively freezes the parsed carrier. Unknown fields,
   duplicate profile identity, cross-projection substitution, paired-null
   drift, result/failure mismatch, and ticket/result identity mismatch fail.

## Contraction Measures

| Surface | Before | After |
|---|---:|---:|
| Consensus callable authoring sources | 2 | 1 |
| Public contract-family authoring models | not realized | 1 |
| Type plus decoder field rosters per realized variant | 2 | 1 schema |
| Open Consensus carrier aliases | 14 | 0 |
| Public schema identities | 9 | 9 |
| Public vocabulary identities | 2 | 2 |
| Canonical Consensus body digest | `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695` | unchanged |

## Deterministic Evidence

- `npm run test:t252 --silent`: 82 GTL tests and 11 T-252 tests passed; probe
  manifest matched after adding the new contract-family source to its static
  dependency closure
- `npm run test:t256 --silent`: 62 focused tests and packed proof passed
- `npm run test:t277 --silent`: Mermaid, Prime governance, 8 gate negatives,
  5 Consensus contraction tests, and 4 operation contraction tests passed
- focused ESLint over all changed Consensus TypeScript files: passed
- `git diff --check`: passed

The persisted T-252 body digest did not change. Its manifest digest changed
only because the static source closure now truthfully includes
`consensus_contract_family.ts`.

## Remaining Owner Work

- T-274 still owns nine installed schema assets, embedded locator proof,
  catalog publication, source-free Module round-trip, and packed admission.
- T-275 still owns attributed multi-profile execution, serialized profile and
  result admission, stale-configuration negatives, replay-derived ticket
  projection, and its full exit matrix.
- Independent final review must accept this migration before T-277 closes.
