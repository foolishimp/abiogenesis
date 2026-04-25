# M05 Data Mapper Real Ingress Proof Derivation

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Prove the T-063 `SdlcBootstrapInputSet -> SdlcProject`
bootstrap-lineage carrier over the real data-mapper ingress corpus and recent
generated data-mapper run surfaces.

## 1. Source Material

This proof derives from:

- `M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_FIRST_SLICE_IACS.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_STRUCTURAL_CARRIER_DIAGRAM.md`
- `ai_sdlc_examples/local_projects/data_mapper/data_mapper.template`
- `ai_sdlc_examples/local_projects/data_mapper/data_mapper.test41`
- `ai_sdlc_examples/local_projects/data_mapper/data_mapper.test42`
- `ai_sdlc_examples/local_projects/data_mapper/data_mapper.test43`
- `odd_sdlc/build_tenants/python/code/odd_sdlc/normalization.py`
- `odd_sdlc/build_tenants/python/code/odd_sdlc/constructor.py`
- `T-064`

## 2. Position

T-063 proves the abstract bootstrap-lineage carrier. T-064 proves the same
carrier against real ingress material.

The real data-mapper fixture has two source classes:

- preserved imported project authority in `data_mapper.template`
- generated Python SDLC read models and runtime evidence in recent
  `data_mapper.testXX` runs

The TypeScript proof does not become the Python installer. It reads the real
fixture only inside the sandbox test harness, computes source digests, extracts
authority markers, admits those facts into `SdlcBootstrapInputSet`, and then
derives `SdlcProject` through the existing M05 transformation.

## 3. Python Comparison

Python SDLC ingest currently does deterministic workspace normalization:

- reads imported authority from `specification/INTENT.md`,
  `specification/REQUIREMENTS.md`, and `specification/mapper_requirements.md`
- publishes `specification/requirements/00-imported-sources.md`
- publishes `.ai-workspace/context/project_bootstrap.md`
- normalizes project constraints and tenant topology
- publishes workspace state and analysis manifests
- keeps imported authority as project truth instead of rewriting it

The TypeScript proof compares against those outputs by reading the generated
normalization report and analysis/bootstrap surfaces from recent data-mapper
runs. It validates that the real fixture exposes the same source classes Python
normalization consumed, then proves the M05 carrier can preserve their lineage.

## 4. Carrier Decision

No new prime carrier is introduced.

The active IACS remains:

- `SdlcBootstrapInputSet`
- `SdlcProject`
- `SdlcDerivationLedger`

The test harness is not a carrier. It is a deterministic adapter from real
files into the already-governed ingress carrier.

## 5. Proof Topology

```text
data_mapper.template files
  + recent data_mapper.test41/test42/test43 read models
  + Python normalization evidence
    -> test harness inventory and digest extraction
    -> SdlcBootstrapInputSet
    -> GF_BOOTSTRAP_PROJECT / BootstrapInputSet->Project
    -> SdlcProject + SdlcDerivationLedger
```

## 6. Required Assertions

The sandbox proof must assert:

- the preserved template contributes imported authority inputs
- recent generated runs contribute Python SDLC read-model inputs
- Python normalization evidence includes imported-source summary creation,
  project-bootstrap creation, constraint normalization, and analysis-manifest
  publication
- admitted inputs carry real workspace URIs and SHA-256 digests
- the derived project name is `Categorical Data Mapping & Computation Engine (CDME)`
- imported requirement authority includes normalized `REQ-LDM-001`
- lineage answers which real source file produced that requirement element
- non-authority runtime/context evidence remains visible as ambiguity rather
  than silently becoming semantic project truth

## 7. Non-Goals

This proof does not implement:

- an SDLC.TS installer
- filesystem normalization as production M05 code
- Python constructor behavior
- live F_P dispatch
- data-mapper code generation
- a public TypeScript SDLC application surface

Those are successor SDLC.TS design decisions. This proof only tests whether
the ABG/GTL/M05 substrate can carry the real ingress facts conformantly.
