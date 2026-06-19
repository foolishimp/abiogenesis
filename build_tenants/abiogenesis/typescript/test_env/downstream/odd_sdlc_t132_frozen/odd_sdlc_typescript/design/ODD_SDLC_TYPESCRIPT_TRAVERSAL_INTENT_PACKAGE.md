# ODD SDLC TypeScript Traversal Intent Package

## Authority

- Tickets:
  - `.ai-workspace/tickets/completed/T-088-realize-typescript-cumulative-traversal-intent-package-from-test35-pressure.md`
  - `.ai-workspace/tickets/completed/T-089-harden-traversal-intent-pressure-enforcement-on-every-prompt-edge.md`
  - `.ai-workspace/tickets/active/T-091-harden-typescript-traversal-closure-against-lossy-obligation-carriers.md`
- Requirements:
  - `specification/requirements/06-bootstrap-assets-and-recursive-edges.md`
  - `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
  - `specification/requirements/14-odd-sdlc-installed-product-contract.md`

## Design Claim

Every prompt-bearing traversal must carry one typed cumulative intent package.
Prompt prose is a projection over this package, not an independent authority
surface.

The package exists to make the traversal's gain function explicit: where the
edge starts, where it is trying to land, what authority constrains the move,
what evaluators will judge it, and what prior gap pressure must remain visible.

## Prompt Projection Discipline

Prompt assembly follows the shared method boundary:

- `SPEC_METHOD.md` defines the probabilistic work boundary: the framework
  declares input/output contract, required context, evaluator regime,
  provenance, and lawful control states while the worker owns internal HOW
  inside that boundary
- `WRITING_GUIDE.md` prefers direct positive statements and current-surface
  truth over narrated transition or contrast framing
- `DESIGN_MODULE_METHOD.md` rejects prompt, report, or read-model surfaces that
  become hidden strategy doctrine or admission logic
- `TICKET_METHOD.md` requires prompts to assemble from admitted work law rather
  than raw phrasing

The TypeScript prompt is therefore a bounded construction projection over:

- the traversal intent package
- selected edge contract
- target carrier or artifact contract
- authority refs and obligation pressure
- tenant stack and execution boundary when applicable
- allowed read/write roots
- evaluator-owned evidence and admission expectations

`worker_construction_brief.json` is the canonical worker-facing intent probe.
It carries compact target-carrier prompt projection, authority refs, current
obligation pressure, tenant stack summary, and bounded read/write state. It does
not carry the expanded target-carrier construction template or row templates.
`worker_invocation_package.json`, `handoff_manifest.json`, and runtime ledgers
remain archived forensic/evaluator surfaces. Prompts do not list them as
ordinary first-read inputs.

Prior-failure wording is not prompt authority. When a failure exposes missing
system behavior, the repair lands in requirement, design, evaluator/runtime
admission, or deterministic proof. The prompt may project the repaired boundary
only as current work truth.

## Carrier

`SdlcTraversalIntentPackage` is embedded in `SdlcWorkerHandoffManifest` and archived as `traversal_intent_package.json`.

The package carries:

- graph function, edge, vector, source asset types, and target asset type
- method, authority, runtime, and prior-edge refs
- retry attempts and prior gap dossier refs
- obligation ids and obligation delta summary
- product materialization contract
- worker report schema
- evaluator expectations
- output/report paths
- package digest over the authority-bearing package basis

## Obligation Pattern

Obligation lists are a supported traversal surface pattern. They are not the
only lawful closure method.

A graph function may use literal checklist obligations when the required gain
function is naturally list-shaped. Product-specific traversals may derive
obligations from authority refs, target types, evaluator contracts, source
assets, prior gaps, or design/module refs. Other traversals may close through
deterministic predicates, evaluator verdicts, execution evidence, proof
artifacts, external certification, human approval, or domain-specific law.

For prompt-bearing ODD SDLC edges, the installed operator derives at least:

- target-asset obligation
- evaluator-contract obligations
- requirement obligations from authority refs
- prior-gap obligations on retry handoff

Source-asset and module obligations remain materialization-specific.

The obligation surface is therefore a common carrier for completeness pressure,
not an ABG-owned definition of domain meaning.

## Obligation Payload

Every declared traversal obligation carries a payload, not only an ID.

The minimum payload records:

- payload status: `concrete`, `structural`, or `reference_only`
- source refs
- source digests where source text is available
- bounded source snippets where source text constrains the edge
- the coverage expectation that postflight applies to worker evidence

Requirement obligations must be `concrete` before a prompt-bearing handoff is
admitted. A marker-only requirement such as `REQ-X` without requirement text,
source digest, or useful source snippet is not sufficient pressure. The
operator may use `00-imported-sources.md` as a lineage/index surface, but it
must follow that ledger's source refs back to the imported authority documents
and derive the requirement payload from those documents.

`Fg_conform_project` also materializes deterministic requirement-family files
when imported bootstrap documents contain concrete requirement lines. The
family files live under `specification/requirements/NN-<family>-requirements.md`
and preserve requirement id, source ref, source digest, and bounded source
snippet. They are derived read models over bootstrap authority; they do not
replace the imported source documents or the `00-imported-sources.md` lineage
index.

Postflight also requires fulfilled requirement assessments to cite output
coverage evidence. Re-citing only the input authority ref does not prove that
the generated surface covered the requirement.

## Admission

`assertTraversalIntentPackagePressure` guards archive creation. It rejects:

- package digest drift
- identity drift between manifest and package
- missing authority refs
- missing project induction lineage for product materialization
- missing obligation pressure for prompt-bearing edges
- obligation count drift between manifest and package
- requirement obligations whose payload is `reference_only`
- missing prior gap refs on retry handoff

Postflight must reject worker result reports that omit a declared obligation
assessment, report a declared obligation as `unassessed`, add an undeclared
assessment, block an obligation without evidence, fulfill a requirement whose
payload was insufficient, or fulfill a requirement without output coverage
evidence.

## Boundary

The package does not duplicate ABG runtime truth. It references runtime and
retry truth as refs and packages the domain pressure that the SDLC worker must
consume for the current traversal.
