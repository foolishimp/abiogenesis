# Test Design: Hello World CLI

Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC`
Stage: `test_design`
Authority: `specification/project-conformance.md`, `design/implementation-design.md`

## Contract Under Test

When run with no arguments, `node generated/hello-world.mjs` writes exactly
`"Hello, world!\n"` to stdout and exits with status `0`.

## Shared Invocation

Both tests spawn the real CLI. Neither imports the script or stubs its output.

- runner: `node:test`
- assertions: `node:assert/strict`
- process: `spawnSync` from `node:child_process`
- executable: `process.execPath` (the running node binary)
- arguments: `["generated/hello-world.mjs"]`
- cwd: the project root, resolved from the test file's own location, so the
  relative script path does not depend on the caller's cwd
- encoding: `utf8`

## Component Test

File: `test/component/hello-cli.test.mjs`

| Test | Assertions |
|---|---|
| CLI exits 0 and writes exactly the greeting | `spawnSync` error is undefined; `signal` is `null`; `status === 0`; `stdout === "Hello, world!\n"`; `stderr === ""` |

## UAT Test

File: `test/uat/hello-cli.uat.test.mjs`

| Test | Assertions |
|---|---|
| user running the CLI sees exactly `Hello, world!` and one newline | `status === 0`; user-visible stdout `=== "Hello, world!\n"`; output is one line whose text is `Hello, world!`; nothing on stderr |

## Pass Criteria

The test run is
`node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`
from the project root. It passes only when it exits with status `0`, passes
at least 2 tests and fails none (`fail 0`).
