# Rust Hello-World Requirements

**Status**: Active
**Derived From**: `T-160 Rust lite fixture`

## REQ-T160-RUST-001

The product shall provide one Cargo manifest at
`build_tenants/hello_world_rust/Cargo.toml`.

## REQ-T160-RUST-002

The product shall provide one Rust executable source file at
`build_tenants/hello_world_rust/src/main.rs`.

## REQ-T160-RUST-003

Running `cargo run --quiet` from `build_tenants/hello_world_rust` shall write
exactly `Hello, world!` to standard output after trimming trailing whitespace.

