# T-131 Guided odd_chat Bootstrap

This start document is the single scenario contract for the guided odd_chat live
build lane.

The product intent is to make `odd_chat` a governed CLI for people who should
not receive an unconstrained Claude/Codex shell. `odd_chat` gives them the
benefit of AI-assisted graph-function construction while keeping them inside a
loaded ODD/GTL/ABG domain, a lawful action menu, typed evidence, and human
evaluator/intent choices.

The fixture intentionally keeps the default domain small while preserving the
full lifecycle: bootstrap, sandbox setup, install odd_sdlc as builder, build
odd_chat, locally install odd_chat, test odd_chat against the default domain,
and project release readiness.
The fixture must not include prebuilt odd_chat implementation source. Each live
proof run starts from this document, creates a fresh sandbox, installs
odd_sdlc, and builds the odd_chat target files as test evidence.

## Operating Model

T-131 has two separate products in play.

1. `odd_sdlc` is the builder under test. It starts from this bootstrap document
   and builds the odd_chat CLI into the sandbox.
2. `odd_chat` is the product being built. Once built, it can create/open an
   operator workspace, load deployed ODD/GTL/ABG domains into that workspace,
   and present their lawful graph-function surface to a human operator.

odd_chat is not an odd_sdlc wrapper and odd_sdlc is not odd_chat's runtime graph
loader. odd_chat's capability is creating an operator workspace, loading a
deployed ODD/GTL/ABG domain into that workspace, and then letting the human
choose which lawful graph function to invoke. The default domain for the first
proof is `document_to_requirements`: a graph that turns a start document into a
typed requirements set.

```text
observer
  -> workspace create/open dialogue
  -> deployed domain selection
  -> evaluator projection
  -> graph-function choice
  -> human intent choice
  -> selected domain graph function
  -> edge-local asset build
  -> F_D admission and evidence
  -> next observer projection
```

The AI worker may construct only the selected edge-local asset. It must not plan
the full lifecycle, invent new graph actions, skip the human evaluator choice,
or decide release closure.

## Bootstrap Contract

```json scenario_contract
{
  "schemaVersion": "t131.guided_odd_chat.bootstrap.v1",
  "scenarioId": "t131_guided_odd_chat_live_build",
  "product": {
    "name": "odd_chat",
    "intent": "Create a governed graph-guided CLI that can be given to non-technical users instead of an unconstrained Claude/Codex CLI. odd_chat can create or open an operator workspace, load a deployed ODD/GTL/ABG domain into that workspace, show available graph functions and lawful actions, let the human choose intent, invoke only the selected domain graph function, and return admitted evidence and next actions.",
    "definition": "odd_chat is a local TypeScript Node CLI over operator workspaces and deployed ODD/GTL/ABG domains. It provides a workspace creation/opening dialogue, a separate deployed-domain and graph-function selection dialogue, and an on-rails action surface over the selected graph function. It renders the domain graph, current node, lawful action menu, selected source assets, target asset contract, graph-function invocation boundary, validation result, and next projected actions. It records human evaluator/intent selections as typed evidence before invoking work. It never exposes arbitrary shell authority, unrestricted agent chat, UI-local traversal decisions, or an odd_sdlc-specific runtime dependency.",
    "audience": "non-technical operator who needs a governed on-rails build console rather than direct access to an agentic coding CLI",
    "nonGoals": [
      "unconstrained full-chat SDLC planning",
      "arbitrary shell access",
      "UI-local graph mutation",
      "UI-local action selection law",
      "odd_sdlc-specific runtime graph loading",
      "implicit workspace creation",
      "implicit graph-function selection",
      "data_mapper parity",
      "cloud deployment",
      "autonomous release closure without human evaluator choice"
    ]
  },
  "graphRepository": {
    "name": "document_to_requirements_default_domain",
    "loadMode": "deployed_odd_gtl_abg_domain",
    "bootstrapPath": "domains/document_to_requirements/domain.json",
    "authority": "GTL graph and graph-function declarations are loaded from a deployed ODD/GTL/ABG domain. odd_chat renders the domain projection and does not own traversal law.",
    "contains": [
      "domain graph nodes and vectors",
      "lawful action declarations",
      "graph-function bindings",
      "expected asset contracts",
      "typed evidence requirements"
    ]
  },
  "builderHarness": {
    "builder": "odd_sdlc",
    "purpose": "Build odd_chat from this bootstrap document as the T-131 live proof.",
    "notRuntimeDependency": true
  },
  "authorityInput": {
    "kind": "source_file",
    "path": "bootstrap.md",
    "graphFunction": "Fg_conform_project_authority"
  },
  "workspaceDialogue": {
    "purpose": "Create or open an odd_chat operator workspace before operating over a domain.",
    "commands": [
      {
        "name": "workspace create",
        "description": "Create a workspace directory, workspace manifest, evidence ledger, and selected domain mount point from human-supplied name/root/domain inputs.",
        "requiredInputs": ["workspaceName", "workspaceRoot", "domainPath"],
        "writes": [
          ".odd-chat/workspace.json",
          ".odd-chat/evidence-ledger.jsonl",
          ".odd-chat/domain-ref.json"
        ]
      },
      {
        "name": "workspace open",
        "description": "Open an existing workspace manifest and restore its selected domain, current asset state, and evidence ledger.",
        "requiredInputs": ["workspaceRoot"],
        "reads": [
          ".odd-chat/workspace.json",
          ".odd-chat/evidence-ledger.jsonl",
          ".odd-chat/domain-ref.json"
        ]
      }
    ],
    "nonClosureRule": "odd_chat must not invoke a graph function unless a workspace manifest is present and selected by the human."
  },
  "graphFunctionSelection": {
    "purpose": "Choose which lawful graph function from the loaded ODD/GTL/ABG domain to operate before selecting an action.",
    "commands": [
      {
        "name": "graph-functions",
        "description": "List deployed domain graph functions with source asset refs, target asset refs, required carriers, and current availability."
      },
      {
        "name": "select-graph-function",
        "description": "Record the human-selected graph function for the active workspace before showing its lawful actions.",
        "requiredInputs": ["workspaceRoot", "graphFunction"]
      }
    ],
    "defaultGraphFunction": "document_to_requirements",
    "nonClosureRule": "odd_chat must not collapse workspace creation, domain loading, graph-function selection, and action selection into one hidden step."
  },
  "defaultDomain": {
    "name": "document_to_requirements",
    "kind": "odd_gtl_abg_domain",
    "purpose": "Turn a supplied start document into a typed requirements set through a guided lawful-action flow.",
    "entryAsset": "asset:input_document",
    "terminalAsset": "asset:requirements_set",
    "nodes": [
      {
        "id": "asset:input_document",
        "assetType": "document_surface",
        "description": "User-supplied source document."
      },
      {
        "id": "asset:document_observation",
        "assetType": "document_observation_surface",
        "description": "Observed claims, actors, constraints, and ambiguity from the source document."
      },
      {
        "id": "asset:requirement_candidates",
        "assetType": "requirement_candidate_surface",
        "description": "Candidate requirements derived from observed document claims."
      },
      {
        "id": "asset:requirements_set",
        "assetType": "requirements_surface",
        "description": "Accepted typed requirements set."
      }
    ],
    "vectors": [
      {
        "id": "domain_vector:observe_document",
        "name": "observe_document",
        "source": ["asset:input_document"],
        "target": "asset:document_observation"
      },
      {
        "id": "domain_vector:derive_requirement_candidates",
        "name": "derive_requirement_candidates",
        "source": ["asset:document_observation"],
        "target": "asset:requirement_candidates"
      },
      {
        "id": "domain_vector:accept_requirements",
        "name": "accept_requirements",
        "source": ["asset:requirement_candidates"],
        "target": "asset:requirements_set"
      }
    ],
    "lawfulActions": [
      {
        "id": "domain_action:observe_document",
        "vector": "domain_vector:observe_document",
        "graphFunction": "observe_document",
        "humanDecision": "continue",
        "expectedCarrier": "schema://odd_chat/document_observation_surface",
        "donePredicate": "document observations name claims, ambiguities, constraints, and missing context",
        "retryAction": "domain_action:repair_document_observation"
      },
      {
        "id": "domain_action:derive_requirement_candidates",
        "vector": "domain_vector:derive_requirement_candidates",
        "graphFunction": "derive_requirement_candidates",
        "humanDecision": "continue",
        "expectedCarrier": "schema://odd_chat/requirement_candidate_surface",
        "donePredicate": "candidate requirements trace to document observations",
        "retryAction": "domain_action:repair_requirement_candidates"
      },
      {
        "id": "domain_action:accept_requirements",
        "vector": "domain_vector:accept_requirements",
        "graphFunction": "accept_requirements",
        "humanDecision": "review",
        "expectedCarrier": "schema://odd_chat/requirements_surface",
        "donePredicate": "accepted requirements are typed, traceable, and reviewable",
        "retryAction": "domain_action:repair_requirements"
      }
    ]
  },
  "buildTenant": {
    "name": "typescript-node-cli",
    "language": "TypeScript",
    "runtime": "Node.js",
    "packageManager": "npm",
    "sourceRoot": "build_tenants/typescript",
    "cliEntrypoint": "src/cli.ts",
    "testEntrypoint": "test/odd_chat.test.ts",
    "deployTarget": "local-npm-bin"
  },
  "sandbox": {
    "workspaceSlug": "t131_guided_odd_chat_workspace",
    "installOddSdlc": true,
    "requiresCleanWorkspace": true,
    "expectedBootstrapPath": ".ai-workspace/context/project_bootstrap.md",
    "expectedRuntimeRoot": ".ai-workspace/runtime/odd_sdlc"
  },
  "acceptanceCriteria": [
    "The sandbox workspace is created from this start document.",
    "odd_sdlc is installed into the sandbox workspace.",
    "odd_sdlc builds odd_chat from this start document as the test product.",
    "odd_chat exposes a workspace create/open dialogue before operating over any domain.",
    "odd_chat records a workspace manifest and evidence ledger before graph-function invocation.",
    "odd_chat loads the default document_to_requirements ODD/GTL/ABG domain.",
    "odd_chat exposes graph-function selection separately from workspace creation and action selection.",
    "odd_chat renders the loaded domain projection rather than carrying UI-local graph law.",
    "odd_chat product intent, product definition, requirements, design, implementation, local CLI deployment, and test assets are built through lawful graph-function actions.",
    "Every action is selected by a human evaluator/intent row before the graph function is invoked.",
    "The AI worker receives only the selected edge-local asset task.",
    "Non-technical operators can choose from lawful actions without receiving arbitrary shell or full-agent chat authority.",
    "F_D validates emitted carriers and execution evidence.",
    "The local odd_chat CLI can inspect a domain and list lawful actions.",
    "The test suite passes and admitted test evidence is recorded.",
    "Release-readiness projection is based on admitted build/deploy/test evidence, not worker narrative."
  ],
  "requirements": [
    {
      "id": "REQ-OCHAT-001",
      "title": "Load deployed ODD domains",
      "text": "odd_chat loads a deployed ODD/GTL/ABG domain package and shows the current domain node, source asset refs, target asset ref, and expected carrier."
    },
    {
      "id": "REQ-OCHAT-002",
      "title": "Render lawful actions",
      "text": "odd_chat renders only lawful actions projected for the current node by the loaded domain truth."
    },
    {
      "id": "REQ-OCHAT-003",
      "title": "Record human intent",
      "text": "odd_chat records the human evaluator choice before any graph function is invoked."
    },
    {
      "id": "REQ-OCHAT-004",
      "title": "Invoke one graph function",
      "text": "odd_chat invokes exactly one selected domain graph function for one target asset at a time."
    },
    {
      "id": "REQ-OCHAT-005",
      "title": "Admit asset evidence",
      "text": "odd_chat displays F_D validation status and admitted asset refs after each build step."
    },
    {
      "id": "REQ-OCHAT-006",
      "title": "Deploy and test CLI",
      "text": "The generated CLI can be installed, built, run against the default document_to_requirements domain, and tested."
    },
    {
      "id": "REQ-OCHAT-007",
      "title": "Protect non-technical operators",
      "text": "odd_chat gives non-technical users a bounded action-menu interface and does not expose arbitrary shell authority or unrestricted agent chat."
    },
    {
      "id": "REQ-OCHAT-008",
      "title": "Create and open workspaces",
      "text": "odd_chat provides a dialogue to create a new operator workspace or open an existing workspace, and it records workspace manifest, selected domain ref, and evidence ledger before invoking graph work."
    },
    {
      "id": "REQ-OCHAT-009",
      "title": "Select graph function separately",
      "text": "odd_chat lists graph functions from the loaded domain and records the selected graph function separately from workspace creation and action selection."
    }
  ],
  "gtlGraph": {
    "role": "odd_sdlc_builder_test_graph",
    "moduleName": "guided_odd_chat_lifecycle",
    "graphFunction": "build_guided_odd_chat_lifecycle",
    "nodes": [
      {
        "id": "asset:start_document",
        "assetType": "start_document_surface",
        "description": "This bootstrap document."
      },
      {
        "id": "asset:sandbox_workspace",
        "assetType": "sandbox_workspace_surface",
        "description": "Isolated workspace prepared for odd_chat construction."
      },
      {
        "id": "asset:installed_odd_sdlc",
        "assetType": "installed_odd_sdlc_surface",
        "description": "odd_sdlc installed into the sandbox workspace."
      },
      {
        "id": "asset:intent",
        "assetType": "intent_surface",
        "description": "Product intent for odd_chat."
      },
      {
        "id": "asset:product",
        "assetType": "product_definition_surface",
        "description": "Product definition and boundaries."
      },
      {
        "id": "asset:requirements",
        "assetType": "requirements_surface",
        "description": "Small requirement set for odd_chat."
      },
      {
        "id": "asset:design",
        "assetType": "design_surface",
        "description": "CLI, domain loader, evaluator, and evidence design."
      },
      {
        "id": "asset:implementation",
        "assetType": "implementation_surface",
        "description": "TypeScript Node CLI files."
      },
      {
        "id": "asset:test_design",
        "assetType": "test_design_surface",
        "description": "Unit and integration test plan."
      },
      {
        "id": "asset:sandbox_install",
        "assetType": "sandbox_install_surface",
        "description": "npm install/build evidence."
      },
      {
        "id": "asset:deployment",
        "assetType": "deployment_surface",
        "description": "Local CLI install evidence."
      },
      {
        "id": "asset:test_execution",
        "assetType": "test_execution_surface",
        "description": "Admitted CLI and domain-load test evidence."
      },
      {
        "id": "asset:release_readiness",
        "assetType": "release_readiness_surface",
        "description": "Projection over admitted lifecycle evidence."
      }
    ],
    "vectors": [
      {
        "id": "vector:setup_sandbox",
        "name": "setup_sandbox_workspace",
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
        "id": "vector:derive_intent",
        "name": "derive_odd_chat_intent",
        "source": ["asset:start_document", "asset:installed_odd_sdlc"],
        "target": "asset:intent"
      },
      {
        "id": "vector:derive_product",
        "name": "derive_odd_chat_product_definition",
        "source": ["asset:intent"],
        "target": "asset:product"
      },
      {
        "id": "vector:derive_requirements",
        "name": "derive_odd_chat_requirements",
        "source": ["asset:product"],
        "target": "asset:requirements"
      },
      {
        "id": "vector:derive_design",
        "name": "derive_odd_chat_design",
        "source": ["asset:requirements"],
        "target": "asset:design"
      },
      {
        "id": "vector:build_implementation",
        "name": "build_odd_chat_cli",
        "source": ["asset:design"],
        "target": "asset:implementation"
      },
      {
        "id": "vector:derive_tests",
        "name": "derive_odd_chat_tests",
        "source": ["asset:requirements", "asset:implementation"],
        "target": "asset:test_design"
      },
      {
        "id": "vector:sandbox_install",
        "name": "install_and_build_odd_chat",
        "source": ["asset:implementation", "asset:test_design"],
        "target": "asset:sandbox_install"
      },
      {
        "id": "vector:deploy_cli",
        "name": "deploy_odd_chat_local_cli",
        "source": ["asset:sandbox_install"],
        "target": "asset:deployment"
      },
      {
        "id": "vector:execute_tests",
        "name": "test_odd_chat_cli",
        "source": ["asset:deployment", "asset:test_design"],
        "target": "asset:test_execution"
      },
      {
        "id": "vector:project_release",
        "name": "project_odd_chat_release_readiness",
        "source": ["asset:test_execution"],
        "target": "asset:release_readiness"
      }
    ]
  },
  "lawfulActions": [
    {
      "id": "action:setup_sandbox",
      "vector": "vector:setup_sandbox",
      "graphFunction": "setup_sandbox_workspace",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/t131/sandbox_workspace_surface",
      "donePredicate": "sandbox workspace exists and contains this bootstrap as authority",
      "retryAction": "action:repair_sandbox_setup"
    },
    {
      "id": "action:install_odd_sdlc",
      "vector": "vector:install_odd_sdlc",
      "graphFunction": "install_odd_sdlc_runtime",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/t131/installed_odd_sdlc_surface",
      "donePredicate": "node_modules/.bin/odd-sdlc-ts exists and gaps can run",
      "retryAction": "action:repair_odd_sdlc_install"
    },
    {
      "id": "action:derive_intent",
      "vector": "vector:derive_intent",
      "graphFunction": "derive_odd_chat_intent",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/intent_surface",
      "donePredicate": "intent names graph-guided operator workbench",
      "retryAction": "action:repair_intent"
    },
    {
      "id": "action:derive_product",
      "vector": "vector:derive_product",
      "graphFunction": "derive_odd_chat_product_definition",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/product_definition_surface",
      "donePredicate": "product definition names CLI, domain loader, evaluator, and evidence boundaries",
      "retryAction": "action:repair_product_definition"
    },
    {
      "id": "action:derive_requirements",
      "vector": "vector:derive_requirements",
      "graphFunction": "derive_odd_chat_requirements",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/requirements_surface",
      "donePredicate": "all REQ-OCHAT rows are represented",
      "retryAction": "action:repair_requirements"
    },
    {
      "id": "action:derive_design",
      "vector": "vector:derive_design",
      "graphFunction": "derive_odd_chat_design",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/design_surface",
      "donePredicate": "design declares CLI commands, domain loading, action ledger, and validation display",
      "retryAction": "action:repair_design"
    },
    {
      "id": "action:build_implementation",
      "vector": "vector:build_implementation",
      "graphFunction": "build_odd_chat_cli",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/implementation_surface",
      "donePredicate": "TypeScript CLI files and package scripts exist",
      "retryAction": "action:repair_implementation"
    },
    {
      "id": "action:derive_tests",
      "vector": "vector:derive_tests",
      "graphFunction": "derive_odd_chat_tests",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/test_design_surface",
      "donePredicate": "tests cover domain load, lawful actions, human intent record, and one asset build flow",
      "retryAction": "action:repair_tests"
    },
    {
      "id": "action:sandbox_install",
      "vector": "vector:sandbox_install",
      "graphFunction": "install_and_build_odd_chat",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/sandbox_install_surface",
      "donePredicate": "npm install and npm run build pass",
      "retryAction": "action:repair_install_or_build"
    },
    {
      "id": "action:deploy_cli",
      "vector": "vector:deploy_cli",
      "graphFunction": "deploy_odd_chat_local_cli",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/deployment_surface",
      "donePredicate": "local odd-chat command is available and can load the default domain",
      "retryAction": "action:repair_deploy"
    },
    {
      "id": "action:execute_tests",
      "vector": "vector:execute_tests",
      "graphFunction": "test_odd_chat_cli",
      "humanDecision": "continue",
      "expectedCarrier": "schema://odd_sdlc/test_execution_surface",
      "donePredicate": "npm test and domain-action CLI smoke check pass with admitted evidence",
      "retryAction": "action:repair_tests_or_cli"
    },
    {
      "id": "action:project_release",
      "vector": "vector:project_release",
      "graphFunction": "project_odd_chat_release_readiness",
      "humanDecision": "review",
      "expectedCarrier": "schema://odd_sdlc/release_readiness_surface",
      "donePredicate": "release readiness is projected from admitted lifecycle evidence",
      "retryAction": "action:reprice_or_repair_release_gap"
    }
  ],
  "expectedFiles": [
    "README.md",
    "specification/INTENT.md",
    "specification/PRODUCT.md",
    "specification/requirements/01-odd-chat-guided-workbench.md",
    "build_tenants/typescript/package.json",
    "build_tenants/typescript/tsconfig.json",
    "build_tenants/typescript/src/cli.ts",
    "build_tenants/typescript/src/commands/domain.ts",
    "build_tenants/typescript/src/commands/evidence.ts",
    "build_tenants/typescript/src/commands/graphFunctions.ts",
    "build_tenants/typescript/src/commands/intent.ts",
    "build_tenants/typescript/src/commands/invoke.ts",
    "build_tenants/typescript/src/commands/workspace.ts",
    "build_tenants/typescript/src/app/carrierValidation.ts",
    "build_tenants/typescript/src/app/domainProjection.ts",
    "build_tenants/typescript/src/app/evidenceLedger.ts",
    "build_tenants/typescript/src/app/invocationService.ts",
    "build_tenants/typescript/src/app/workspaceStore.ts",
    "build_tenants/typescript/src/domain/defaultDomainAdapter.ts",
    "build_tenants/typescript/src/domain/domainAdapter.ts",
    "build_tenants/typescript/src/render.ts",
    "build_tenants/typescript/src/types.ts",
    "build_tenants/typescript/test/odd_chat.test.ts"
  ],
  "commands": {
    "sandboxSetup": [
      "mkdir -p build_tenants/typescript/src/app build_tenants/typescript/src/commands build_tenants/typescript/src/domain build_tenants/typescript/test domains/document_to_requirements examples"
    ],
    "installOddSdlc": [
      "npm install",
      "node_modules/.bin/odd-sdlc-ts gaps --workspace ."
    ],
    "conformProjectAuthority": [
      "node_modules/.bin/odd-sdlc-ts start --workspace . --target graph_function:Fg_conform_project_authority --until first_traversal"
    ],
    "materializeProduct": [
      "node_modules/.bin/odd-sdlc-ts start --workspace . --target asset:component_code_surface --until first_traversal"
    ],
    "buildOddChat": [
      "cd build_tenants/typescript && npm install",
      "cd build_tenants/typescript && npm run build"
    ],
    "deployOddChat": [
      "cd build_tenants/typescript && npm link"
    ],
    "testOddChat": [
      "cd build_tenants/typescript && npm test",
      "odd-chat workspace create .odd-chat/workspaces/t131 t131 ../../domains/document_to_requirements/domain.json",
      "odd-chat graph-functions .odd-chat/workspaces/t131",
      "odd-chat select-graph-function .odd-chat/workspaces/t131 observe_document",
      "odd-chat actions .odd-chat/workspaces/t131"
    ]
  },
  "testExpectations": [
    {
      "id": "TEST-OCHAT-001",
      "command": "npm test",
      "evidence": "test_execution_surface",
      "expected": "all tests pass"
    },
    {
      "id": "TEST-OCHAT-002",
      "command": "odd-chat workspace create --name t131 --root .odd-chat/workspaces/t131 --domain domains/document_to_requirements",
      "evidence": "workspace_surface",
      "expected": "creates workspace manifest, selected domain ref, and evidence ledger"
    },
    {
      "id": "TEST-OCHAT-003",
      "command": "odd-chat graph-functions --workspace .odd-chat/workspaces/t131",
      "evidence": "deployment_surface",
      "expected": "prints available graph functions including document_to_requirements"
    },
    {
      "id": "TEST-OCHAT-004",
      "command": "odd-chat select-graph-function --workspace .odd-chat/workspaces/t131 --graph-function document_to_requirements",
      "evidence": "graph_function_selection_surface",
      "expected": "records selected graph function before action listing"
    },
    {
      "id": "TEST-OCHAT-005",
      "command": "odd-chat actions --workspace .odd-chat/workspaces/t131 --input examples/start_document.md",
      "evidence": "test_execution_surface",
      "expected": "only lawful actions for the selected graph function are returned"
    },
    {
      "id": "TEST-OCHAT-006",
      "command": "odd-chat choose",
      "evidence": "test_execution_surface",
      "expected": "human intent row is recorded before domain graph function invocation"
    }
  ],
  "releaseReadiness": {
    "requiredEvidence": [
      "sandbox_workspace_surface",
      "installed_odd_sdlc_surface",
      "implementation_surface",
      "sandbox_install_surface",
      "deployment_surface",
      "workspace_surface",
      "graph_function_selection_surface",
      "test_execution_surface"
    ],
    "nonClosureReasons": [
      "missing workspace manifest",
      "missing selected graph function",
      "missing human intent row",
      "missing admitted test execution evidence",
      "CLI not locally installed",
      "action menu generated outside loaded domain projection"
    ]
  }
}
```

## Human Evaluator Rule

The operator chooses exactly one lawful action for the current node. The choice
is evidence, not a hidden prompt preference. Before this action choice,
odd_chat must have an active workspace and a selected graph function.

Allowed human decisions:

- `continue`: invoke the listed graph function.
- `retry`: repair the current target asset with the typed gap dossier.
- `review`: stop traversal and inspect evidence.
- `reprice`: open a ticket/change-intent route before continuing.

## Completion Definition

The fixture is complete when the odd_chat sandbox has admitted evidence for:

1. odd_sdlc installation,
2. odd_chat implementation,
3. odd_chat local CLI deployment,
4. odd_chat workspace creation/opening,
5. odd_chat graph-function selection,
6. odd_chat tests,
7. release-readiness projection over admitted evidence.
