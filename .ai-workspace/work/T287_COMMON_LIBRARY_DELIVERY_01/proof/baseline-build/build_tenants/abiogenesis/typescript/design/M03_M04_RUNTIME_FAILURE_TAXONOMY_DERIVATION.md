# M03/M04 Runtime Failure Taxonomy Derivation

**Status**: Active
**Date**: 2026-04-25
**Purpose**: Reprice the TypeScript runtime/result/public failure taxonomy so
the engine distinguishes runtime-unavailable, capability-missing, true
runtime-failure, and payload-contract failure before `B-030-TS` projects final
operator stop truth.

## 1. Source Material

This boundary derives from:

- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `build_tenants/common/design/modules/M03-engine-kernel.yml`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `M03_TRANSPORT_PROTOCOL_DERIVATION.md`
- `M04_RESULT_ASSESSMENT_DERIVATION.md`
- `M04_LIVE_STATUS_DERIVATION.md`
- `.ai-workspace/tickets/active/T-035-reprice-typescript-m03-m04-failure-taxonomy-to-distinguish-runtime-unavailable-capability-missing-and-runtime-failure.md`

## 2. Position

The existing TypeScript line collapses several different runtime facts into:

- `transport_failure`
- `no_output`
- `contract_failure`
- public `rejected`

That is too coarse for operator stop taxonomy. It hides whether ABG could not
reach a runtime, reached a runtime that lacked a declared capability, reached a
runtime that failed during execution, or received a payload that failed the
result-artifact contract.

The split belongs first in `M03`, because `M03` owns the dispatch/result
protocol and the runtime fact boundary. `M04` consumes the class as public
projection input. It does not reconstruct the class from detail text, CLI
stderr, status labels, or wrapper-local rules.

## 3. Canonical Runtime Failure Classes

The TypeScript line uses the following closed runtime failure classes:

- `runtime_unavailable`: the selected worker, backend, command, runtime
  package, or dispatch substrate cannot be resolved or invoked.
- `capability_missing`: the runtime exists but cannot satisfy a declared
  graph, task, role, tool, model, or execution capability.
- `runtime_failure`: the runtime accepts the dispatch boundary but fails during
  execution, including timeout, crash, non-zero exit, or lease/progress failure.
- `payload_contract_failure`: the runtime or adapter returns no result payload,
  malformed payload, missing required artifact truth, or schema-invalid output.

These classes are runtime/public stop inputs. They are not proof, closure, or
domain-validation outcomes.

## 4. Module Ownership

`M03-engine-kernel` owns:

- the `RuntimeFailureClass` carrier
- runtime failure artifact admission
- result ingest classification
- fail-closed rejection of unsupported failure classes

`M04-app-bootstrap` owns:

- carrying the `RuntimeFailureClass` through public result assessment
- exposing the same class in live-status projection
- preserving public reason/detail without treating it as classification
  authority

No downstream wrapper owns the abbreviation, label, or class derivation. A
wrapper may present the class, but it must not derive a different class from
local detail text.

## 5. Boundary With Rejected Truth

`rejected` remains lawful, but it is not a synonym for runtime failure.

Use `rejected` when an admitted artifact contradicts declared dispatch truth,
identity truth, or assessment obligations after payload admission.

Use a `RuntimeFailureClass` when the runtime/payload boundary itself cannot
produce canonical artifact truth.

This preserves the difference between:

- "the worker result was contradictory" and
- "the runtime/payload boundary failed before a valid result could be judged"

## 6. Implementation Consequence

The code realization must:

- replace public `transport_failure` carrier meaning with `runtime_failure`
  ingest meaning plus explicit `RuntimeFailureClass`
- carry `failureClass` from M03 result ingest into M04 result assessment
- expose `failureClass` in live-status result-assessment projection
- make attention `runStatus` consume the canonical failure class directly
- reject legacy or unsupported failure classes at admission
- prove that M04 does not reconstruct the class from reason text

## 7. Deferred Boundary

This ticket does not complete the final `B-030-TS` public callable start/stop
taxonomy. It supplies the runtime failure classes that `B-030-TS` needs.

It also does not implement retry/repair, leaf-task execution, graph-function
iteration, or installed live portfolio behavior. Those surfaces may consume the
same taxonomy after their own implementation tickets open.
