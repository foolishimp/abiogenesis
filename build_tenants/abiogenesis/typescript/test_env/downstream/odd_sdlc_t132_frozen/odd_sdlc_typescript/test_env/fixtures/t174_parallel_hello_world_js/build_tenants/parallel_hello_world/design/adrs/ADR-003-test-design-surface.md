# ADR-003 Test Design Surface

**Status**: Active
**Derived From**: `T-174 live fixture`

This surface carries evaluator-owned test topology for the focused live proof.
The generated product tests are still created by traversal.

```test_design_register
{
  "kind": "sdlc_test_design_register",
  "registerVersion": "ts-test-design-v1",
  "targetAssetType": "test_design_surface",
  "designConsumptionRows": [
    {
      "kind": "sdlc_design_consumption_contract",
      "contractRef": "contract://odd-sdlc/t174/parallel-hello-world/test-design",
      "sourceDesignObligationRefs": [
        "REQ-T174-PARALLEL-HELLO-005",
        "REQ-T174-PARALLEL-HELLO-006"
      ],
      "authorityBasisRefs": [
        "workspace://build_tenants/parallel_hello_world/design/adrs/ADR-002-implementation-design-surface.md"
      ],
      "consumerGraphFunctionRefs": [
        "graph-function://odd-sdlc/current-full-traversal/derive_component_test_surface"
      ]
    }
  ],
  "uatTestcaseRows": [
    {
      "kind": "sdlc_test_case_row",
      "testCaseRef": "testcase://odd-sdlc/t174/hello-world-public-import",
      "caseKind": "uat",
      "executionLane": "uat",
      "sourceDesignObligationRefs": [
        "REQ-T174-PARALLEL-HELLO-007"
      ],
      "testcaseAuthorityRefs": [
        "workspace://specification/requirements/01-parallel-hello-world.md"
      ],
      "expectedBehavior": "Importing src/index.js and invoking helloWorld() returns hello world."
    }
  ],
  "testcaseAuthorityRows": [
    {
      "kind": "sdlc_test_case_row",
      "testCaseRef": "testcase://odd-sdlc/t174/hello-branch",
      "caseKind": "positive",
      "executionLane": "unit",
      "sourceDesignObligationRefs": [
        "REQ-T174-PARALLEL-HELLO-005"
      ],
      "testcaseAuthorityRefs": [
        "workspace://specification/requirements/01-parallel-hello-world.md"
      ],
      "expectedBehavior": "The hello branch returns hello."
    },
    {
      "kind": "sdlc_test_case_row",
      "testCaseRef": "testcase://odd-sdlc/t174/world-branch",
      "caseKind": "positive",
      "executionLane": "unit",
      "sourceDesignObligationRefs": [
        "REQ-T174-PARALLEL-HELLO-006"
      ],
      "testcaseAuthorityRefs": [
        "workspace://specification/requirements/01-parallel-hello-world.md"
      ],
      "expectedBehavior": "The world branch returns world."
    }
  ],
  "testStackProfileRows": [
    {
      "kind": "sdlc_test_stack_profile_row",
      "stackRef": "stack://odd-sdlc/t174/node-test",
      "frameworkRef": "framework://node/test",
      "buildTool": "node"
    }
  ],
  "testModuleRows": [
    {
      "kind": "sdlc_test_module_row",
      "moduleName": "hello_branch_test",
      "moduleRef": "module://odd-sdlc/t174/hello-branch-test",
      "testRoot": "test"
    },
    {
      "kind": "sdlc_test_module_row",
      "moduleName": "world_branch_test",
      "moduleRef": "module://odd-sdlc/t174/world-branch-test",
      "testRoot": "test"
    }
  ],
  "testComponentTopologyRows": [
    {
      "kind": "sdlc_test_component_topology_row",
      "testClassId": "hello",
      "relativePath": "test/hello.test.js",
      "testcaseIds": [
        "testcase://odd-sdlc/t174/hello-branch"
      ],
      "componentIds": [
        "dev/hello"
      ],
      "requirementIds": [
        "REQ-T174-PARALLEL-HELLO-005"
      ],
      "shardId": "hello"
    },
    {
      "kind": "sdlc_test_component_topology_row",
      "testClassId": "world",
      "relativePath": "test/world.test.js",
      "testcaseIds": [
        "testcase://odd-sdlc/t174/world-branch"
      ],
      "componentIds": [
        "dev/world"
      ],
      "requirementIds": [
        "REQ-T174-PARALLEL-HELLO-006"
      ],
      "shardId": "world"
    }
  ],
  "testDataBindings": [
    {
      "kind": "sdlc_test_data_binding",
      "testDataRef": "test-data://odd-sdlc/t174/hello",
      "testCaseRef": "testcase://odd-sdlc/t174/hello-branch",
      "inputFixtureRefs": [],
      "generationPolicyRef": "policy://odd-sdlc/t174/no-fixture",
      "expectedResultRef": "expected-result://odd-sdlc/t174/hello",
      "sourceDesignObligationRefs": [
        "REQ-T174-PARALLEL-HELLO-005"
      ]
    },
    {
      "kind": "sdlc_test_data_binding",
      "testDataRef": "test-data://odd-sdlc/t174/world",
      "testCaseRef": "testcase://odd-sdlc/t174/world-branch",
      "inputFixtureRefs": [],
      "generationPolicyRef": "policy://odd-sdlc/t174/no-fixture",
      "expectedResultRef": "expected-result://odd-sdlc/t174/world",
      "sourceDesignObligationRefs": [
        "REQ-T174-PARALLEL-HELLO-006"
      ]
    }
  ],
  "expectedResultBindings": [
    {
      "kind": "sdlc_expected_result_binding",
      "expectedResultRef": "expected-result://odd-sdlc/t174/hello",
      "testCaseRef": "testcase://odd-sdlc/t174/hello-branch",
      "assertionRefs": [
        "assertion://odd-sdlc/t174/hello-equals-hello"
      ],
      "expectedResultSummary": "hello() returns hello.",
      "verificationPolicyRef": "policy://odd-sdlc/t174/exact-string"
    },
    {
      "kind": "sdlc_expected_result_binding",
      "expectedResultRef": "expected-result://odd-sdlc/t174/world",
      "testCaseRef": "testcase://odd-sdlc/t174/world-branch",
      "assertionRefs": [
        "assertion://odd-sdlc/t174/world-equals-world"
      ],
      "expectedResultSummary": "world() returns world.",
      "verificationPolicyRef": "policy://odd-sdlc/t174/exact-string"
    }
  ],
  "uatIntegrationBindings": [
    {
      "kind": "sdlc_uat_integration_binding",
      "uatTestCaseRef": "testcase://odd-sdlc/t174/hello-world-public-import",
      "integrationTestCaseRef": "testcase://odd-sdlc/t174/hello-branch",
      "executionLane": "uat"
    }
  ],
  "testExecutionScheduleRows": [
    {
      "kind": "sdlc_test_execution_schedule_row",
      "scheduleRef": "schedule://odd-sdlc/t174/node-branch-tests",
      "testCaseRefs": [
        "testcase://odd-sdlc/t174/hello-branch",
        "testcase://odd-sdlc/t174/world-branch"
      ],
      "command": "node --test test/hello.test.js test/world.test.js",
      "frameworkRef": "framework://node/test",
      "shardId": "branch-tests"
    }
  ]
}
```
