# S6 live-01 launcher readiness

`T287_S6_LIVE01_PREPARE_01` is complete. One installed launcher and cold readback are prepared against frozen subject `3bfda7ac23bd8fd7ad5274d0875c3c13bdbf6033805370665055749e04e2d8e8`, existing core `64712d9e3f480236f3a90f7c3c124eb8140ffee5ba426dafc1c7d02767008d4d`, original prepared request/handoff and installed consumer. No Run, provider, repack, installation or source/input/schema change occurred. Dispatch remains unselected.

`launcher-manifest.json` SHA-256: `f1da19fd49122aea10855763e5382121f522b7c1c7d2b029598681f90ba07f73`.
`launch-readiness.json`: `aaec9e8893a8f06528e3ae9fe62ecdba4d1ed7e221c4903957ec8196db2c6296`.
`controls.json`: `f133a225eea596102d4a7816218176219546deba39d778db7eaf664020bad48e`.

The actual provider binary was hash-checked without invoking it: `/Users/jim/.local/share/claude/versions/2.1.280`, SHA-256 `387a5c5dcdbb815085edf0baf79591f9d8894efe922bceaf3d75b1b08055229d`. The selected append arguments are exactly `--model claude-opus-5-5 --effort xhigh`, with no fallback. Runtime binding and stream-reported model remain assertions for the future live evidence.

Inherited controls were read from the frozen installed owners and current selected environment; all three timeout override variables are unset. Startup and inactivity leases are 60,000 ms, hard cap 3,600,000 ms per actor, termination grace 1,000 ms. Activity includes actual stdout/stderr, structured/tool/API progress, process lifecycle and artifacts. The CLI has no additional elapsed timeout and retains its existing 10 MiB output buffer. Fixed command timeouts remain 20,000 ms with 2,000 ms termination grace. Recursion remains twelve; context bounds remain 128 files/131,072 bytes and prompt bound 131,072 bytes. No monetary/token budget flag is added. These are explicit inherited controls, not a new deadline or a claim about actual workload duration. No insufficient or unknown selected supervision relation was found.

`launch.mjs --dispatch-once` performs one prepared Public call, conserves the original request, captures raw CLI stdout/stderr before parsing and retains the first event log even on failure. It then retains native prompts/raw artifacts, exact admitted synthesis/choice/child/fold/parent references, current effects, reported model/usage and separate native/framework timings. It does not choose work, rerun commands, repair output or retry. The expected adverse baseline observation is retained and is distinguished from an unexpected provider/runtime/contract failure. The four initially missing assets and consequential correction must be actual native effects before completion can be asserted.

`readback.mjs` reuses `constructInstalledRunReadCall` and `runInstalledCliRequest` with the returned exact `resources.run.ref/digest` and close handoff. Each `run_result`/`run_replay` executes a new installed CLI process with an empty environment. Reads do not reacquire a different source, resume work or alter the original history. Their receipts/timings are retained before correspondence assertions.

Preparation checked the provider hash, installed controls, exact handoff equality and syntax of all three scripts. Launcher and readback were not executed. Existing source/proof/archive bytes remain frozen. Await explicit Executive dispatch selection; no further action follows this preparation return.
