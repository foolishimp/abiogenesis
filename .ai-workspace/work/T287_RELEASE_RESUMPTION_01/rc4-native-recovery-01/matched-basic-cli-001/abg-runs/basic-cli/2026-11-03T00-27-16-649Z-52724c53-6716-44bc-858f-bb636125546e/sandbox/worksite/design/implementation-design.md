# Implementation Design: Hello World CLI

Stage: `implementation_design`
Authority: `specification/project-conformance.md`

## Requirements Taken From Authority

- Source surface: `generated/hello-world.mjs`.
- Behaviour: with no arguments, write exactly `Hello, world!\n` to stdout and
  exit with status 0.
- Runtime: `node`, with no package installation.

## CLI Component

| Property | Decision |
|---|---|
| Path | `generated/hello-world.mjs` |
| Module format | ES module (`.mjs`), loaded directly by `node` |
| Dependencies | none; only the Node global `process` |
| Package files | none; no `package.json` is required |
| Entry | `node generated/hello-world.mjs` from the project root |
| Arguments | none required |
| Output | one write to `process.stdout` of the literal `Hello, world!` followed by one newline (`\n`) |
| stderr | nothing written |
| Exit status | 0, by normal completion with no explicit exit call |

The script prints exactly `Hello, world!` followed by one newline. It does not
add a second newline, a carriage return, leading text or trailing whitespace.
It reads no input, environment or configuration, so its output does not
depend on the caller's working directory.

## Test Source Surfaces

Two test surfaces execute the real CLI and assert its stdout:

| Role | Path | What it checks |
|---|---|---|
| Component | `test/component/hello-cli.test.mjs` | The CLI component's process contract: exit status 0 and stdout exactly `Hello, world!\n`. |
| UAT | `test/uat/hello-cli.uat.test.mjs` | The user-visible result: running the CLI shows exactly `Hello, world!\n` and exits with status 0. |

Both tests spawn `node generated/hello-world.mjs` as a child process from the
project root. Neither test imports the script or replaces the process with a
stub. The test design stage owns the detailed test cases.
