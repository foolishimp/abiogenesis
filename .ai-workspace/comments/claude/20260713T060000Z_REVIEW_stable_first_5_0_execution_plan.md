# REVIEW: Stable-First 5.0 Execution Plan (nine phases)

**Type:** REVIEW (reviewer seat). Reviewed as the successor to T-218's plan,
against that plan's failure modes, the design-register verdicts, the standing
decision queue, and the ratified method.
**Author:** claude · 2026-07-13

## Verdict

**Approve, with six named amendments — none blocking the shape, all cheap to
absorb at Phase 0/1.** The plan is the first 5.0 sequence that is
simultaneously lawful in form and honest about discovery: it resolves the
authority conflict explicitly instead of silently (Phase 1 persists
stable-first), it makes the Consensus GTL probe the demand oracle BEFORE any
realization (Phase 2), and it embeds the anti-945b5a2 law in the execution
loop itself ("compiler gaps cause re-entry into the affected design; they do
not authorize an imperative workaround"). F_H approving this plan IS the
Ruling-A decision — that should be said out loud when it happens.

## What is structurally right (affirmations, specific)

1. **Probe-before-build (Phase 2) is the discovery law operating inside
   stable-first.** Author the real GTL graph, run the EXISTING semantic
   compiler, harvest the typed `semantic_not_realized` census — no new
   machinery, no static enumeration. The census, not a plan author, sizes
   phases 3–4.
2. **The recompile oracle (Phase 4) is the strongest gate in the plan.**
   Realize `workflow.C`, then `C.batch`, then `C.retry` as generic atoms, and
   after each, recompile the SAME Consensus graph: a specific gap must
   disappear "without feature-specific loops or plugins." If an atom needs
   consensus-specific code, it fails — the generic/specific boundary is
   machine-checked, not reviewed.
3. **The DAG's one non-obvious edge is correct:** the design probe (G) gates
   the spine repair (I), not just the algebra — because the probe's census is
   also the demand evidence for the spine items (instruction declarations,
   public F_H act/resume) that the design register surfaced.
4. **Retained claims land concretely:** Phase 7's exit names
   "executable-change witnessing" — the REQ-P-QUAL gap orphaned by T-239's
   retirement gets closed, not deferred by silence. Full operator workflow +
   spec-method compliance retained answers the T-247 claim set.
5. **The dogfood placement is honest:** "first operational dogfood/self-use
   proof belongs to 5.0.1" — no self-hosting overclaim on 5.0.0, which is the
   exact overclaim class that started this whole correction.
6. **rc.3 as predecessor evidence, not campaign substrate** — consistent with
   stable-first and with T-221's actual record.

## Amendments (A1–A6)

**A1 — Phase 1's alignment span must also disposition the open items this
plan implies but does not name:**
- **T-243**: "4.6 rc.3 remains predecessor evidence" IS Option B
  (rc.3-permanent). Rule it explicitly in T-243's record, not by plan prose.
- **B-010**: the plan declines builders-under-GLC for the 5.0 build (manual
  three-view gate instead; GLC governance arrives with the 5.0.1 dogfood).
  Coherent — but record it as an explicit B-010 deferral with the 5.0.1-era
  re-entry, not silence.
- **The standing red gates**: t193/t195 doc-drift and the lint:test-harness
  lane (10 errors). "Full relevant gates" per phase will hit them every time —
  disposition at Phase 0/1 (fix, or gate-reprice for the dev window, or
  recorded debt). Note t195 exists to forbid sed-bumps; the disposition should
  ride the T-243/T-249 naming decisions.
- **Ruling A persistence** is already in Phase 1 — good; the T-242 R4 record
  gets its stable-first supplement there.

**A2 — "No new ticket hierarchy" needs one clarifying sentence.** Read as "no
pre-built 18-leaf DAG": correct, anti-T-218. But ticket-first law stands —
phases must bind to T-244 register rows, and each §5E design boundary opens
its singular leaf as it starts. Without that sentence, phases 3–6 risk running
as un-ticketed execution — the exact violation class of both `bd59d4c` and
`945b5a2`.

**A3 — Atom-generality guard in Phase 4.** Shaping three generic atoms
against one consumer risks the inverse of the plugin failure: atoms overfit
to Consensus. Each C-term design should cite at least one non-Consensus
consumer or scenario family (fan-out family for `C.batch`, retry/correction
family from scenarios 06/07 for `C.retry`) alongside the recompile oracle.

**A4 — Phase 6's surface list defers to the T-244 register as sole
authority.** The plan's prose enumeration (operator, SDK, CLI, catalog,
node/overlay, interactive F_H, schema, vocabulary, corpus) must not become a
second list that can drift from the register Phase 1 creates. One authority;
the plan cites it.

**A5 — Mechanical enforcement, recommended (F_H's call):** a repo commit/push
gate requiring a ticket ref + accepted-design ref on product-code changes.
Both of this week's violations were momentum-through-prose-gates; §5E is still
prose. The hook is an afternoon of work and makes the per-phase "checkpoint
commit" discipline self-enforcing.

**A6 — Commit the diagram render check** (the 27/27 claim is currently
attested, not reproducible) as part of Phase 0.

## Risks carried forward (named, accepted-with-eyes-open)

- **Phase 3 is four design boundaries in one phase** (basis join,
  instruction-to-GTL, F_P G1–G5, public F_H act/resume) — the DS-2 mega-leaf
  pattern's ghost. The register + §5E already force per-boundary designs;
  A2's leaf discipline keeps it split.
- **Phases 6–7 are the bulk** (23 missing operations, 9 capabilities,
  corpus, self-conformance). The register sizes them at Phase 1; if the
  register prices Phase 6 above the stable-first envelope, that is a new F_H
  scope decision, not a silent grind.
- **Manual governance for 5.0 construction** (B-010 deferred): the gate that
  failed once now has §5E + this review discipline behind it; A5 is the
  mechanical backstop if F_H wants it.

## Boundary

Reviewer output. Approval authority is F_H's; approving the plan constitutes
the Ruling-A decision and should be persisted as such at Phase 1. The
authoritative planning inputs named by the plan (design register, T-242,
T-249) are the right three.
