---
id: T-195
title: rc.10 full-review remediation wave toward 4.3.0
status: active
class: requirement_reprice + realization_refactor
opened: 2026-07-06
review: .ai-workspace/comments/claude/20260706T090000Z_REVIEW_gtl_abg_full_product_review_rc10.md
acceptance: all P0+P1 closed, P2 seam pass done or ticketed, fresh 4.3.0-rc.1
  release note (authored, not sed-bumped), standing gate sourceClean, and a
  CLEAN odd_glc data-mapper-full live run on the 4.3.0-rc.1 substrate.
---

# T-195: rc.10 review remediation → 4.3.0

Scope = the five-dimension review's findings, P0-1..P0-6, P1-7..P1-12,
P2 seam-consolidation pass. Work clusters, gates between:

- C1 vocabularies/digests: retry allowlist single home (P0-6);
  sha256 double-prefix (P0-5); governed enums derive (P1-11);
  admission message derives (P2).
- C2 intake integrity: replay read ENOENT-discriminating + per-line
  admission (P1-10); pre-stamped emit rejection (P1-10); supplied-digest
  verify-or-reject (P1-9); coerceRuntimeBinding structural admission (P1-12).
- C3 fail-closed defaults: fpDispatch/fdEvaluator/consequenceProjection
  defaults return blocked (P0-2); test fixtures supply explicit plugins.
- C4 truth perimeter: sink allowlist per sink_receive_only (P0-3);
  CLI append-in-finally + typed runtime-failure event + stack (P0-4,
  realizes CLI-error-as-event).
- C5 lane closure: construction/consequence lane consumes the passthrough
  authority + terminal through the choke point (P0-1).
- C6 seam pass: truncation transform, target-carrier mint, envelope
  predicate, stableJson forks, stall classification, transport ID minters,
  PublicTerminalKind, transport trio tie (P2).
- C7 paperwork-with-teeth: rc.10 note corrected; self-reference drift
  check in the real-tree witness; TEMPORAL Status header; FPC-011 citation;
  PRODUCT.md temporal scope note; successor tickets (P1-8).

Non-closure: any weakened test; any fabricated-success default surviving;
sub-runs without temporal law; release note describing another cut's delta.
