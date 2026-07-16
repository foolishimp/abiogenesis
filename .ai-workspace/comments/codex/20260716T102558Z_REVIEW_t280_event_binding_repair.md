# T-280 Event-Binding Repair Review

- review seat: independent Codex subagent `/root/t280_event_binding_review`
- rejected precursor digest: `9bf1577056bb5dc2a111d6cdc95ca7626864179868f99023ddfb50d6d84efa18`
- accepted semantic candidate digest: `de845b3c31f1d1255ab99ce07503078f7b890b09029ad3b847d3f1762051a81a`
- verdict: accept bounded T-280 implementation

## Findings

No blocking finding remains.

The repaired design closes the three bounded event-binding defects:

1. AF-11, AF-12, AF-13, and AF-16 typed refusals traverse the same canonical
   authority-snapshot, payload, evidence, result, judgment, Event Calculus,
   and application-bound rule path as successful results;
2. the domain view uses the clean existing
   `RuntimeEventCalculusEffectRow.sourceEvent: RuntimeEvent` and
   `RuntimeFluent` shapes, adding only the
   `one_surface_authority_outcome` fluent name with `graph_call` scope and a
   ref-only result-binding index; and
3. `regime` and `armId` participate in definition, application, snapshot, and
   result joins and their mutation negatives.

The candidate uses only existing `evidenceRefs`, keeps GTL-program and
complete-C-program identities distinct, and selects canonical facts by
admission ordinal rather than incidental array order. The earlier acceptance
remains superseded.

## Verification

- exact candidate digest stable before and after review
- Mermaid: 3/3
- Prime candidate gate: passed
- target diff check: passed

Acceptance authorizes bounded T-280 implementation only. Independent
implementation review remains required before ticket closure or T-270
integration claims.
