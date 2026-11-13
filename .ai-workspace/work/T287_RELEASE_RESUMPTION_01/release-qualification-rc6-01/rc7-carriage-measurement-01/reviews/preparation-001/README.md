Product Frame: unchanged fixed fifteen-feature ABIogenesis 5.0, GOAL-035/T287, STDO 3.0.4 with empty composition. This is a closed review of prepared S4 measurement controls, not Product source acceptance.

**One concrete blocker: the test compares complete terminals from different prefixes.** No other concrete blocker was established within this scope.

The preparation manifest is 2,705 bytes, SHA256 `0adc029128fe44f13d2c7f3e0b4fd22f2a47d8b4258031a827504da2e25efc2d`; all seven listed files matched. The separate pre-cut binding clarification is 1,521 bytes, SHA256 `8cbfd9eff4cbd2cbbbc910dadf423ae98e184ac405bec3f7c3a74244f5429757`. It correctly selects an isolated test archive and actual materialized bootstrap receipt without depending on release publication. Actual bindings remain null.

**S4-PREFIX-COMPARISON-001.** `measurement.test.mjs:59` reads Run1 after both Runs have appended, then compares its complete terminal with the terminal returned when Run1 originally completed. Line 68 repeats the comparison for the cold read. The existing terminal owner, `abg/project_read_ports.ts:539`, sets `projectionBasis` from the actual read prefix. Run1 originally has P1; the subsequent reads have P2. This comparison therefore fails even when all Result, contract, value and producer data agree.

The trigger is deterministic after two successful Runs. Harm is a false-negative measurement that stops before its intended cold and physical accounting checks; assertion failure remains closed. The minimum repair is confined to an immutable successor operator test:

- Compare original terminal invariant fields separately, retaining full value and producer equality.
- Explicitly require each read's `projectionBasis` to name final P2.
- Preserve complete warm/cold terminal and complete read owner-output equality at that same P2.

No Product change or qualification weakening is needed. Preparation-001 remains unchanged.

The other deciding joins are coherent as prepared. Frozen-artifact setup selects the existing native-work Program and ABI owner root, verifies and installs through existing owners, then supplies one held resource for the two measured native calls. Tasks use exact 1 MiB and 4 MiB file observations, actual populated grants and empty write roots; the scripted actor reads its selected file and returns the existing short report. The driver checks completion/close prefixes, physical log identity, actual Result/basis/transport joins, absent Result `task`/`before`, absent binding-coordinate `rawInputValue`, and unchanged after bodies referenced through their admitted basis.

Accounting separates physical row extents, per-call log growth, canonical sizes and explicit full SDK serialization. It does not allocate shared encoded body storage to invented owners. Sequential order and shared-prefix differences are disclosed; the two sizes do not establish an isolated causal slope or speedup. Parent counters and RSS exclude child-process work/peaks. Two `run_result` cold reads are selected; replay and changed-body birth retain their previous bounded evidence.

Exclusive output roots, finite selected bounds, retained original command streams, available outcomes and partial logs preserve the measurement's ordinary failure surface. The existing fixture owns disposable installation/worksite cleanup. Actual final inputs, source-to-artifact correspondence, suitability, execution cost and successful equality remain future evidence. Root owns semantic acceptance and S6 disposition.

No tests, pack, install, actor, runtime or provider execution was performed. This review created only its granted JSON and Markdown artifacts and makes no source acceptance or release qualification claim.
