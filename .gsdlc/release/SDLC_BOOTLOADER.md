# SDLC Bootloader

Version: 1.0rc1
Spec-Hash: sha256:9390477dc476d24892f23fd32b802689e2ef302ade503d053c594bec78ed8770

## Authority

- This carrier orients the agent to the installed genesis_sdlc release.
- ABG owns engine execution. genesis_sdlc owns the domain workflow and evidence surface.
- Read the referenced source documents for depth; this bootloader is a compiled orientation surface.

## Axioms

- Specification defines the what.
- Design defines the how.
- Evaluate and close gaps before claiming convergence.
- F_D proves deterministic currency. F_P performs bounded construction. F_H approves release-critical gates.

## Active Docs

- workspace://specification/INTENT.md
- workspace://build_tenants/TENANT_REGISTRY.md
- workspace://.gsdlc/release/operating-standards/SPEC_METHOD.md
- workspace://.gsdlc/release/operating-standards/GSDLC_METHOD.md
- workspace://.gsdlc/release/design/README.md
- workspace://.gsdlc/release/design/module_decomp.md
- workspace://specification/requirements/00-starter.md
- workspace://specification/requirements/abg/REQ-R-ABG2-BINDING.md
- workspace://specification/requirements/abg/REQ-R-ABG2-CONVERGENCE.md
- workspace://specification/requirements/abg/REQ-R-ABG2-CORRECTION.md
- workspace://specification/requirements/abg/REQ-R-ABG2-EVENTS.md
- workspace://specification/requirements/abg/REQ-R-ABG2-INTERPRET.md
- workspace://specification/requirements/abg/REQ-R-ABG2-JOB-WORKER.md
- workspace://specification/requirements/abg/REQ-R-ABG2-LEAFTASK.md
- workspace://specification/requirements/abg/REQ-R-ABG2-LINEAGE.md
- workspace://specification/requirements/abg/REQ-R-ABG2-PROJECTION.md
- workspace://specification/requirements/abg/REQ-R-ABG2-PROVENANCE.md
- workspace://specification/requirements/abg/REQ-R-ABG2-RUN.md
- workspace://specification/requirements/abg/REQ-R-ABG2-SELECTION-APPLICATION.md
- workspace://specification/requirements/abg/REQ-R-ABG2-SELFHOSTING.md
- workspace://specification/requirements/abg/REQ-R-ABG2-TRANSPORT.md
- workspace://specification/requirements/abg/REQ-R-ABG2-WORKER.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-COMPOSE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-ENGINE-INDEPENDENCE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-EVALUATOR.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-GRAPH.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-GRAPHFUNCTION.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-HOF.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-IDENTITY.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-INTERFACE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-JOB.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-LAWS.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-MODULE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-NODE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-OPERATOR.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-RECURSE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-ROLE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-RULE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-SELECTION-BOUNDARY.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-SUBSTITUTE.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-SUBWORK.md
- workspace://specification/requirements/gtl/REQ-L-GTL2-SYNTHESIS.md
- workspace://specification/requirements/mapping/REQ-M-GTL2-CAPABILITY.md
- workspace://specification/requirements/mapping/REQ-M-GTL2-MAPPING.md
- workspace://specification/requirements/mapping/REQ-M-GTL2-PROVENANCE.md
- workspace://specification/requirements/product/REQ-P-POLICY.md
- workspace://specification/requirements/product/REQ-P-QUAL.md
- workspace://specification/requirements/product/REQ-P-SCENARIOS.md

## Commands

- `PYTHONPATH=.gsdlc/release:.genesis python -m genesis gaps --workspace .`
- `PYTHONPATH=.gsdlc/release:.genesis python -m genesis iterate --workspace .`
- `PYTHONPATH=.gsdlc/release:.genesis python -m genesis start --workspace .`
- Use `genesis gaps` when drift is suspected, `genesis iterate` for the next blocking edge, and `genesis start` for the next executable job.
