# Spec-Driven Homeostatic Methodology

**Status**: Approved
**Date**: 2026-03-24
**Derived from**: 20260324T142230_NOTE_spec-driven-homeostatic-methodology.md

---

## Constitutional Chain

```
Intent → Requirements → ADRs → Code → Events → Projection → Delta → Repricing
```

- **Intent** defines purpose and direction.
- **Requirements** define invariant truths the system must satisfy.
- **ADRs** define the structural decisions that make those truths achievable.
- **Code** realizes those decisions.
- **Events** record what actually happened.
- **Projection** reconstructs current truth from the event stream.
- **Delta** reveals drift between intended truth and realized state.
- **Repricing** updates requirements, ADRs, or code when the system no longer harmonizes.

This is the homeostatic loop. Every link in the chain is load-bearing. A break at any link — an unowned requirement, an ungrounded ADR, code without a design decision — creates accidental law.

---

## Ownership Rules

1. Every live requirement family must map to one or more owning ADRs.
2. Every ADR must ground itself in requirements via an explicit `Implements:` line.
3. Unowned requirements and ungrounded ADRs are design drift. When that happens, code becomes accidental law.

---

## Classification Rule

Every inherited or legacy requirement must be classified as one of:

| Classification | Meaning | Action |
|---------------|---------|--------|
| **Replaced by V2** | Ownership moves to an existing V2 ADR | Add Implements/Supersedes to the V2 ADR |
| **Still needed** | Remains live constitutional law | Must have an owning ADR — write or update one |
| **Orphaned** | No longer part of the intended system | Remove or explicitly supersede |

Nothing live may remain unclassified.

---

## Anti-Drift Rules

- If a requirement is active law, it must map to one or more owning ADRs.
- If an ADR has no requirement grounding, it is design without constitutional authority.
- If code behavior has no ADR owner, the design has already drifted.
- If tests validate implementation habit rather than requirement truth, they lock in drift.
- If events and projection reveal persistent delta, either code is wrong or the requirement/ADR stack is stale.

---

## Method

When a feature is introduced or changed:

1. Update **Intent** if the purpose or scope has changed.
2. Update **Requirements** so the invariant truths are explicit.
3. Update or write **ADRs** so the governing design choice is explicit.
4. Only then implement **Code**.
5. Use **Events, Projection, and Delta** to verify whether reality still satisfies the requirements.

---

## ADR Conventions

Each ADR should explicitly include:

| Field | Purpose |
|-------|---------|
| `Implements:` | REQ-F-* IDs this ADR makes true |
| `Derives from:` | INT-* or strategy document that motivated the decision |
| `Supersedes:` | Prior ADR or doctrine this replaces |
| `Degenerate case:` | When V1 behavior is intentionally retained as a special case of V2 |

Write ADRs per decision boundary, not per requirement file. The question is: "what design choice makes these ACs true?" That is the ADR boundary.

If a requirement names an operational mechanism, the ADR must name that mechanism too. If a requirement expands the event taxonomy, the EC ADR must be repriced immediately — event semantics must not drift into a second constitution.

---

## Stone Version

Intent defines purpose. Requirements define invariant truths. ADRs define the structural decisions that make those truths achievable. Code realizes those decisions. Events, projection, and delta reveal drift. Every live requirement family must have ADR ownership; every ADR must ground itself in requirements.
