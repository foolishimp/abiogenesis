# Test Design: Hello World CLI

## Authority

This test design validates the CLI stdout contract of
`specification/project-conformance.md` as realised by
`design/implementation-design.md`.

Contract under test: `node generated/hello-world.mjs`, run from the project
root with no arguments, exits with status `0` and writes exactly
`"Hello, world!\n"` to stdout.

## Common execution rule

Every test case executes the real CLI as a child process:

```js
spawnSync(process.execPath, ["generated/hello-world.mjs"], { cwd: projectRoot })
```

- `process.execPath` is the running `node` binary, so no `PATH` lookup and no
  package installation is involved.
- `projectRoot` is resolved from the test file's location
  (`new URL("../../", import.meta.url)`), so the result does not depend on the
  test runner's working directory.
- Modules: `node:test`, `node:assert/strict`, `node:child_process`
  (`spawnSync`) and `node:url` (`fileURLToPath`) only.
- Each case asserts that the spawn raised no error and that the exit status is
  `0` before it asserts on stdout.
- No test imports `generated/hello-world.mjs` or replaces `process.stdout`.

## Component validation: `test/component/hello-cli.test.mjs`

| Case | Spawn | Assertions |
|---|---|---|
| C1 CLI contract | stdout decoded as UTF-8 | `error` is undefined; `status === 0`; `stdout === "Hello, world!\n"` |
| C2 byte-exact stdout (depth) | stdout kept as a `Buffer` | `status === 0`; `signal === null`; stdout bytes equal `Buffer.from("Hello, world!\n", "utf8")` (14 bytes, ending in a single `0x0A`) |

## UAT validation: `test/uat/hello-cli.uat.test.mjs`

The UAT cases take the user's view: the user runs the CLI and reads what it
prints.

| Case | Spawn | Assertions |
|---|---|---|
| U1 user-visible output | stdout decoded as UTF-8 | `error` is undefined; `status === 0`; the user-visible output `stdout === "Hello, world!\n"` |
| U2 one visible greeting line (depth) | stdout decoded as UTF-8 | `status === 0`; splitting stdout on `"\n"` gives `["Hello, world!", ""]`: one line whose text is the asserted return value `"Hello, world!"`, followed by exactly one newline |

## Execution and pass criteria

`test-execution-plan.json` runs:

```text
node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs
```

from the project root. The run passes when the command exits `0`, at least 2
tests pass (the component and UAT coverage floor), 0 tests fail, and stdout
contains the zero-failure fragment `fail 0`. The plan does not pin an exact
pass count, because C2 and U2 add depth coverage above the floor. The
execution result is judged from the observed command, status and streams of
that run.
