Feature: (all)
Edge: user_guide→uat_tests
Iteration: 1
Timestamp: 2026-03-22T02:06:00Z
Decision: approved

Criteria:
- Criterion: sandbox_report.json shows all_pass: true
  Evidence: .ai-workspace/uat/sandbox_report.json reports all_pass: true, 14 tests run, 14 passed, 0 failed. Covers full lifecycle (10 tests) and self-hosting (4 tests). test_engine_evaluates_own_workspace excluded (separate self-hosting gate, circular dependency on this certification).
  Satisfied: yes

- Criterion: USER_GUIDE.md is coherent and version-current
  Evidence: docs/USER_GUIDE.md is 541 lines, version 1.0.0b1 (matches active-workflow.json version). 12 sections covering installation, first session, commands, GTL spec writing, config resolution, bootstrap, workspace, working loop, traceability, self-hosting, and limitations.
  Satisfied: yes

- Criterion: Every operator-facing feature is documented
  Evidence: USER_GUIDE.md sections map to all operator-facing features: gen-start (§4), gen-gaps (§4), gen-iterate (§4), workspace structure (§8), traceability tags (§10), spec writing (§5), config (§6), bootstrap install (§7). Current limitations documented in §12.
  Satisfied: yes
