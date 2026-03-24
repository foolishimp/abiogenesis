# Spec-Driven Homeostatic Methodology

**Status**: Approved
**Date**: 2026-03-24
**Derived from**: 20260324T142230_NOTE_spec-driven-homeostatic-methodology.md
**Repriced**: 2026-03-24 — Verification Layers and Renewal Path added, derived from product-owner scenario analysis (20260324T165057_PRODUCT_SCENARIOS_abg-gtl-first-10.md)

---

## Constitutional Chain

```
Intent → Requirements → ADRs → Code → Events → Projection → Delta
                                                                 ↓
                                                            Scenarios
                                                                 ↓
                                                          Gap Analysis
                                                                 ↓
                                                     Repricing / New Intent
```

- **Intent** defines purpose and direction.
- **Requirements** define invariant truths the system must satisfy.
- **ADRs** define the structural decisions that make those truths achievable.
- **Code** realizes those decisions.
- **Events** record what actually happened.
- **Projection** reconstructs current truth from the event stream.
- **Delta** reveals drift between intended truth and realized state.
- **Scenarios** test operational meaning — can the system actually do the thing the words describe?
- **Gap analysis** identifies where real use cases hit the current model and reveal insufficiency.
- **Repricing** updates requirements, ADRs, or code when the system no longer harmonizes. When gap analysis reveals constitutional insufficiency, it generates new **Intent**.

This is the homeostatic loop. Every link in the chain is load-bearing. A break at any link — an unowned requirement, an ungrounded ADR, code without a design decision — creates accidental law.

---

## Verification Layers

Each layer in the chain preserves a distinct kind of truth:

| Layer | What it preserves | What it catches |
|-------|-------------------|-----------------|
| **Requirements** | Invariant truth | "The system must do X" |
| **ADRs** | Design choice | "We chose mechanism Y to satisfy X" |
| **Scenarios** | Operational meaning | "Can I actually do Z with this system?" |

Without scenarios, important capabilities can appear "covered" because the words exist in requirements and ADRs. Scenarios force the sharper question: can the product *really* do the thing? A requirement can say "compositional graphs" and an ADR can describe Fragment types, but only a scenario asks "can I model a reusable discovery workflow and apply it twice?"

Scenarios are the product-owner layer. They are concrete, end-to-end use cases that validate the chain from intent to realized behavior. When a scenario cannot be written, the capability is not yet real. When a scenario fails, the gap is between the system's actual behavior and its claimed capability — not between the spec's words and the spec's other words.

---

## Renewal Path

Intent is not only top-down. The full homeostatic cycle includes a reverse path where real use cases generate new intent:

```
Current spec → real-world use case → gap analysis → new intent
```

This is how the system stays alive instead of becoming a frozen constitution. The generative rule:

1. A real use case (scenario, deployment, external review) hits the current model
2. Gap analysis identifies what the constitution cannot express
3. If the gap is constitutional (not just a missing implementation), a new intent is written
4. The new intent flows forward through the chain: requirements → ADRs → code

New intents emerge from repeated, real use-case pressure against the current model — not from abstract speculation. The gap must be concrete before it becomes intent. Ad hoc coding pressure does not generate intent; explicit gap analysis does.

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
- If a capability has requirements and ADRs but no scenario, its operational meaning is unverified — it may be vaporware.
- If a real use case reveals a gap not expressible in current requirements, a new intent is needed — not a code hack.

---

## Method

When a feature is introduced or changed:

1. Update **Intent** if the purpose or scope has changed.
2. Update **Requirements** so the invariant truths are explicit.
3. Update or write **ADRs** so the governing design choice is explicit.
4. Write **Scenarios** that test the operational meaning — concrete use cases the product must satisfy.
5. Only then implement **Code**.
6. Use **Events, Projection, and Delta** to verify whether reality still satisfies the requirements.

When a real use case reveals a gap:

1. Write the **Scenario** first — make the gap concrete and testable.
2. Run **Gap Analysis** — is this a missing implementation or a constitutional insufficiency?
3. If constitutional: write a new **Intent**, then flow forward (requirements → ADRs → code).
4. If implementation: write requirements/ADRs as needed, then implement.

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

Intent defines purpose. Requirements define invariant truths. ADRs define structural decisions. Scenarios verify operational meaning. Code realizes decisions. Events, projection, and delta reveal drift. Every live requirement family must have ADR ownership; every ADR must ground itself in requirements. New intent emerges from real use cases hitting the current model — through explicit gap analysis, not ad hoc pressure.
