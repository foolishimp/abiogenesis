# Independent installed-fixture feasibility review

Root-attributed projection of the completed `/root/rc5_scope_review` return,
OpenAI gpt-6.1-sol, max effort, 2026-11-03. Reviewer performed no coding, build,
tests or provider execution and did not review the moving codec candidate.

Product Frame: generic GTL composition runs through installed Product owners.
ABG admits source Results and retained input; fresh result/replay reconstruct
that truth. Test declarations and deterministic leaves supply data without
authoring events. Baseline9f3f22b0f733718bee88d5ca1cc306ed0446797a,
tree17a9b10d91f5ab9dd05f63f8b2626d57db0c7dd8; exact dispatch manifest
e92f700c1a0fbc1f4e1c1ba580783b4ec994894b4f09b6a53ca648f2c38e0486 verified.

Verdict: feasible within m5-installed-graph-edge.test.mjs. No additional
source/helper write territory is needed. This is source-based feasibility,
not executed proof or acceptance of the partial implementation.

Smallest lawful fixture:

1. Reuse the structural fixture's atomic child, data_input E to data_output S,
   with a modest multi-kilobyte subject.
2. The selected parent's first node is c_workflow calling that child.
3. Connect it to a deterministic consumer with graphInputRetentionBinding(E,S),
   targeting the exact ABI-owned RETAINED_GRAPH_INPUT_CONTRACT T.
4. The consumer accepts entry E/source S, checks their fixture relation and
   returns the existing data_output.

The child admits S first. The parent workflow admits the same S as a distinct
Result, enabling existing v1 sharing against that earlier child Result. The
retained route consumes the exact parent Result, exercising the required
already-referenced Result dependency.

Required premises and existing source routes at the baseline:

- The FROM node must be c_workflow. Ordinary C.of to C.of is rejected by
  code/src/validator/validation.ts:969-979.
- Carry E in the parent environment, preserve S in provides/carries, declare
  the exact E/S/T tuple and one incoming edge. Derive the edge with gtl.graphEdge;
  code/src/gtl/graph_applications.ts:50-74 owns it.
- Restrict the transformed fixture to the selected workflow case. Changing a
  shared leaf's input while retaining unrelated composed cases can invalidate
  their declarations.
- Bind parent/root closure metadata to the actual terminal consumer's evidence,
  refusal and judgment contracts; preserve the parent's own scope, transition,
  predicate and result relations. The existing terminal parameter is in
  test_env/fixtures/language-structural/program.mjs:56-71; closure enforcement
  is code/src/abg/closure.ts:520-533.
- prepareLanguageStructuralFixture imports transformed program.mjs before its
  dependency is installed (test_env/support/language-structural-fixture.mjs:22-43).
  A new bare ABI-package import there can fail at preparation. The test-local
  prepareFixture wrapper receives the exact bootstrap product owner from
  root-installed-environment.mjs:260-266. Obtain the canonical retained contract
  and binding from that owner and emit their immutable declaration data through
  synchronous sourceTransform. The installed leaf may use its existing ABI
  dependency's isRetainedGraphInput and then fixture E/S checks. No duplicate
  framework contract or absolute bootstrap import is needed.
- Canonical retained contract/binding/constructor:
  code/src/product/worksite_preparation_contracts.ts:152-190, exported by
  code/src/product/index.ts:599.
- Installed semantic admission/evidence/judgment:
  test_env/fixtures/language-structural/leaf.mjs:3-10,25-54.
- Exact workflow Result/foldback/closure and retained reconstruction:
  code/src/abg/worksite_input_provenance.ts:307-362.
- Source transformation before manifest/archive and installed reload:
  test_env/support/language-structural-fixture.mjs:23-29,39-74.
- Installed invocation and separate fresh result/replay with unchanged-prefix
  assertions: test_env/support/installed-language-test.mjs:25-54.

The actual test must assert that the exact parent source Result is physically
referenced, the new route record names it, the restored source equals admitted
S, and both fresh installed reads succeed. Physical parsing supplies storage
observations; proof.events supplies admitted truth. Root selects this existing
owner route for the continuation; ordinary fixture implementation remains with
the native Worker.
