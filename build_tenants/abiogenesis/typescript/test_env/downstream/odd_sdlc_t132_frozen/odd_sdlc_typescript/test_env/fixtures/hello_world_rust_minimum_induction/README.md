# Hello World Rust Minimum Induction Fixture

This fixture is the smallest Rust hello-world induction input.

It is intentionally not a full scenario-contract bootstrap. The generic
scenario harness copies this input document into a clean workspace, installs
`odd_sdlc`, and lets `Fg_conform_project` induce `INTENT.md`, `PRODUCT.md`,
`GOALS.md`, and keyed requirement-family files.

It must not contain `Cargo.toml`, `src/main.rs`, or generated Rust source.
