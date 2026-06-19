# T-132 Hello-World Single-Tenant Bootstrap

This start document is the single scenario contract for the current
hello-world live proof lane.

The product intent is intentionally small: prove that odd_sdlc can start from a
bootstrap document, create one build tenant, materialize one executable product
file through installed traversal, and prove it by running the generated program.

The previous five-tenant suite exposed a real fan-out gap: the current
materialization action is selected for one output root at a time. Multi-tenant
fan-out is therefore a separate backlog feature. This T-132 lane is the current
single-tenant executable proof.

The generated program must emit the same exact line:

```text
Hello, world!
```

The fixture must not include prebuilt hello-world source. Each live proof run
creates a fresh sandbox from this document, installs odd_sdlc as the builder,
generates the tenant source through installed traversal, and executes it.

## Build Tenant

Build one generated tenant named `hello_world_javascript`.

The tenant root is `build_tenants/hello_world_javascript`.

Generate `build_tenants/hello_world_javascript/src/hello.js`.

Generate `build_tenants/hello_world_javascript/test/hello.test.js`.

Run `node --test test/hello.test.js` from `build_tenants/hello_world_javascript`;
the generated test must execute the product behavior and prove the exact stdout
or exported behavior `Hello, world!`.

Requirement marker: `REQ-T132-001` the generated JavaScript tenant materializes
`src/hello.js` and `test/hello.test.js`, then `node --test test/hello.test.js`
proves exact Hello World behavior. Runtime, source, test, and execution details
are facets of this one trivial product requirement, not separate implementation
obligations.
