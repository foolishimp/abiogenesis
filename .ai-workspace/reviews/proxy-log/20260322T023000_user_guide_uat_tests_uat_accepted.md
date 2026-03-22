Feature: user_guide→uat_tests
Edge: user_guide→uat_tests
Iteration: 1
Timestamp: 2026-03-22T02:30:00Z
Decision: approved

Criteria:
- Criterion: sandbox_report.json shows all_pass: true
  Evidence: .ai-workspace/uat/sandbox_report.json exists with all_pass:true, install_success:true, 14/14 tests passed (10 full lifecycle + 4 self-hosting checks).
  Satisfied: yes

- Criterion: USER_GUIDE.md is coherent and version-current
  Evidence: docs/USER_GUIDE.md contains **Version**: 1.0.0b1 matching .gsdlc/release/active-workflow.json version. Guide covers 12 sections: what ABG is, installation, first session, three commands, writing specs, config resolution, bootstrap install, workspace structure, working loop, traceability, self-hosting spec, limitations.
  Satisfied: yes

- Criterion: Every operator-facing feature is documented
  Evidence: All 45 REQ-F-* keys present in <!-- Covers: --> tags distributed across 8 guide sections. Guide covers all three commands (gen-gaps, gen-iterate, gen-start), evaluator types (F_D, F_P, F_H), event stream mechanics, traceability tags, and bootstrap installation.
  Satisfied: yes
