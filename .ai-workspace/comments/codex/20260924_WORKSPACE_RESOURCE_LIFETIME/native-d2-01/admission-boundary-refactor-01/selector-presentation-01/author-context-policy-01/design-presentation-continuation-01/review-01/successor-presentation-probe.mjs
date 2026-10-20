// Read-only component counterexample. No runtime acquisition, admission or actor.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';

const root = '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const directory = '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/admission-boundary-refactor-01/selector-presentation-01/author-context-policy-01';
const load = name => import(pathToFileURL(join(root, 'build/code/src', name + '.js')).href);
const { sha256Canonical: hash, sha256Bytes } = await load('shared/digests');
const { canonicalJson } = await load('shared/canonical_json');
const { SEMANTIC_REVISION_IDS: R } = await load('gtl/semantic_revision_identity');
const product = await load('product/semantic_revision');
const { projectSemanticJobBindings } = await load('product/semantic_job');
const size = value => Buffer.byteLength(canonicalJson(value));
const retained = JSON.parse(fs.readFileSync(join(directory, 'design-bound-diagnosis-01/design-input.json'))).targets[0].event.payload;
const parent = retained.rawInputValue;
assert.equal(hash(parent), 'sha256:b18bc0a6c74426fdf145ca3a9bf4e9275816b2fab8643271468c7c906f19d185');
const stage = parent.current.declaration.stages[parent.current.assets.length];
assert.equal(stage.declarationRef, 'stage://odd-glc/generic-lifecycle/design@5');
const publication = JSON.parse(fs.readFileSync(join(directory, 'publication-01/prospective-publication.json')));
const prompt = fs.readFileSync(join(directory, 'installed-01/preparation/invocation/archives/fp-551946c5d41986bb-prompt.txt'), 'utf8');
const chunks = prompt.split(/^## (\w+)\n/m);
const preceding = Object.fromEntries(Array.from({ length: (chunks.length - 1) / 2 }, (_, i) => [chunks[i * 2 + 1], JSON.parse(chunks[i * 2 + 2])]));
const roles = publication.runEnvironments.flatMap(e => e.roles).filter(r => r.graphFunctionRef === retained.graphFunctionRef && r.programLocusRef === stage.authorLocusRef && r.role === 'author');
assert(roles.length && roles.every(r => hash(r) === hash(roles[0])));
const role = roles[0];
const sourceContent = role.sourceBindings.filter((b, i, rows) => rows.findIndex(x => hash(x) === hash(b)) === i).map(b => {
  const row = preceding.role.environment.sourceContent.find(row => Object.entries(b).every(([key, value]) => row[key] === value));
  assert(row); assert.equal(sha256Bytes(Buffer.from(row.text)), b.spanDigest); return row;
});

// Future acquisition/selection/witness coordinates do not exist. Keep their
// existing retained carrier premises explicit, and vary only the declared
// stage choice. This is a pure Product successor construction, never claimed
// to be an admitted or currently authorized request.
const selection = { ...parent.revisionBasis.selection, selectedStageRef: stage.declarationRef,
  selectedObligationRefs: projectSemanticJobBindings(parent.current).map(row => row.binding.obligationRef),
  selectedTargetRefs: [] };
const request = { ...parent.revisionBasis.request,
  selectionChoice: { mode: 'stage_revision', selectedStageRef: stage.declarationRef },
  nativeWorksite: { ...parent.revisionBasis.request.nativeWorksite, context: parent.current.context } };
const successor = product.deriveSemanticJobRevision(parent, request, selection, null, null);
assert(successor && product.isSemanticJobRevisionEnvelope(successor));
assert.deepEqual(successor.current.assets, parent.current.assets);
assert.deepEqual(successor.current.job, parent.current.job);
assert.equal(successor.revisionBasis.parentRevisionRef, parent.revisionBasis.basisRef);
assert(parent.revisionBasis.historicalAssets.every(a => successor.revisionBasis.historicalAssets.some(b => hash(a) === hash(b))));
assert(parent.current.assets.every(a => successor.revisionBasis.historicalAssets.some(b => hash(a) === hash(b))));

let input = parent, capture;
const call = { cCallRef: 'component:retained-design', cCallDigest: hash('component-call'), graphFunctionRef: retained.graphFunctionRef,
  programLocusRef: stage.authorLocusRef, inputContractRef: R.envelopeContractRef, implementationRef: R.authorImplementationRef };
const owner = () => ({ role: 'author', stage, lifecycle: input.current.declaration, events: [], call,
  inputDigest: hash(input), inputRef: retained.rawInputAdmissionRef, execution: retained });
const stdo = () => ({ invocationAdmissionRef: retained.invocationAdmissionRef, environmentRef: 'component:retained-role',
  environmentDigest: hash('component-environment'), evidenceDigest: hash('component-evidence'), role: 'author', policy: role.policy,
  contextPolicy: role.contextPolicy, contextPolicyDigest: hash(role.contextPolicy), frameRefs: role.frameRefs, sourceContent,
  accessContent: preceding.evidence.environmentAccess });
const overrides = {
  './execution_basis.js': { constructNativeInstructionAssemblyBasis: b => b },
  './semantic_job.js': { authenticateSemanticJobBasis: owner },
  './semantic_revision.js': { semanticJobRevisionInputMatchesBasis: () => true, projectJobRevisionSubject: () => ({ currentWorksite: null, origins: [] }) },
  './stdo_environment.js': { projectRunEnvironmentRoleEvidence: stdo },
  '../gtl/c_algebra.js': { cLeafTerms: () => [{ programLocusRef: call.programLocusRef }] },
  '../gtl/stdo_run_environment.js': { nativeContextLeafFamily: () => 'author' },
};
const modulePath = join(root, 'build/code/src/abg/instruction_assembly.js');
const original = fs.readFileSync(modulePath, 'utf8');
assert.equal(sha256Bytes(Buffer.from(original)), 'sha256:447ba8ef595cbe6fe7c61f85f55d86fbdd3c5a25a29c80234e2a3b07939f6774');
const marker = 'if (bytes.length > stage.assembly.maxPromptBytes)';
assert.equal(original.split(marker).length, 2);
// One observational insertion in the isolated module records the same complete
// sections before its unchanged bound guard. It neither changes a return nor
// raises the bound. Source and emitted files remain untouched.
globalThis.__d2ReviewCapture = value => { capture = value; };
const code = original.replace(marker, 'globalThis.__d2ReviewCapture({ sections, prompt });\n    ' + marker);
const module = new SourceTextModule(code, { identifier: modulePath });
await module.link(async specifier => {
  const native = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(modulePath), specifier)).href);
  const values = { ...native, ...overrides[specifier] };
  return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
});
await module.evaluate();
const basis = { publication, graphFunction: { template: { nodes: [{ term: {} }] } }, cCall: call, predecessorPrefix: { fixture: true } };
const oldResult = module.namespace.evaluateNativeInstructionAssembly(basis, input);
assert.equal(oldResult.kind, 'native_instruction_assembly');
const oldCapture = capture;
assert.equal(Buffer.byteLength(oldCapture.prompt), 937078);
input = successor;
const nextResult = module.namespace.evaluateNativeInstructionAssembly(basis, input);
assert.equal(nextResult.kind, 'native_instruction_assembly_refusal');
assert.equal(nextResult.cause, 'declared_bound_overflow');
assert.deepEqual(nextResult.unresolvedRefs, ['maxPromptBytes']);
const historicalRefs = new Set(parent.revisionBasis.historicalAssets.map(a => a.assetRef));
console.log(JSON.stringify({
  scope: 'Pure Product successor plus exact frozen component renderer; not installed or admitted authority',
  assumptions: 'Existing retained request/acquisition/selection-coordinate and worksite premises; authentication/currentness/role evidence supplied exactly as the frozen component test. Future runtime coordinates are not claimed.',
  instrumentation: 'Single observation immediately before unchanged prompt bound guard',
  parentInputDigest: hash(parent), componentSuccessorDigest: hash(successor),
  oldPromptBytes: Buffer.byteLength(oldCapture.prompt), successorPromptBytes: Buffer.byteLength(capture.prompt),
  boundBytes: stage.assembly.maxPromptBytes, overBoundBytes: Buffer.byteLength(capture.prompt) - stage.assembly.maxPromptBytes,
  priorHistoryBytes: size(parent.revisionBasis.historicalAssets), successorHistoryBytes: size(successor.revisionBasis.historicalAssets),
  newlyRetainedHistory: successor.revisionBasis.historicalAssets.filter(a => !historicalRefs.has(a.assetRef)).map(a => ({ assetRef: a.assetRef, assetDigest: a.assetDigest, stageRef: a.stageRef, bytes: size(a), assessment: a.assessment.disposition })),
  sections: Object.fromEntries(Object.entries(capture.sections).map(([key, value]) => [key, { oldBytes: size(oldCapture.sections[key]), successorBytes: size(value) }])),
  result: nextResult, acceptedAssetsUnchanged: true, allHistoricalAssetsRetained: true, sourceJobUnchanged: true,
}, null, 2));
delete globalThis.__d2ReviewCapture;
