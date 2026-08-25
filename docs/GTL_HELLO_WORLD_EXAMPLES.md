# GTL Hello World Examples

**Status**: Publication-oriented examples for the frozen ABIogenesis 5.0 GTL 3
language
**Authority**: Illustrative read model only; the linked Product and requirement
law remains authoritative
**Example basis**: The accepted odd_glc ABIogenesis 5 migration plus the
root/child overlay pattern being explored by odd_glc

These examples answer three different questions:

1. What does one real published `GraphFunction` look like?
2. How do several `GraphFunction` values become one `Program`?
3. How can graph-overlay rows specialize that Program without becoming a
   runtime controller?

The first example projects accepted, executable odd_glc publication bytes. The
composition example uses frozen GTL relations. The overlay example adapts a
bounded root/child specialization pattern from active odd_glc design while
remaining consistent with frozen overlay law. Neither notation is a promise
about the current TypeScript constructor or serialized carrier spelling.

## 1. Accepted Single-GraphFunction Hello World

The accepted odd_glc steel thread publishes one odd_glc-owned Program and one
odd_glc-owned GraphFunction. That GraphFunction declares a single deterministic
leaf whose contracts and implementation binding are owned by ABIogenesis.

The selected Program fields are:

```json
{
  "kind": "gtl_program",
  "programRef": "program://odd_glc/conformance/program-only-hello@5",
  "callableMembership": [
    "graph-function://odd_glc/conformance/program-only-hello@5"
  ],
  "starts": [
    {
      "startRef": "start://odd_glc/conformance/program-only-hello@5",
      "graphFunctionRef": "graph-function://odd_glc/conformance/program-only-hello@5"
    }
  ],
  "closureContractRef": "contract://abiogenesis/conformance/hello-closure@5",
  "policies": {
    "abg.compute_regime": "F_D",
    "abg.default_start_ref": "start://odd_glc/conformance/program-only-hello@5",
    "abg.root_mode": "direct"
  },
  "version": "5.0.0"
}
```

The selected GraphFunction fields are:

```json
{
  "kind": "graph_function",
  "name": "graph-function://odd_glc/conformance/program-only-hello@5",
  "inputs": [
    "contract://abiogenesis/conformance/hello-input@5"
  ],
  "outputs": [
    "contract://abiogenesis/conformance/hello-output@5"
  ],
  "environment": {
    "requires": [
      "contract://abiogenesis/conformance/hello-input@5"
    ],
    "provides": [
      "contract://abiogenesis/conformance/hello-output@5"
    ],
    "carries": [
      "contract://abiogenesis/conformance/hello-input@5",
      "contract://abiogenesis/conformance/hello-output@5"
    ]
  },
  "effects": [
    "effect://abiogenesis/conformance/emit-hello-output@5"
  ],
  "template": {
    "kind": "inline_graph",
    "graphRef": "graph://odd_glc/conformance/program-only-hello@5",
    "startNodeRef": "node://odd_glc/conformance/program-only-hello/abi-hello@5",
    "terminalNodeRefs": [
      "node://odd_glc/conformance/program-only-hello/abi-hello@5"
    ],
    "nodes": [
      {
        "nodeKind": "c_locus",
        "nodeRef": "node://odd_glc/conformance/program-only-hello/abi-hello@5",
        "term": {
          "kind": "c_of",
          "fibre": "F_D",
          "resultBearing": true,
          "stageRole": "result",
          "requirement": {
            "kind": "executable_leaf_requirement",
            "implementationBindingRef": "implementation-binding://abiogenesis/conformance/hello-world-fd@5",
            "inputContractRef": "contract://abiogenesis/conformance/hello-input@5",
            "outputContractRef": "contract://abiogenesis/conformance/hello-output@5",
            "evidenceContractRef": "contract://abiogenesis/conformance/hello-evidence@5",
            "failureContractRef": "contract://abiogenesis/conformance/hello-failure@5",
            "refusalContractRef": "contract://abiogenesis/conformance/hello-refusal@5",
            "judgmentContractRef": "contract://abiogenesis/conformance/hello-judgment@5"
          }
        }
      }
    ],
    "edges": [],
    "applications": []
  },
  "version": "5.0.0"
}
```

These are selected fields, not replacement publication bytes. Use the
[accepted publication JSON](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/odd_glc/typescript/product/build/publication.json)
for the complete object.

The important ownership relation is:

```text
odd_glc owns
  Program identity, start, membership, GraphFunction, and graph topology

ABIogenesis owns
  Hello contracts, judgment, effect declaration, and deterministic leaf binding

HoG owns
  direct traversal of the admitted graph

ABG owns
  invocation, result, evidence, judgment, transition, replay, and closure truth
```

Given the admitted typed input
`{"kind":"hello_world_input","schemaVersion":"5.0.0","subject":"World"}`,
the ABI-owned leaf produces
`{"kind":"hello_world_output","schemaVersion":"5.0.0","message":"Hello World"}`.
The accepted installed-path test proves that the GraphFunction owner remains
odd_glc while the implementation owner remains ABIogenesis; neither owner
silently absorbs the other.

## 2. Composing Several GraphFunctions

A larger Hello World Module can carry reusable functions and one composing
function. The Program owns its callable membership, start, and topology;
module-internal GraphFunctions do not thereby become public callable members.

```text
GraphFunction subject
  input  = hello_request
  output = admitted_subject
  graph  = deterministic subject-validation locus

GraphFunction greeting
  input  = admitted_subject
  output = hello_output
  graph  = deterministic greeting leaf

GraphFunction hello_world
  input  = hello_request
  output = hello_output
  graph  = C.compose(workflow.C(subject), workflow.C(greeting))

Program hello_world_program
  callable membership = {hello_world}
  internal GraphFunctions = {subject, greeting}
  sole start = hello_world
  result contract = hello_output
  closure contract = hello_closed
```

This follows the same composition shape as odd_glc's active typed-workspace
design work: subordinate GraphFunctions remain module-internal, a composing
GraphFunction declares their cumulative topology, and the Program's sole
callable membership and start select the composer. The example deliberately
uses semantic notation because the active odd_glc carrier work is proposed and
has no published Git authority yet.

The lawful execution path is:

```text
start hello_world
  -> materialize the hello_world template
  -> HoG crosses the declared workflow.C boundary to subject
  -> ABIogenesis-owned deterministic leaf validates the subject
  -> ABG admits the child result and evidence
  -> HoG folds that admitted result into greeting
  -> ABIogenesis-owned deterministic leaf produces Hello World
  -> ABG admits the terminal result and derives closure by replay
```

The host harness must not call `subject` and `greeting` in sequence itself.
That would move topology from the Program into an ungoverned controller.

## 3. A Root And Child Graph Overlay

An overlay row is declarative Program-composition or publication metadata. It
may bind GraphFunctions, node types, roles, starts, policy, proof obligations,
and result contracts. It does not observe runtime state or decide what HoG does
next.

The following is tutorial notation, not an asserted current JSON Schema:

```text
overlay row overlay://example/hello/general@5
  parents = []
  contributes generic admission policy only
  contributes no types, role bindings, or GraphFunctions

overlay row overlay://example/hello/world@5
  parents = [overlay://example/hello/general@5]
  binds role subject_source -> node-type://example/text/subject@5
  binds role greeting_result -> node-type://example/text/greeting@5
  references GraphFunctions {subject, greeting, hello_world}
  contributes no runtime subject or observed result

overlay application basis application-basis://example/hello/world@5
  ordered overlays = [
    overlay://example/hello/general@5,
    overlay://example/hello/world@5
  ]

Program program://example/hello@5
  callable membership = {hello_world}
  sole start = hello_world
```

Application is root first, then child. Admission rejects an absent parent,
cycle, duplicate row, reversed order, ambiguous role binding, incompatible
contract, or undeclared override. The child refers to and specializes declared
base truth; it does not mutate the root definition.

The input subject `"World"` belongs to the admitted invocation or workspace
resource, not to either overlay row. After admission, the resulting
composition is Program truth. The overlay is not a fourth execution layer:

```text
overlay rows + base Program
  -> deterministic validation and admission
  -> one admitted Program composition
  -> HoG traversal
  -> ABG runtime truth
```

Do not confuse a GTL overlay row with an ABG overlay frame. An overlay row is
declaration metadata. An overlay frame is runtime contract truth over observed
state, pressure, or foldback.

## HoG And ABG Scope In These Examples

This guide includes only the boundary needed to understand a GTL call.

HoG is in scope as the direct executor of the admitted Program and materialized
GraphFunction graph. It may maintain invocation-local cursors, frames, queues,
or caches, but those are subordinate execution mechanics. This guide does not
specify HoG's internal scheduling structures, optimizations, or implementation
API.

ABG is in scope as the sole admission and replay authority for runtime events,
results, evidence, judgments, transitions, continuation, correction, and
closure. This guide does not specify ABG's complete event schemas, persistence
layout, Event Calculus implementation, transport, or operational deployment.

The boundary can be remembered as:

```text
GTL declares -> HoG traverses -> owner implements a leaf -> ABG admits truth
```

ABG does not interpret or execute the graph. HoG does not invent Program law or
admit runtime truth.

## Fail-Closed Checks

Reject the example if any of these substitutions appear:

- a GraphFunction is treated as the whole Program;
- the harness manually sequences child GraphFunctions;
- an overlay selects runtime traversal or contains mutable observation state;
- a child overlay silently rewrites its parent;
- an ABI-owned leaf is republished as odd_glc-owned implementation;
- HoG traverses a generated executable plan instead of admitted GTL;
- a leaf, plugin, worker, or CLI writes ABG events directly; or
- a successful return is called closed without ABG admission and replay.

## Git Sources

- [Frozen ABIogenesis 5 Product](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/PRODUCT.md)
- [GraphFunction law](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md)
- [C algebra and named workflow lift](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md)
- [Overlay and library/program/workspace law](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md)
- [Program, GraphFunction, HoG, and ABG mapping](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
- [HoG traversal and ABG admission law](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/abg/REQ-R-ABG3-INTERPRET.md)
- [Accepted odd_glc Hello World publication](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/odd_glc/typescript/product/build/publication.json)
- [Accepted odd_glc ABIogenesis 5 migration design](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/common/design/ODD_GLC_ABI5_MIGRATION.md)
- [Accepted installed cross-owner Hello World test](https://github.com/foolishimp/odd_glc/blob/dae8589b2784be4c101af70d891f85367fc13ebd/build_tenants/odd_glc/typescript/test/abi5-installed-cross-owner-hello.test.mjs)
