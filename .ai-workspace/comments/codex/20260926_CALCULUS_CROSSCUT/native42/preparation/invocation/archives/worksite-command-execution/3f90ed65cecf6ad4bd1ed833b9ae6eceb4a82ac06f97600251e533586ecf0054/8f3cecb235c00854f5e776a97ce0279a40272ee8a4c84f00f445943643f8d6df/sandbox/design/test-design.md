# Test Design

Evidence source: package.json and src/hello.mjs

package.json declares "private": true and "type": "module". src/hello.mjs
exports the named, synchronous function helloWorld(), which returns exactly
"Hello, world!".

## Component validation obligation

test/component/hello.test.mjs imports helloWorld from src/hello.mjs and
asserts by strict equality that the return value of helloWorld() is exactly
"Hello, world!".

## UAT validation obligation

test/uat/hello.uat.test.mjs validates the user-visible greeting contract
through the same exported function. The user is a JavaScript consumer that
imports helloWorld from src/hello.mjs and calls it; the greeting it receives
must be exactly "Hello, world!", asserted by strict equality.

## Constraints on both tests

Both tests use node:test and node:assert/strict. Each file declares exactly
one test through test(). Test names are prefixed 'component:' and 'uat:'.
Neither test uses skip, todo, only, describe or it. Neither test uses stdout,
a CLI or any other surface; both observe only the return value of the same
exported function.
