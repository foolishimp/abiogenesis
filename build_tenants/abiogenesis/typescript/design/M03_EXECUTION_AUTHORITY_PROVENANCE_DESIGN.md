# M03 Execution-Authority Provenance Design (T-209 abg half)

- status: proposed (design pass for T-209 Phase 3; realization follows
  ratification)
- derives_from: T-209 governance-failure addendum (user ruling
  2026-07-09), REQ-R-ABG3-HANDLERS-001..-014, REQ-R-ABG3-REQUIREMENT-
  PROOF-CARRY-THROUGH-035/-036, execution-default law (PRODUCT.md),
  evidence-provenance ruling
- created_at: 2026-07-09

## Position

The sbt forensics proved that prose boundary law without an admission
chokepoint is advisory: the odd_glc harness executed the toolchain for
two lawful-looking reasons (tests verify artifacts; worker self-report
is never truth) because the kernel had NO admission home for
worker-executed results. This design closes the vacuum from both sides.

## D1. The provenance gate (the load-bearing half)

LAW: an execution-result payload is closure-bearing ONLY when it is the
admitted typed result of a DECLARED worker turn. Framework-assembled
execution evidence is inadmissible by construction.

Mechanism (one seam, no new event kind expected):

1. Execution-bearing edges declare `executionAuthority: "worker_turn"`
   on the carry-through contract (closed vocabulary; the only other
   value is the T-206-gated `"annealed_fd_handler"`, admitted solely
   with a ratified equivalence contract ref — absent that ref the value
   is an admission error).
2. Execution-result payload sections (test execution, mutation
   campaign, data generation) are admitted ONLY from the attached
   result artifact of the F_P dispatch on that edge — the same
   accepted-artifact ingress the depth map uses. The admission binds
   the payload to the spine's dispatch truth: actorInvocationId,
   workerId, backendId, edge, vectorIndex all come from the runner's
   own scope, never from payload fields.
3. Evidence refs of the execution family (`mutation-kill://`,
   `mutant-survived://`, `test-identity://`, execution-report refs) are
   ledger-resolvable ONLY when their admitting event is such a
   worker-turn artifact admission. A ref of these families arriving by
   any other path (startup lists, template declarations, framework
   sinks) does not enter the admitted set.
4. Kernel-witnessed digests: at materialization the F_D materialization
   handler (HANDLERS-009 standard set) digests the workspace surfaces
   it materialized; the mutation-outcome payload's restore claim is
   checked against the KERNEL's digest, never the worker's. This
   realizes the escrowed restore-digest negative proof (T-210
   checklist) lawfully — mechanical, not self-report.

## D2. The conformance differential (the standing half)

A default-suite test (runs every suite, both repos; never live-gated):
the product binding and its proof harness contain no process-execution
capability outside the declared worker seam. Concretely: static scan of
the shipped binding + harness sources for child_process /
spawn/exec/execFile/fork usage; the ONLY permitted sites are (a) the
substrate's own standard handlers (kernel), (b) the harness block that
launches the SUBSTRATE CLI itself (start/iterate invocation — running
the kernel is not executing the subject). Subject-toolchain execution
(sbt, cargo, node subject tests) appearing anywhere downstream is a red
test TODAY.

## D3. The odd_glc deletion set (Phase 3/4 realization order)

Delete, not wrap: the plan executor (test-execution-plan.json
consumption + runSync/runForEvidence spawn machinery), the sbt
Test/compile post-materialization gate, framework evidence assembly for
subject execution. Replacements: execution stages declared as typed F_P
worker turns whose instructions require the worker to run the suite and
return the typed execution result (command, exit status, report
identities, counts, depth map, mutation outcomes) INSIDE the artifact
payload; the compile gate becomes worker-turn work; F_D checks the
admitted result (report existence, counts vs contract, digest
identity).

## Break order (inside-out)

1. Contract vocabulary: `executionAuthority` on the carry-through
   contract (admission + closed values), differential for the annealed
   value rejecting without an equivalence ref.
2. Provenance-scoped ledger: execution-family refs resolvable only via
   worker-turn artifact admissions (D1.3) + differential (a forged
   startup-declared kill ref does not resolve).
3. Kernel-witnessed materialization digests (D1.4) + restore-digest
   negative proof.
4. Conformance differential in both repos (D2) — expected RED against
   the current odd_glc harness; it goes green only when D3's deletion
   lands (the test IS the migration pressure).
5. odd_glc deletion + declaration adoption (D3), campaign proof rides
   Phase 4.
