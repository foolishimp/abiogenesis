# T-274B Private-Definition Delivery Amendment Self-Review

## Scope

This design-only amendment closes the ownership gap exposed by the accepted
T-252 and T-270 designs. It changes no T-274A output and implements no runtime
or publication code.

## Result

T-274B now consumes the exact T-252 fifteen-key native source family and uses
the existing T-281 projector to derive exactly fifteen asserted native
definitions for the M04 runtime join:

- three keys reuse existing public identities;
- twelve keys remain engine-private;
- six other public Consensus assets remain outside the runtime join;
- every Module row must resolve exactly one definition;
- every join-input definition must be used; and
- no private key or definition becomes a public catalog row.

The native-definition set is subordinate process-local projection. It adds no
schema family, registry, public identity, operation, callable, persistence, or
authority. Full native coordinates and witnesses stay downstream of the flat
five-field Module metadata boundary.

## Independent-Review Repair

The first candidate was rejected for a dependency cycle and a non-constructable
source shape. The repaired candidate now has two ordered milestones:

- T-274B1 consumes one keyed, projector-addressable T-252 source family whose
  entries carry the existing locator and named-check contracts, derives the
  fifteen definitions, and lets M04 prove the exact total join before T-270;
- T-274B1 publishes nothing and unblocks T-270; and
- T-274B2 performs public and installed publication only after T-281 P1 and
  accepted T-270 runtime integration.

The domain, sequence, and state views now show Module metadata and definitions
meeting only at the M04 join. The definition producer no longer claims
authority to prove its own use. The live T-270 dependency record also names
T-274B1 as an input and T-274B2 as the downstream publication milestone.

## Drift Review

- T-252 still owns schema keys and native source shapes.
- T-274A still owns only nine temp schema assets and two vocabularies.
- T-274B derives definitions and packages/publicizes the existing public
  assets and GraphFunction contribution; it does not author schema meaning.
- M04/T-270 still owns the exact key/definition join and neutral capability
  construction.
- T-275 still owns profile, policy, result, and ticket projection bindings.
- Public publication remains nine schemas, two vocabularies, and one SYSTEM
  GraphFunction contribution.

## Verification

- design digest:
  `578d0487a460ae6920348e5031e059475dc9d71cca57d8fbac418cf2ed749f05`
- Mermaid gate: passed, 96 diagrams across 32 files
- Prime gate and tests: passed, `9/9`
- Pandoc parse: passed
- `git diff --check`: passed

Verdict: `candidate_pending_independent_fh_review`. T-274B implementation stays
fenced until exact-digest acceptance and repaired T-252 implementation closure.
