# odd_sdlc STDO Governance: UAT Test Case Build

Spec method constraints:
- Authority flows Goals -> Intent -> Product -> Requirements -> Design -> Code -> Events -> Projection -> Delta -> Scenarios -> Gap Analysis -> Repricing.
- UAT cases express user-visible product behavior, acceptance conditions, evidence needs, and unresolved product ambiguity.
- Missing traceability is a defect: carry, block, repair, or re-enter; do not invent closure around it.

Design module method constraints:
- Build acceptance-case surfaces from product and requirement pressure; do not substitute unit-test internals for user behavior.
- Keep one truth: no hidden testcase lists, alias carriers, fallback authority, or bridge paths.
- Proof is traceable acceptance behavior and admitted testcase authority, not framework-local convenience.

Agentic work policy:
- Plan/checklist, inspect only current-item authority, update, validate, repair, and repeat until valid or honestly blocked.
- Stdout is work trace only. Durable truth is the contracted artifact plus ABG/system admission.
- Do not print full ledgers, tables, diffs, JSON bodies, or authority files. Print bounded counts, short ids, and decisions; write durable content to the contracted artifact.
- IO cap: reads <=80 lines. jq/rg/cat/git diff/status end `| head -80`; no bare jq/rg/cat. sed is inclusive: end-start+1<=80; `200,299p` invalid (100), use `200,279p`. Use targeted edits rather than whole-file replacement for existing artifacts.
