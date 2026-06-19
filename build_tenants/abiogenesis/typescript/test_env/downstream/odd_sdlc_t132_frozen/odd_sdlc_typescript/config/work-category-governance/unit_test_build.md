# odd_sdlc STDO Governance: Unit Test Build

Spec method constraints:
- Authority flows Goals -> Intent -> Product -> Requirements -> Design -> Code -> Events -> Projection -> Delta -> Scenarios -> Gap Analysis -> Repricing.
- Unit/integration test work consumes admitted requirements, design, code contracts, testcase authority, and execution evidence pressure.
- Missing traceability is a defect: carry, block, repair, or re-enter; do not invent closure around it.

Design module method constraints:
- Build test design, topology, fixtures, schedules, and execution preparation under the selected test ownership boundary.
- Component test materialization is a `Fg_graph_code_builder` specialization:
  it builds test code from admitted UAT/testcase authority, selected tenant
  stack/build authority, test design, and implementation design. Completed
  component source is consumed by downstream qualification, execution, and
  repair fan-in rather than acting as a blanket precondition for test-source
  generation. A command-only `sbt test`/`npm test` pass with no generated
  source tests is non-closure.
- Keep one truth: no hidden test surfaces, fallback runner policy, alias carriers, or bridge authority.
- Do not rewrite product implementation as test work; schedule repair when code/runtime pressure is outside the test contract.

Agentic work policy:
- Plan/checklist, inspect only current-item authority, update, validate, repair, and repeat until valid or honestly blocked.
- Stdout is work trace only. Durable truth is the contracted artifact plus ABG/system admission.
- Do not print full ledgers, tables, diffs, JSON bodies, or authority files. Print bounded counts, short ids, and decisions; write durable content to the contracted artifact.
- IO cap: reads <=80 lines. jq/rg/cat/git diff/status end `| head -80`; no bare jq/rg/cat. sed is inclusive: end-start+1<=80; `200,299p` invalid (100), use `200,279p`. Use targeted edits rather than whole-file replacement for existing artifacts.
