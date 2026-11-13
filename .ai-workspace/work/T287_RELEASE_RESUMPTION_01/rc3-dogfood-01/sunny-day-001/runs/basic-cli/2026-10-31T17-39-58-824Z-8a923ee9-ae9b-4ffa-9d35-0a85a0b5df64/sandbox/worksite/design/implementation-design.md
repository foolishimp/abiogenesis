# Implementation Design: Hello World CLI

Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC`
Stage: `implementation_design`
Authority: `specification/project-conformance.md`

## Authority

This design follows `specification/project-conformance.md`. That document
defines the source surface, the stdout contract and the execution proof. This
design defines only how they are built. It adds no Product meaning.

## Source Component

| Element | Decision |
|---|---|
| Path | `generated/hello-world.mjs` |
| Runtime | Node, run as `node generated/hello-world.mjs` |
| Module format | ES module (the `.mjs` extension selects it, so no `package.json` is needed) |
| Dependencies | none; no package installation |
| Input | none; arguments are ignored |
| Output | stdout gets exactly `"Hello, world!"` followed by one newline (`"Hello, world!\n"`) |
| Exit | status `0` by normal completion |
| Effects | one write to stdout; nothing written to stderr or the filesystem |

The script makes a single `process.stdout.write("Hello, world!\n")` call.
`process.stdout.write` emits the exact bytes. `console.log` is not used,
so the newline is spelled out in the source instead of supplied by the
logger.

## Test Source Surfaces

Both tests run the CLI and assert its stdout.

| Role | Path | Assertion |
|---|---|---|
| Component | `test/component/hello-cli.test.mjs` | spawns `process.execPath` with `["generated/hello-world.mjs"]` from the project root; asserts status `0` and stdout exactly `"Hello, world!\n"` |
| UAT | `test/uat/hello-cli.uat.test.mjs` | spawns `process.execPath` with `["generated/hello-world.mjs"]` from the project root; asserts the user-visible output is exactly `"Hello, world!\n"` |

`design/test-design.md` specifies the tests.
