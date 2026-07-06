# T-200 P2 Deep Self-Review under STDO (ticketing 2nd)

Commentary, not law. Object under review: my own P0–P2f realization.
Findings ranked; §-anchors to REQ-R-ABG3-CCALL and the ratified design
module. Verification state noted per finding.

## S — SPEC_METHOD findings

**S1 (HIGH, CONFIRMED). -001 claims universality; realization is
partial with no transitional clause.** REQ-R-ABG3-CCALL-001: "every C
call emits exactly one spine. No arm, fibre, stage role, or plugin path
is exempt." Reality at HEAD: evaluation-rule batch arms
(engine_runner.ts ~:5492/:7315), the fh_admit path, the F_D mechanical
transform, and the retry-branch consequence bridge open-side emit NO
spine. Active law states more than realization delivers — the exact
class the -038 transitional-state pattern exists to prevent, and I
authored that pattern's praise into the review myself. FIX: amend CCALL
with a typed strangler-transition clause enumerating enclosed arms
(transform.F_P, evaluate.F_P/F_D, consequence scalar+batch,
sub_traversal) and naming the pending set with its retirement point
(P3/P5). One paragraph; restores honest law.

**S2 (HIGH, CONFIRMED by construction).** `mintCCallRef` is
NON-INJECTIVE: fields joined with ":" while basisId/graphCallId/frameId
contain ":". Confirmed collision:
`{basisId:"x:y", graphCallId:"g"}` ≡ `{basisId:"x", graphCallId:"y:g"}`
→ identical ref. -004 says "shall not collide"; the t200 collision
differential varies values but not adversarial splits. FIX: mint as
`c-call:` + stableSha256Digest of the field tuple (identity fields
remain readable on c_call_opened itself), or length-prefixed join;
add the adversarial-split differential. Digest form also shortens refs.

**S3 (HIGH, CONFIRMED). sub_traversal locus lies.**
`finishConsequenceTraversalActionConsumption` hardcodes
`vectorIndex: 0` (the real vector is not threaded into finish()) and
uses `attempt: iterationCount + 1` (semantics abuse: iteration is not
attempt). A locus-only spine whose locus is false is worse than no
spine. FIX: thread vectorIndex through the consumption context (it
exists at every call site); attempt = 1 with iterationCount as an
evidence ref, not an identity field.

**S4 (MEDIUM, CONFIRMED). Closed-key-set enforced only on
c_call_opened.** The other four spine kinds
(fibre_selected/evidenced/result_admitted/judged) admit unknown riders
(event_admission.ts:1167 uses plain applyFieldRules). -002's substance
(no fibre/interior data smuggled on the spine) applies to the whole
spine. FIX: closed key sets on all five kinds.

**S5 (MEDIUM).** Standing gates still bind fp_dispatch_requested on NEW
runs while -010 names the selection row as antecedent. Planned as P3 —
but the transitional window is named only in the ticket, not in the
REQ/amendment. Fold into the S1 transitional clause.

## D — DESIGN_MODULE findings

**D1 (HIGH, CONFIRMED). Realization contradicts ratified §8.** Design
§8 (monad review, ratified): "P2's strangler target is therefore NOT
spine-wrapping the six old sites in place — it is the edge pipeline
itself (resolveCCall + the Kleisli router), with the old state-machine
branches delegating edge-by-edge into it." My P2c–f is precisely
site-wrapping via factories; resolveCCall (P2b) is exercised only by
its unit lane — zero engine call sites. The wrapping produced real,
verified spine truth (checkpoint evidence stands), but under DMM this
is realization diverging from ratified design without a design
amendment. USER DECISION REQUIRED at this checkpoint:
  (a) amend §8 to a two-step strangler — step 1 spine visibility by
      site-wrapping (done, evidence in hand), step 2 delegation through
      resolveCCall before P5 erase (the wrapping code becomes the
      delegation's test oracle); or
  (b) rework now: replace the brackets with resolveCCall delegation.
My recommendation: (a) — the wrapped sites are exactly the parity
oracle the delegation step needs; reworking now discards a working
oracle before its replacement exists.

**D2 (MEDIUM, CONFIRMED). The P2 enclosure NEGATIVE control is not
realized.** Design §5 P2: "free-floating fibre event → drift
diagnostic." No standing witness enforces enclosure; my checkpoint
forensics script checked it once, out-of-suite. FIX: enclosure check as
a conformance diagnostic over replay (gtl_program_conformance home) +
a red-path differential in t200.

**D3 (LOW/MEDIUM).** §3B evaluator table rows now partially stale
(collision evaluator says "collision differential ✓" — S2 shows the
differential insufficient). Refresh the table at the same commit as
the S2 fix.

## O — ODD_METHOD findings

**O1 (MEDIUM). Programs are not yet GTL-published.** §15 ratified
programs as GTL objects; P2a delivered a TS carrier + admission with a
`gtl://abg/hog/*` ref STRING, but no catalog/publication surface exists
(nothing admits or resolves that ref through GTL machinery). Lawful as
staged work, but the sovereignty decision's realization is thinner than
the ticket's 2a wording implies. Name it in the ticket plan explicitly:
"GTL catalog publication" as its own P2g/P3 line.

**O2 (LOW).** Spine events have inert projection cases only — no
cost/coverage projection yet (P6 audit will need one; fine as staged,
noting the -012 gate automation depends on it).

## T — TICKET findings (2nd priority)

**T1 (LOW).** Frontmatter progress line lags P2d–f (says P1 complete +
plan; the checkpoint block carries the real state). Update once with
the checkpoint verdict.
**T2 (LOW).** T-198 absorption: confirm the backlog file was removed or
marked superseded.
**T3 (LOW).** Deferred families (evaluation-rule batch, F_D transform,
fh_admit) are in the checkpoint block but not in the plan's P3 line
items; move them into P3 scope explicitly.

## Verdict

The spine's truth value is real and the checkpoint evidence stands, but
the realization is currently AHEAD of its law in one direction (S1:
law overclaims) and BEHIND its design in another (D1: pipeline
delegation unrealized) — plus one genuine correctness defect (S2
injectivity) and one truth defect (S3 false locus). None threaten the
architecture; all four highs are cheap to fix; D1 needs the user's
checkpoint ruling. Recommended order: S2+S3 (correctness/truth, code),
S1+S5 (one REQ amendment), S4 (admission), D2 (witness), D1 per user
ruling, then P3 proceeds on honest ground.
