# T-252/T-272 Constructability Repair Review Decision

## Decision

Accept the paired repaired designs at exact digests:

- T-252: `f1e119d5f38209409310c7f3631c3b3ee10663c02464b218cdae80e2e8e25444`
- T-272: `1ea155c6a50a35f7d59f6448dab48cbefe7f0f8ec69c4e21a6b20ec8647688e6`

The repaired Consensus body and F_H continuation implementation may proceed
within these boundaries. This decision uses the delegated F_H authority for
ABIogenesis 5.0.

## Independent Review

The review found no remaining substantive defect after one bounded correction:
the no-unused-definition law applies to the exact fifteen-definition runtime
join input, while six other standing public assets remain publication-only and
outside that join.

The accepted pair proves:

- fifteen reachable schema sources: three reused public identities and twelve
  private engine keys;
- one strict five-field Module metadata row family and no generated M04 facts
  in the Module;
- a total three-outcome Consensus recurse partition;
- both F_H leaves target the declared round-disposition result;
- T-272 consumes the exact T-270 checkpoint type without copying its fields;
- one event-contained checkpoint seal and verify-before-reconstruct ordering;
- strict replay-ordinal admission before lifecycle derivation; and
- authority conservation `17 -> 17` with no new runtime controller, store,
  public operation, or event family.

T-274B remains fenced until its own accepted design adopts delivery of the
exact fifteen-definition runtime join input. This decision does not silently
grant that downstream ownership.

## Verification

- Mermaid: 3/3 views for each design; 96 diagrams across 32 files
- Prime gate: passed for nine governed tickets and 12 checked refs; its legacy
  status projection still reports six accepted and three pending
- governance: 19 tickets, root T-252
- fifteen-source census: 15 total, 3 public and 12 private
- Pandoc and `git diff --check`: passed
