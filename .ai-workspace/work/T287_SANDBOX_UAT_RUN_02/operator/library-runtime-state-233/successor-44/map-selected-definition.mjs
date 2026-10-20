import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const phase = fileURLToPath(new URL('.', import.meta.url));
const diagnostic = '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-joint-proof-237/continuation-15-diagnostic/';
const selectedPins = [
  { path: diagnostic + 'freeze.json', sha256: '554401ff0273928dd2bb55774c9ec1f13603d7fd8789b0686602d3930a353635', bytes: 14186 },
  { path: diagnostic + 'selected-testing-definition.json', sha256: '7edf9e5309ccb3b12d0abd825f6232d5eb6ea2b73ecfab464f6c8e91fc433d13', bytes: 6722 },
  { path: diagnostic + 'opened-execution.json', sha256: 'ecb50118ff6ec022e446e27a83564320ac190727511350cf15d356e4b09a22b6', bytes: 17885 },
  { path: diagnostic + 'diagnostic-result.json', sha256: 'cc2f2e6a0f0b7158cc4eda4c75a965c228dbd4901ab2017dae8beafd3ca28f19', bytes: 6619 },
];
for (const pin of selectedPins) {
  const bytes = readFileSync(pin.path);
  assert.equal(bytes.length, pin.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), pin.sha256);
}
const selected = JSON.parse(readFileSync(selectedPins[1].path, 'utf8'));
const { execution } = JSON.parse(readFileSync(selectedPins[2].path, 'utf8'));
const facts = JSON.parse(readFileSync(selectedPins[3].path, 'utf8'));
const owner = name => import(pathToFileURL(phase + 'build-01/code/src/' + name).href);
const { defaultGovernanceGraphFunctions } = await owner('gtl/default_library.js');
const { canonicalizeAuthoredGtlCarrier } = await owner('gtl/canonicalization.js');
const { canonicalJson } = await owner('shared/canonical_json.js');
const { sha256Canonical: hash } = await owner('shared/digests.js');
const { materializeGraph } = await owner('gtl/materialize.js');
const raw = defaultGovernanceGraphFunctions().find(g => g.name === execution.graphFunctionRef);
const canonical = canonicalizeAuthoredGtlCarrier(raw, 'graph_function');
assert.equal(canonicalJson(canonical), canonicalJson(selected));
assert.equal(hash(canonical), execution.graphFunctionDigest);
assert.equal(hash(canonical), facts.catalog.definitionDigest);
assert.notEqual(hash(canonical), facts.catalog.entryDigest);
assert.notEqual(hash(raw), execution.graphFunctionDigest);
// The selected graph has no fan-out: the existing materializer consumes the
// exact admitted input coordinates, not a body, for this identity calculation.
// The empty placeholder below is neither the actual input nor admission proof.
assert.equal(canonical.template.applications.filter(a => a.relationKind === 'fan_out').length, 0);
const basis = { invocationAdmissionRef: execution.invocationAdmissionRef,
  admittedInputRef: execution.rawInputAdmissionRef,
  admittedInputDigest: execution.rawInputDigest, admittedInput: {} };
const graph = materializeGraph(canonical, basis), rawGraph = materializeGraph(raw, basis);
assert.equal(graph.materializationDigest, execution.graphDigest);
assert.equal(graph.materializationRef, execution.graphRef);
assert.notEqual(rawGraph.materializationDigest, execution.graphDigest);
const result = { kind: 'source44_selected_canonical_definition_correspondence', selectedPins,
  graphFunctionRef: canonical.name, canonicalDefinitionEqualsActualSelectedCompleteBody: true,
  rawDigest: hash(raw), canonicalDefinitionDigest: hash(canonical),
  actualExecutionDefinitionDigest: execution.graphFunctionDigest,
  catalogDefinitionDigest: facts.catalog.definitionDigest, catalogEntryDigest: facts.catalog.entryDigest,
  canonicalMaterialization: { ref: graph.materializationRef, digest: graph.materializationDigest },
  actualMaterialization: { ref: execution.graphRef, digest: execution.graphDigest },
  rawMaterialization: { ref: rawGraph.materializationRef, digest: rawGraph.materializationDigest },
  equality: { completeDefinition: true, materializationRef: true, materializationDigest: true },
  limits: ['Pure definition/materialization identity calculation over already frozen selected owner outputs.',
    'No fan-out input body is consumed; this is not fresh input/request/currentness/occurrence authentication.',
    'No resource acquisition, preparation callback, C2/native/model/worksite or admission operation.'] };
writeFileSync(phase + 'selected-definition-correspondence.json', JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ canonicalDefinitionDigest: result.canonicalDefinitionDigest,
  actualMaterialization: result.actualMaterialization, equality: result.equality }) + '\n');
