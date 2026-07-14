# Self-Review - T-277 Prime Contraction Design Packet

**Timestamp**: 2026-07-14T13:43:27Z

**Ticket**: T-277

**Design**: ADR-044

**Census**: A5 Prime Contraction Census

**Verdict**: candidate ready for independent review; implementation blocked

## Reviewed Surfaces

- T-277 intake, migration boundary, checklist, and exit
- ADR-044 counting law, IACS, Promotion Test, disposition algebra, three
  views, tenant gate, and stop conditions
- all 13 census rows against live specification, design, code, generated
  contracts, active tickets, and retained-feature register
- T-268/T-270/T-272/T-274/T-275/T-276 routing amendments
- T-247/T-248 future proof-topology inputs

No runtime, public contract, generator, gate, fixture, or product code changed.

## Measured Baseline

The live-source census reproduced:

```text
required operations:              36
current operation IDs:            19
current operation definitions:    19
required capabilities:            16
current capability assets:         8
required/asset overlap:             7
missing required capabilities:      9
extra capability identity:          1 (abg.capability.fh.interact@5)
Consensus internal carrier kinds:  14
generated operation schemas:       57
linked design/guardrail documents: 23
IACS mentions:                     14
Promotion Test mentions:            2
recurrence review mentions:         0
```

The standing design gate independently reported 22 registered design files and
66 rendered diagrams. The difference from 23 is the separately linked tenant
guardrail document, not a missing registered design.

## Findings And Repairs During Self-Review

### S1 - Scenario execution was over-compressed

The first census draft treated three runs as sufficient for the three outcome
and three workspace dimensions. Requirements do not prove that diagonal
coverage alone is sufficient.

Repair: PC-008 now contracts orchestration to one driver but leaves execution
count at `3..9`. Three runs require an accepted proof of workspace invariance;
otherwise the same driver runs the full matrix.

### S2 - Shared Consensus schema asset had an unstated locator seam

One document with nine embedded schema resources creates a shared asset digest
and projection-specific identities/digests. Treating those as one digest would
break exact catalog addressability.

Repair: PC-001 now requires T-274 to distinguish shared asset digest from
embedded resource/projection digest and prove locator addressability.

### S3 - Operation contraction could become a generic dispatch rabbit hole

Forcing every typed handler through one generic table can require unchecked
casts or move semantic behavior into a mega-handler.

Repair: PC-004 permits explicit typed domain handlers to remain. One register
must still author identity and contract/CLI metadata, with exact handler-key
parity. Contraction stops before unsafe generic dispatch.

### S4 - Capability commonization could become a second engine

A capability graph is warranted because assets, catalog rows, manifest claims,
dependencies, and effect bindings otherwise repeat one roster. A generic
capability framework is not warranted.

Repair: PC-006 limits the target to one closed typed data register plus direct
deterministic projectors. Runtime admission and T-255 evaluation remain
separate existing authorities.

### S5 - T-267 must not be reopened by association

The runtime boundary is pending independent review but has no concrete Prime
finding in this census.

Repair: T-277 records T-267 as reviewed without re-entry. Only a later concrete
reachable duplicate-authority finding may reopen it.

## Proportionality Ruling

Implement after acceptance:

- PC-011 tenant gate: small and prevents repeat toil
- PC-005 schema projector: small authority-neutral recurrence
- PC-004 metadata/identity migration: bounded and high leverage before 17 more
  operations
- PC-001/002/003: prevents Consensus contract and declaration duplication
- PC-006: prevents 16 capability assets and manifest truth from diverging
- PC-008: one scenario driver, evidence multiplicity retained as required

Hold or retain:

- PC-009 remains a measured-design input until T-247 inventories the proof
  graph
- PC-010 digest helpers remain separate
- PC-012 generated schema multiplicity remains
- PC-013 design register remains
- seven C constructors and event/replay/runtime carrier identities remain

## Verification

```text
git diff --check: clean
ADR-044 Mermaid: 3/3 rendered with Mermaid CLI 11.3.0
check:ds-governance: passed, 19 tickets, 68 comment refs
check:design-mermaid: passed, 22 files, 66 diagrams
T-277 required metadata: 16/16 present
```

## Remaining Gate

An independent reviewer must verify the live evidence, identity/authorship
distinction, owner routing, Prime IACS, three views, and proportional stops.
F_H must then explicitly accept ADR-044 and the census baseline. Until both
occur, T-277 remains `census_and_adr_in_progress` and product-code
implementation is prohibited.
