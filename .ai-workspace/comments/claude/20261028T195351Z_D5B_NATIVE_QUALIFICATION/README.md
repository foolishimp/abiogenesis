# D5-b native qualification of the candidate `fd38e8227`

Worker record for T-287 Phase D, package D5-b (Opus 5.5). This is commentary.
The Return in `phase_d.md` (`## D5-b return`) is the account. These files carry
digests and paths only (TD-19). The evidence stays in the run archive
`build_tenants/abiogenesis/typescript/test_env/test_runs/qualification/2026-10-28T19-35-54-534Z-bf82a8b7-1d37-42ed-9764-90e42e510085`.

**Disposition.** Stopped before dispatch at the projection stop. No AF22 verdict
and no F11 run. No provider call was made (0 USD).

- **The projection stop.** The plan projects 1,295.6 USD against the 60 USD cap.
  The slots inside the 1,048,576-byte bound alone come to 594.72 USD. The
  rule-input floor is 81.85 USD and holds for every partition.
- **The attribution gate (a finding, not an activation stop).** The F-4 chain
  set is 22 chains, all grounded. It covers 128 of the 1,188 inventory members.
  521 of 578 slots carry an unattributed subject member, and those slots are
  `invalid` (`validator/qualification.ts:800-804`). An owner acknowledgment
  cures only `insufficient` (`abg/qualification_proof.ts:659-668`), so F11 is
  unreachable under F-4 at any budget.

## Figures

| Item | Figure |
|---|---|
| Live run | `2026-10-28T19-35-54-534Z-bf82a8b7-1d37-42ed-9764-90e42e510085`, 19:35:54Z to 19:49:44Z, load 13.59 before and 15.71 after, status `stopped`, 0 calls, 0 turns, 0 USD |
| Recipe | measured outside C2 at 228,077 ms; 9 commands, all exit 0; the candidate-pack predicate matched; observed C2: not run |
| Domains (item 2) | 95 rule groups in 9 families; 5,614 pairs (5,049 applicable, 565 inapplicable, 0 unknown) against D5's global 2,660; every domain classified |
| Provenance (item 3) | 22 chains (`51bc5d2d8` exclusive to `7e3fefa46` inclusive): 15 Opus 5.5, 7 Fable 5.1; each grounded alone; 442 records, 138,197,867 bytes (184,264,424 as base64); 13.2 s; heap 182 MB, RSS 817 MB; held |
| Slots (item 4) | 578 slots: catalog 7, inventory 15, rule 554, tenant 1, coverage 1; `sharedCoverage` `disjoint`; 72 slots over the bound (71 REQ-P-QUAL-056 rule slots and the coverage slot, 1.06 to 8.34 MB, because of the 6.85 MB estimated execution material) |
| Cold reads | a fresh process; 10 of 10 rows equal; the event log is unchanged |
| Roster (item 8) | of 14 rows, 2 map to suite lanes (batch, C.batch); 12 stay gaps (6 with no carrier, 2 with a gated carrier that is skipped, 4 derived) |

## Files

| File | Content |
|---|---|
| `provenance.json` | Item 3: the head, the chains, the per-chain grounding, the coverage of the whole inventory, uncovered members by role, bytes and heap. |
| `projection.json` | Item 4: the price, the execution estimate, the per-role totals, the rule-input floor, the over-bound slots, the gates and the 578-row slot table. The full rows are in the archive's `projection.json`, by digest. |
| `run.json` | Item 6: the live run, the wrapper sequence and uptimes, resources and checks, the budget, the item 2 applications, archive file digests, and the two dry runs made before commit 1. |
| `verdict.json` | No AF22 verdict, and why. |
| `findings.json` | G-1 to G-8: the stop, the attribution gate, the over-bound execution slots, the Bash limits that do not reach the provider, the F-6 correction, the roster correction, model independence, and the concurrent load. |
| `cost.json` | 0 provider calls, 0 USD, and how the token was handled. |
| `cold-reads.json` | The fresh-process re-derivation after the live run. |
| `roster.json` | Item 8: D5's 73-row roster with the 14 rows mapped to suite lanes by case text (suite at `ddc1b091c`, 199 lanes complete), each true gap with its PRODUCT.md citation. |
