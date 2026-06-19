# T-164 Rust Hello Service Bootstrap

This bootstrap document is the scenario contract. It contains enough authority
to derive intent, product definition, requirements, and the implementation
technology stack for a small Rust HTTP service.

The fixture must not include generated product source.

## Intent

Build a minimal Rust service that proves `odd_sdlc` can materialize a product
that is more than a process which prints to stdout.

The service must expose an HTTP API. A caller must be able to start the service
locally, call it with `curl`, and receive the declared response body.

The generated product itself has no runtime dependency on `odd_sdlc`, GTL, ABG,
or the scenario harness.

## Product Definition

Product name: `t164_rust_hello_service_lite`

Active tenant: `hello_world_rust_service`

Selected output root:

```text
build_tenants/hello_world_rust_service
```

The product is a single Rust binary crate that starts a local HTTP service.

The generated service must:

- provide a Cargo manifest at
  `build_tenants/hello_world_rust_service/Cargo.toml`;
- provide a Rust executable source file at
  `build_tenants/hello_world_rust_service/src/main.rs`;
- start an HTTP server bound to `127.0.0.1`;
- read the listening port from the `HELLO_SERVICE_PORT` environment variable;
- serve `GET /`;
- return exactly this response body after trimming trailing whitespace:

```text
helloworld
```

## Requirements

### REQ-T164-RUST-SVC-001 Cargo Manifest

The product shall provide one Cargo manifest at
`build_tenants/hello_world_rust_service/Cargo.toml`.

### REQ-T164-RUST-SVC-002 Rust Executable Source

The product shall provide one Rust executable source file at
`build_tenants/hello_world_rust_service/src/main.rs`.

### REQ-T164-RUST-SVC-003 Local HTTP Binding

The generated Rust executable shall start an HTTP server bound to `127.0.0.1`
using the port supplied in the `HELLO_SERVICE_PORT` environment variable.

### REQ-T164-RUST-SVC-004 Exact Root Response

The service shall respond to `GET /` with exactly `helloworld` after trimming
trailing whitespace.

### REQ-T164-RUST-SVC-005 HTTP Smoke Proof

The live proof shall verify the generated service by starting the Rust binary
through Cargo and making a local HTTP request to `GET /`.

## Technology Stack

- language: Rust
- crate type: binary
- package manager/build tool: Cargo
- preferred implementation: Rust standard library HTTP handling with
  `std::net::TcpListener`
- dependency policy: avoid external crates unless the worker records a reason
  in the generated artifact or work report
- bind address: `127.0.0.1`
- port source: `HELLO_SERVICE_PORT`
- proof client: command-line HTTP client
- test mode: local process start plus HTTP call
- build/proof byproducts: `Cargo.lock`, `target/`

## Generated File Contract

The fixture must not contain these files before traversal:

```text
build_tenants/hello_world_rust_service/Cargo.toml
build_tenants/hello_world_rust_service/src/main.rs
```

The traversal must create them as product evidence.
Cargo proof byproducts are not product evidence for this fixture.

## Proof Shape

The live sandbox test may choose the concrete local port and shell command
shape, but it must set `HELLO_SERVICE_PORT`, start the generated Rust service
through Cargo, and verify `GET /` through a local HTTP request.

## Closure Expectations

The service is closed only when:

- both generated files exist under the selected output root;
- materialization ledger evidence references both generated files;
- Cargo can start the service with the configured local port;
- a local HTTP request to `GET /` returns `helloworld`;
- the latest traversal archive records a clean overlay segment completion.
