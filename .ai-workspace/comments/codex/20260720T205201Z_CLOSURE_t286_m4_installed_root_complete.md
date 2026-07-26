# T-286 Closure - M4 Installed Root Complete

## Decision

Close T-286 and `GOAL-035 M4` over exact implementation commit
`ffba4e71456cf19168fa2bbf2981b463e018a0cf`.

## Evidence

- accepted design SHA-256: `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- exact implementation tree: `5c0b9ea7e4e93dbdaf79a7cf9527c4aafcda7aa3`
- exact candidate manifest:
  `.ai-workspace/comments/codex/20260720T204540Z_CHECKPOINT_t286_review_repaired_exact_candidate_manifest.md`
- exact review receipt:
  `.ai-workspace/comments/codex/20260720T205201Z_REVIEW_t286_review_repaired_exact_candidate_accepted.md`
- complete installed M4 suite: `25/25` pass twice before freeze and once in
  each of two independent re-reviews
- retained proof determinism: six of six proof files byte-identical across the
  two pre-freeze runs
- root governor: `root_satisfied`, `R1..R10` true, first frontier `null`, 39
  exact events, two distinct runs, no failures
- root governor digest:
  `sha256:758568bcb7580b558bd0cf129f4f381b03bfe5060d33290d0800c4c9d0b6deb8`
- package audit: zero vulnerabilities
- retired compiled-plan/controller source scan: zero matches

## Product Progress

M4 establishes one source-independent installed ABIogenesis 5.0 steel thread:

```text
packed Product
  -> clean install
  -> WorkspaceBinding
  -> exact CatalogView
  -> admitted direct invocation
  -> original GTL graph
  -> non-lowering validation
  -> Product implementation resolution
  -> direct HoG traversal
  -> ABG CCall/events/transition/closure
  -> replay twice
  -> typed abg.cli outcome
```

The root remains necessary evidence for every successor milestone. It is not a
substitute for the remaining Product scenarios or release gates.

## Hold

M5 is ready but is not opened by this closure. No M5 ticket, implementation
wave, or broader feature claim is admitted here.
