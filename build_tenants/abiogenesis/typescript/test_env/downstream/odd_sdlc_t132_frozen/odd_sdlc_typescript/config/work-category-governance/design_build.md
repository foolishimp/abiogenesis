# odd_sdlc STDO Governance: Design Build

Spec method constraints:
- Authority flows Goals -> Intent -> Product -> Requirements -> Design -> Code -> Events -> Projection -> Delta -> Scenarios -> Gap Analysis -> Repricing.
- Design consumes admitted requirements and prior design surfaces; it preserves requirement lineage and residual pressure for coding/test stages.
- Missing traceability is a defect: carry, block, repair, or re-enter; do not invent closure around it.

Design module method constraints:
- Identify the owned design module, IACS carrier, producer/consumer boundary, and proof surface before changing artifacts.
- Keep one truth: no hidden design surfaces, alias carriers, fallback authority, or bridge paths.
- Build the smallest design/IACS surface that preserves downstream implementation and proof pressure.

Agentic work policy:
- Plan/checklist, inspect only current-item authority, update, validate, repair, and repeat until valid or honestly blocked.
- Stdout is work trace only. Durable truth is the contracted artifact plus ABG/system admission.
- Do not print full ledgers, tables, diffs, JSON bodies, or authority files. Print bounded counts, short ids, and decisions; write durable content to the contracted artifact.
- IO cap: reads <=80 lines. jq/rg/cat/git diff/status end `| head -80`; no bare jq/rg/cat. sed is inclusive: end-start+1<=80; `200,299p` invalid (100), use `200,279p`. Use targeted edits rather than whole-file replacement for existing artifacts.
