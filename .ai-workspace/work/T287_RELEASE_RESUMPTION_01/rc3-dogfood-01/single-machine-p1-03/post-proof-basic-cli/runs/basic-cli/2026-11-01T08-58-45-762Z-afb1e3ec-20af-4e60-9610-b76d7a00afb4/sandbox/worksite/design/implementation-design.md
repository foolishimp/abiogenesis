# Implementation Design: Hello World CLI

## Authority

This design realises `specification/project-conformance.md`
(`conformance_project` stage). It defines HOW the source surface meets the
behavioural contract and execution proof declared there. It adds no
behaviour beyond that contract.

## Component: `generated/hello-world.mjs`

A minimal Node.js CLI script.

- Format: ES module (`.mjs`), loaded directly by `node`. No `package.json`,
  no dependencies, no build step and no package installation.
- Imports: none. It uses only the `process` global.
- Behaviour: one call, `process.stdout.write("Hello, world!\n")`, writes
  exactly `"Hello, world!"` followed by one newline. `process.stdout.write` is
  used instead of `console.log` so the script states the exact bytes it
  writes.
- Arguments: none are read; the script ignores any it receives.
- Exit: the script ends normally after the write, so the process exits with
  status `0`.
- Standard error: nothing is written.
- First line: `#!/usr/bin/env node`. Node ignores this line when it runs the
  file as `node generated/hello-world.mjs`.

Invocation: `node generated/hello-world.mjs` with the project root as the
working directory.

## Test source surfaces

Both test sources execute the real CLI as a child process and assert on its
standard output. Neither imports the script or stubs `process.stdout`.

| Role | Path | Assertion focus |
|---|---|---|
| Component | `test/component/hello-cli.test.mjs` | the CLI contract: exit status `0` and stdout exactly `"Hello, world!\n"` |
| UAT | `test/uat/hello-cli.uat.test.mjs` | the user-visible CLI output is exactly `"Hello, world!\n"` with exit status `0` |

Both use `node:test`, `node:assert/strict` and `spawnSync` from
`node:child_process`, spawning `process.execPath` with
`["generated/hello-world.mjs"]` and `cwd` set to the project root. The project
root is resolved from the test file's own location (`../../` from
`import.meta.url`), so the tests do not depend on the runner's working
directory. `design/test-design.md` specifies the test cases.

## Execution

`test-execution-plan.json` runs both test sources with
`node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`
from the project root.
