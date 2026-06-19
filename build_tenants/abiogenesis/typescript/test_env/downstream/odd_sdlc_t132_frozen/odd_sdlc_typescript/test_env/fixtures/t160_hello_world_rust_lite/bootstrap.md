# T-160 Rust Hello-World Lite Bootstrap

This fixture is a compact conformed authority surface for testing the lite
traversal overlay against a Rust tenant. The fixture must not include generated
product source.

## Product Contract

Build one Rust tenant under `build_tenants/hello_world_rust`.

The generated program must write exactly:

```text
Hello, world!
```

The proof command is:

```bash
cd build_tenants/hello_world_rust && cargo run --quiet
```

