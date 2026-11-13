Product Frame: unchanged fifteen ABIogenesis5 families F01-F07,F09-F11,F13-F17 / GOAL-035/T287 / F10 pre-RC7 D5. Source and Product scope are unchanged; this is a Root-selected operator budget correction under exact STDO3.0.4. ABG owns runtime admission; no Product/test/source/staging/Git/provider/runtime action occurred.

Revised lane bounds are transport120000ms, qualification300000ms and D5 lifecycle/profile300000ms. The C2 component command is900000ms. The other six command bounds, all seven termination graces, test modules, populations and predicates remain unchanged.

The declared C2 command sum is now1560000ms (previously2460000ms), leaving240000ms before the existing1800000ms helper inactivity bound. Seven5000ms termination graces leave205000ms for drain/owner allowances. This is arithmetic only; Root still performs actual owner preflight. No execution or runtime-fit result is claimed.

inputs/C2_INPUTS, C2_RECIPE and workload agree. Existing lane/proof helpers read the revised lane.timeoutMs values directly and need no code change. The staging manifest is repinned; only its C2_INPUTS row changed. Original PREPARATION_RETURN JSON/Markdown, original staging manifest and all changed-file preimages are exact under budget-draft-preimages. The original return remains historical; PREPARATION_RETURN_BUDGET_02 contains current pins.

Runtime resume and actualClosePrefix remain null. Root must supply the genuine final proof03 close and admit the controls before staging/preflight/launch. No Product failure or new review cycle is inferred from this draft correction.
