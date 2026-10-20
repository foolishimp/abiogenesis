# Implementation Design

Authority: specification/project-conformance.md

This design derives from the project pressure and downstream lifecycle
surfaces declared in specification/project-conformance.md.

## Minimal module

src/hello.mjs is an ES module that exports a named, synchronous function
helloWorld(). Called with no arguments, it returns exactly "Hello, world!" as
its direct value. It has no imports, no default export and no output.

## Package

package.json declares exactly "private": true and "type": "module". It
declares no other field, so it adds no bin, script or other output surface.

## Separate lifecycle surfaces

- package.json
- src/hello.mjs
- design/test-design.md
- test/component/hello.test.mjs
- test/uat/hello.uat.test.mjs
- test-execution-plan.json
- execution result

The execution result has no file. It is realized only by admitted native
execution of the planned command recorded in test-execution-plan.json.
