# M02/M04 Self-Build Program Feasibility Contract

**Status**: T-225 realization contract
**Purpose**: Prove the frozen B5 carrier is executable by exact I4 before full
self-host implementation begins

## Exact Inputs

| Input | Required identity |
|---|---|
| P4 package | `@abiogenesis/typescript-tenant@4.6.0-rc.3` |
| P4 tarball | SHA-256 `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113` |
| I4 installed manifest | SHA-256 `92b3f94dd32bca9368a9511d823cc8b6e2eae75cd7168c9e901d3cbe8eadf07d` |
| B5 | exact frozen canonical Module bytes and manifest digest produced by T-225 |
| fixture input | immutable minimal S5-shaped root with canonical inventory digest |
| output root | new empty job-bound directory outside B5, I4, and fixture input |

The proof must use a fresh workspace. A current source import, rebuilt P4,
mutable package link, or target-local ABG package is not an exact input.

## Bounded Action

B5 declares action `feasibility_probe`. It uses the same selected B5
GraphFunction and deterministic handler declarations retained for the later
build action.

The probe materializes exactly one file:

- relative path: `b5-feasibility.json`;
- media type: `application/json`;
- canonical content:
  `{"kind":"b5_feasibility","marker":"i4-public-start-ok","schemaVersion":1}`;
- expected SHA-256: derived and frozen by T-225 from those exact UTF-8 bytes.

The marker proves deterministic process/materialization reachability only. It
does not prove candidate construction, convergence of the full self-build, or
C1/C2 equivalence.

## Allowed Proof Adapter

One source-independent proof adapter may:

1. read exact I4/P4 identity files and frozen B5/fixture bytes;
2. compare declared SHA-256 identities;
3. import only exact I4 public package exports;
4. call public admission and start operations once each;
5. supply an event sink and declared filesystem roots; and
6. persist returned values and process traces unchanged.

It may not:

- import current ABG source or private paths from I4;
- validate B5 by inventing semantics absent from the frozen schema;
- select a private GraphFunction, Job, vector, handler, worker, or continuation;
- inject a test-only execution plugin or replace a standard handler;
- emit or rewrite runtime events;
- loop start/resume until a preferred outcome;
- create the expected artifact itself; or
- treat file existence as closure.

## Exact Operation Sequence

1. Verify P4 tarball and I4 installed-manifest digests.
2. Read frozen B5 bytes; verify manifest and selected GraphFunction digests.
3. Parse the JSON and call exact I4 `admitModule`.
4. Verify `module.graphFunctions` contains exactly one row whose id and name
   equal B5 `graphFunctionRef`.
5. Admit the declared StartIntent with the fixture input binding and requested
   output root.
6. Call exact I4 `admitExecutionBasis`; verify the selected GraphFunction and
   Job identities.
7. Call exact I4 `publicStartAsync` once with the admitted Module, builder
   runtime identity/policy, standard declared handlers, and explicit event
   sink.
8. Admit returned events/result through exact I4 public contracts.
9. Verify truthful convergence and the expected artifact bytes/digest.
10. Repeat specialized B5 schema/digest admission under the current 5.0
    candidate and verify the same B5 bytes are catalog-publishable. This second
    check does not substitute current execution for I4 execution.

## Parse-Bind-List-Start Meaning

| Word | DS-1F proof meaning |
|---|---|
| parse | JSON parse followed by exact I4 `admitModule` |
| bind | exact installed I4 identity plus `admitExecutionBasis` over B5 Module/StartIntent |
| list | pure inspection of admitted `Module.graphFunctions` |
| start | one exact I4 `publicStartAsync` call |

These words do not mean DS-1 `catalog.bind`, `catalog.list`, or
`catalog.invoke` on I4.

## Source-Isolation Differential

The fixture input contains an executable-looking decoy at the location a
source-fallback implementation would probe. The decoy fails and writes a
marker if loaded. The supported proof must show:

- no decoy marker;
- all ABG module resolution under exact I4 package root or Node built-ins;
- no current checkout or fixture runtime/provider/plugin/controller import;
- no write under I4, B5, or the fixture input root; and
- all writes under the job-bound output/archive roots.

This is a supported-path correctness differential. T-225 does not add hostile
filesystem, symlink, signing, or tamper defenses.

## Required Evidence

The durable proof root contains:

- `proof.json` with exact P4/I4/B5/input/output identities;
- copied or referenced exact P4 and I4 identity records;
- B5 bytes, manifest digest, GraphFunction digest, and schema result;
- admitted Module GraphFunction list;
- admitted execution-basis summary;
- public start request and returned outcome;
- canonical runtime event log and replay/result projection;
- process/module resolution trace;
- source-isolation result;
- `b5-feasibility.json`; and
- final typed verdict.

The verdict is `eligible` only when every required item agrees. Failure is
typed by the error families in the IACS.

## Negative Differentials

T-225 proves at least:

1. wrong P4 tarball digest;
2. wrong I4 installed-manifest digest;
3. missing required I4 public export;
4. malformed B5 metadata;
5. B5 manifest or GraphFunction digest mismatch;
6. duplicate or missing selected GraphFunction in the Module;
7. candidate-only capability requested on the I4 profile;
8. changed fixture input digest;
9. output-root escape; and
10. decoy source-runtime import.

No cryptographic attacker model is implied. These are likely identity,
malformed-input, and source-fallback failures on the supported desktop path.

## Closure

T-225 closes only when exact I4 produces the known artifact through this
sequence, returned runtime truth converges, source isolation passes, the same
B5 bytes pass 5.0 specialized publication admission, and the exact B5 identity
is recorded for DS-5.

This proof does not claim full self-hosting, a candidate C1, installed I1,
stage-two C2, equivalence, or release eligibility.
