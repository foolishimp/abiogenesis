# Minimum Rust Hello World

Build one minimal Rust command-line product.

The product is named `hello_world_rust_minimum_induction`.

The selected tenant is `hello_world_rust` under
`build_tenants/hello_world_rust`.

The product has no prebuilt implementation in this fixture. `odd_sdlc` must
first induce project authority from this document, then later materialize the
Rust product files through the selected product-materialization traversal.

## Requirements

### REQ-HWRUSTMIN-001 Product Scope

The induced project authority defines one Rust hello-world product named
`hello_world_rust_minimum_induction`.

### REQ-HWRUSTMIN-002 Tenant Root

The induced product authority selects exactly one build tenant named
`hello_world_rust` rooted at `build_tenants/hello_world_rust`.

### REQ-HWRUSTMIN-003 Product Files

The later product materialization writes `build_tenants/hello_world_rust/Cargo.toml`
and `build_tenants/hello_world_rust/src/main.rs`.

### REQ-HWRUSTMIN-004 Exact Output

Running the generated product with `cargo run --quiet` from
`build_tenants/hello_world_rust` prints exactly `Hello, world!`.

### REQ-HWRUSTMIN-005 Execution Evidence

The execution proof is process evidence for the declared command, not worker
narrative.
