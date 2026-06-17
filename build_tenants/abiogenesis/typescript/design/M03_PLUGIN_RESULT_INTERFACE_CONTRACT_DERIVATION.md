# M03 Plugin Result Interface Contract Derivation

**Ticket**: T-158  
**Change class**: requirement_reprice  
**Design owner**: this is the singular T-158 design surface.

## Target

GTL declares plugin result interfaces as compile-time program rows. ABG admits
those rows into a runtime-consumable result-interface catalog, and runtime
plugin result envelopes may cite only that admitted catalog. Downstream products
consume replay-visible envelope events and interpret admitted evidence; they do
not parse local result files or construct plugin interface law.

T-159 places this design inside `TraversalUnit<A, B>` as output admission.
Plugin result interfaces do not own bind routing and are not traversal units.
They are the typed admission surface that lets transform, evaluate, and
consequence stage outputs become unit truth before assurance, closure,
consequence projection, transition, or downstream read-model interpretation.

## IACS

| Carrier | Owner | Admission | Writes | Consumers |
| --- | --- | --- | --- | --- |
| `GtlProgramPluginResultInterfaceRow` | GTL program declaration | `admitGtlProgramConformanceInput(...)` parses raw program input | none | compiler only |
| `AdmittedPluginResultInterfaceContract` | ABG M03 compiler gate | `typecheckGtlProgram(...)` after stage/interface validation | none | runner result ingress |
| `AdmittedPluginResultInterfaceCatalog` | ABG M03 compiler gate | built from compiler-admitted interface contracts | none | runner request, downstream proof surfaces |
| `AdmittedPluginResultEnvelope` | ABG M03 runtime ingress | `admitPluginResultEnvelope(...)` against an admitted interface contract | runtime payload events | downstream read models |
| `payload_observed` / `payload_validated` / `evidence_admitted` | ABG M03 event stream | runner event constructors | event stream only | replay, ledgers, downstream read models |

## Structural Derivation

```text
GTL program input
  -> raw pluginResultInterfaces rows
  -> typecheckGtlProgram(...)
  -> AdmittedPluginResultInterfaceCatalog
  -> runner plugin result ingress
  -> admitPluginResultEnvelope(admitted contract, result)
  -> replay-visible payload/evidence events
  -> downstream product interpretation over admitted ABG truth
```

The runtime selector key is the selected composition ref, composition digest,
stage role, compute means, and output carrier set. The compiler rejects
overlapping selector outputs for the same composition/stage/compute tuple so
the runner never has to choose between ambiguous interface contracts.

Inside a traversal unit, raw plugin outputs remain proposed values until
admitted through this interface. A raw result file, archive layout, fallback
alias, or product-local parser cannot advance, close, bind, or project unit
truth.

## Non-Closure Signals

- Runtime envelope admission accepts a raw `GtlProgramPluginResultInterfaceRow`.
- The runner receives `pluginResultInterfaces` raw rows instead of an admitted
  `AdmittedPluginResultInterfaceCatalog`.
- Envelope events derive contract digest from copied envelope fields instead of
  the admitted interface contract digest.
- Downstream products select result carriers by scanning local result file
  shapes, fallback aliases, or archive layout.
- Two interface rows can match the same runtime selector output carrier.
- An admitted plugin result envelope is treated as a bind controller rather
  than an output-admission surface.

## Decommissioned Paths

- Product-local `fp_evaluate_result.json` shape probing as interface law.
- SDLC-local envelope admission or compatibility wrappers.
- Runner fallback from malformed interface declarations to local output carrier
  inference.
- Runtime disambiguation of duplicate plugin result interfaces.
- Any traversal-unit closure or consequence bind derived from raw result files
  before ABG admission.

## Proof Expectations

- Compiler negative proof for malformed rows, direct local file selectors,
  missing identity fields, and overlapping runtime selector outputs.
- Runtime negative proof that raw rows are rejected and only admitted contracts
  can admit envelopes.
- Runner proof that replay-visible envelope events cite the admitted interface
  contract digest.
- Downstream proof that SDLC checks replay-visible interface authority and does
  not import ABG envelope admission locally.
