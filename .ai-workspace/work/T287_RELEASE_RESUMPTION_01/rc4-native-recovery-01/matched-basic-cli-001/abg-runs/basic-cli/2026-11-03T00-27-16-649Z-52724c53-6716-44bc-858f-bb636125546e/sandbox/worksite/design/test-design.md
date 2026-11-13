# Test Design: Hello World CLI

Stage: `test_design`
Authority: `specification/project-conformance.md`,
`design/implementation-design.md`

## Contract Under Test

Running `node generated/hello-world.mjs` from the project root with no
arguments exits with status 0 and writes exactly `Hello, world!\n` to stdout.

## Common Test Mechanics

Both tests use the same real-process path:

- Framework: `node:test`, with assertions from `node:assert/strict`.
- Execution: `spawnSync` from `node:child_process`.
- Executable: `process.execPath`, the node binary running the test.
- Arguments: `["generated/hello-world.mjs"]`.
- Working directory: the project root, resolved from the test file's own
  location (two directories above the test file), so the result does not
  depend on where the test runner starts.
- Output decoding: `utf8`.
- No mocks, stubs or imports of the script. The test observes the child
  process only through its exit status and streams.

## Component Test

Path: `test/component/hello-cli.test.mjs`

Case: the CLI process honours its stdout contract.

| Assertion | Expected |
|---|---|
| spawn error | none |
| `status` | `0` |
| `stdout` | exactly `"Hello, world!\n"` |
| `stderr` | `""` |

## UAT Test

Path: `test/uat/hello-cli.uat.test.mjs`

Case: a user running the CLI sees exactly the greeting.

| Assertion | Expected |
|---|---|
| spawn error | none |
| `status` | `0` |
| `stdout` (user-visible output) | exactly `"Hello, world!\n"` |
| visible text without the final newline | `"Hello, world!"`, the asserted return value |

## Pass Criteria

- Each file contains at least one test, so a run of both files yields at
  least 2 passing tests.
- Any assertion failure fails its test. The required run has 0 failing tests.
- A stdout of `"Hello, world!"` (no newline), `"Hello, world!\n\n"`,
  `"Hello, world!\r\n"` or any other text fails both tests.
