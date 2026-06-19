# T-133 Rust Hello-World Minimum-Overhead Bootstrap

This start document is the single scenario contract for the minimum-overhead
Rust live proof lane.

The product intent is intentionally small: prove that installed odd_sdlc can
start from a bootstrap document, create one Rust build tenant, materialize an
executable Rust hello-world product, and prove it by process execution.

The generated program must emit exactly:

```text
Hello, world!
```

The fixture must not include prebuilt Rust source, a Cargo manifest, design
module files, ADRs, or output proof. Each live proof run creates a fresh
sandbox from this document, installs odd_sdlc as the builder, generates the
Rust tenant through installed traversal, and then executes the generated
program.

## Bootstrap Contract

```json scenario_contract
{
  "schemaVersion": "t133.rust_hello_world_minimal.v1",
  "scenarioId": "t133_rust_hello_world_minimal",
  "product": {
    "name": "hello_world_rust_minimal",
    "intent": "Create the smallest useful Rust product that proves odd_sdlc can build and test an executable artifact from a bootstrap document.",
    "definition": "hello_world_rust_minimal contains one build tenant, hello_world_rust. The tenant owns a Cargo manifest and Rust source file. Running the generated Rust program must write exactly `Hello, world!` to standard output. The proof is process execution evidence, not worker prose.",
    "nonGoals": [
      "multi-tenant suite",
      "multi-tenant scheduling",
      "release-depth parity",
      "ADR closure",
      "design module closure",
      "web service deployment",
      "data_mapper parity",
      "prebuilt source files in the fixture"
    ]
  },
  "builderHarness": {
    "builder": "odd_sdlc",
    "purpose": "Measure minimum installed odd_sdlc overhead for one Rust build tenant.",
    "notRuntimeDependency": true
  },
  "authorityInput": {
    "kind": "source_file",
    "path": "bootstrap.md",
    "graphFunction": "Fg_conform_project_authority"
  },
  "tenant": {
    "id": "rust",
    "tenantName": "hello_world_rust",
    "displayName": "Rust",
    "runtime": "cargo",
    "selectedOutputRoot": "build_tenants/hello_world_rust",
    "manifestFile": "build_tenants/hello_world_rust/Cargo.toml",
    "sourceFile": "build_tenants/hello_world_rust/src/main.rs",
    "run": {
      "command": "cargo",
      "args": ["run", "--quiet"],
      "cwd": "build_tenants/hello_world_rust"
    }
  },
  "expectedOutput": "Hello, world!",
  "expectedFiles": [
    "build_tenants/hello_world_rust/Cargo.toml",
    "build_tenants/hello_world_rust/src/main.rs"
  ],
  "expectedRequirementIds": [
    "REQ-T133-001",
    "REQ-T133-002",
    "REQ-T133-003",
    "REQ-T133-004",
    "REQ-T133-005"
  ],
  "requirements": [
    {
      "id": "REQ-T133-001",
      "title": "Single Rust product tenant",
      "text": "hello_world_rust_minimal contains exactly one generated Rust product tenant for this proof lane."
    },
    {
      "id": "REQ-T133-002",
      "title": "Cargo runtime tenant",
      "text": "The generated tenant is named hello_world_rust, uses Cargo as its runtime/build tool, and is rooted at build_tenants/hello_world_rust."
    },
    {
      "id": "REQ-T133-003",
      "title": "Declared Rust product files",
      "text": "Product materialization writes the declared Cargo manifest build_tenants/hello_world_rust/Cargo.toml and Rust source file build_tenants/hello_world_rust/src/main.rs without using prebuilt fixture files."
    },
    {
      "id": "REQ-T133-004",
      "title": "Exact stdout contract",
      "text": "Running the generated Rust program emits exactly Hello, world! after trimming trailing whitespace."
    },
    {
      "id": "REQ-T133-005",
      "title": "Declared Cargo execution command",
      "text": "The product proof runs cargo run --quiet from build_tenants/hello_world_rust and records process evidence for that command."
    }
  ],
  "sandbox": {
    "workspaceSlug": "t133_rust_hello_world_minimal_workspace",
    "installOddSdlc": true,
    "requiresCleanWorkspace": true,
    "expectedBootstrapPath": ".ai-workspace/context/project_bootstrap.md",
    "expectedRuntimeRoot": ".ai-workspace/runtime/odd_sdlc",
    "expectedTransformAssetRoot": ".ai-workspace/runtime/odd_sdlc/assets",
    "expectedOperatorRunRoot": ".ai-workspace/runtime/odd_sdlc/operator-runs",
    "runtimeAssetPolicy": "SDLC transform artifacts are admitted under expectedTransformAssetRoot by default. Product realization files are materialized under the tenant selectedOutputRoot only when the traversal reaches product materialization."
  },
  "lifecycleGraph": {
    "role": "odd_sdlc_minimum_overhead_builder_test_graph",
    "moduleName": "hello_world_rust_minimal_lifecycle",
    "graphFunction": "build_hello_world_rust_minimal",
    "nodes": [
      {
        "id": "asset:start_document",
        "assetType": "start_document_surface",
        "description": "This bootstrap document."
      },
      {
        "id": "asset:sandbox_workspace",
        "assetType": "sandbox_workspace_surface",
        "description": "Fresh workspace prepared from the bootstrap document."
      },
      {
        "id": "asset:installed_odd_sdlc",
        "assetType": "installed_odd_sdlc_surface",
        "description": "Installed odd_sdlc command path inside the sandbox."
      },
      {
        "id": "asset:rust_product_files",
        "assetType": "component_code_surface",
        "description": "Cargo manifest and Rust source for hello_world_rust."
      },
      {
        "id": "asset:execution_proof",
        "assetType": "test_execution_surface",
        "description": "Process execution evidence proving exact stdout."
      }
    ],
    "vectors": [
      {
        "id": "vector:setup_sandbox",
        "name": "setup_rust_hello_world_sandbox",
        "source": ["asset:start_document"],
        "target": "asset:sandbox_workspace"
      },
      {
        "id": "vector:install_odd_sdlc",
        "name": "install_odd_sdlc_runtime",
        "source": ["asset:sandbox_workspace"],
        "target": "asset:installed_odd_sdlc"
      },
      {
        "id": "vector:build_rust_product",
        "name": "build_hello_world_rust_minimal",
        "source": ["asset:start_document", "asset:installed_odd_sdlc"],
        "target": "asset:rust_product_files"
      },
      {
        "id": "vector:execute_rust_product",
        "name": "execute_hello_world_rust_minimal",
        "source": ["asset:rust_product_files"],
        "target": "asset:execution_proof"
      }
    ]
  },
  "lawfulActions": [
    {
      "id": "action:setup_sandbox",
      "vector": "vector:setup_sandbox",
      "graphFunction": "setup_rust_hello_world_sandbox",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/t133/sandbox_workspace_surface",
      "donePredicate": "sandbox workspace exists and contains this bootstrap as authority",
      "retryAction": "action:repair_sandbox_setup"
    },
    {
      "id": "action:install_odd_sdlc",
      "vector": "vector:install_odd_sdlc",
      "graphFunction": "install_odd_sdlc_runtime",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/t133/installed_odd_sdlc_surface",
      "donePredicate": "node_modules/.bin/odd-sdlc-ts exists and gaps can run",
      "retryAction": "action:repair_odd_sdlc_install"
    },
    {
      "id": "action:build_rust_product",
      "vector": "vector:build_rust_product",
      "graphFunction": "build_hello_world_rust_minimal",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/component_code_surface",
      "donePredicate": "Cargo.toml and src/main.rs exist under build_tenants/hello_world_rust",
      "retryAction": "action:repair_rust_product_files"
    },
    {
      "id": "action:execute_rust_product",
      "vector": "vector:execute_rust_product",
      "graphFunction": "execute_hello_world_rust_minimal",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/test_execution_surface",
      "donePredicate": "cargo run --quiet exits 0 and stdout is exactly Hello, world!",
      "retryAction": "action:repair_rust_execution"
    }
  ],
  "commands": {
    "installOddSdlc": [
      "odd-sdlc-ts install --target <workspace> --package-source <odd_sdlc_source>"
    ],
    "conformProjectAuthority": [
      "odd-sdlc-ts start --workspace <workspace> --target graph_function:Fg_conform_project_authority --until first_traversal --worker <worker>"
    ],
    "buildProduct": [
      "odd-sdlc-ts gaps --workspace <workspace>",
      "odd-sdlc-ts start --workspace <workspace> --target next --until first_traversal --worker <worker>"
    ],
    "testProduct": [
      "cd build_tenants/hello_world_rust && cargo run --quiet"
    ]
  }
}
```
