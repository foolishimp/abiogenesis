import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const inputs = JSON.parse(await readFile(new URL('./calculation-inputs.json', import.meta.url), 'utf8'));
for (const pin of inputs.pins) {
  const bytes = await readFile(pin.path);
  if (bytes.length !== pin.bytes || createHash('sha256').update(bytes).digest('hex') !== pin.sha256)
    throw new Error('selected frozen input mismatch: ' + pin.path);
}
const owner = name => import(pathToFileURL(inputs.buildRoot + '/' + name).href);
const library = await owner('gtl/default_library.js');
const c2 = await owner('gtl/worksite_command_execution.js');
const canonical = await owner('gtl/canonicalization.js');
const { canonicalJson } = await owner('shared/canonical_json.js');
const { sha256Canonical: hash } = await owner('shared/digests.js');
const { materializeGraph } = await owner('gtl/materialize.js');

function differences(left, right, path = '') {
  if (canonicalJson(left) === canonicalJson(right)) return [];
  if (Array.isArray(left) || Array.isArray(right) || left === null || right === null ||
      typeof left !== 'object' || typeof right !== 'object') return [{ path, authored: left, published: right }];
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].flatMap(key =>
    differences(left[key], right[key], path + '/' + key));
}
const basis = {
  invocationAdmissionRef: 'pure-calculation://continuation15/non-admitted-invocation',
  admittedInputRef: 'pure-calculation://continuation15/non-admitted-input',
  admittedInputDigest: hash({}), admittedInput: {},
};
function compare(authored, published) {
  const canonicalFunction = canonical.canonicalizeAuthoredGtlCarrier(authored, 'graph_function');
  const authoredGraph = materializeGraph(authored, basis);
  const publishedGraph = materializeGraph(published, basis);
  const canonicalGraph = materializeGraph(canonicalFunction, basis);
  return {
    graphFunctionRef: authored.name,
    authoredDigest: hash(authored), publishedDigest: hash(published),
    canonicalOwnerDigest: hash(canonicalFunction),
    canonicalOwnerEqualsPublished: canonicalJson(canonicalFunction) === canonicalJson(published),
    exactDifferences: differences(authored, published),
    materialization: {
      premise: inputs.pureMaterializationPremise,
      templateDigest: hash(authoredGraph.template),
      templateEqual: canonicalJson(authoredGraph.template) === canonicalJson(publishedGraph.template),
      fanOutMaterializationsEqual: canonicalJson(authoredGraph.fanOutMaterializations) === canonicalJson(publishedGraph.fanOutMaterializations),
      authored: { graphFunctionDigest: authoredGraph.graphFunctionDigest, materializationDigest: authoredGraph.materializationDigest, materializationRef: authoredGraph.materializationRef },
      published: { graphFunctionDigest: publishedGraph.graphFunctionDigest, materializationDigest: publishedGraph.materializationDigest, materializationRef: publishedGraph.materializationRef },
      canonicalOwnerEqualsPublished: canonicalJson(canonicalGraph) === canonicalJson(publishedGraph),
      exactDifferentFields: differences(authoredGraph, publishedGraph).map(row => row.path),
    },
  };
}
const authoredTesting = library.defaultGovernanceGraphFunctions().find(g => g.name === inputs.actualCatalogTesting.ref);
const publishedTesting = library.constructDefaultGovernanceLibraryModulePublication(inputs.artifactBasis).graphFunctions.find(g => g.name === inputs.actualCatalogTesting.ref);
if (!authoredTesting || !publishedTesting) throw new Error('selected Testing definition absent');
const testing = compare(authoredTesting, publishedTesting);
testing.actualCatalogDigest = inputs.actualCatalogTesting.digest;
testing.publishedEqualsActualCatalog = testing.publishedDigest === inputs.actualCatalogTesting.digest;
if (!testing.publishedEqualsActualCatalog || !testing.canonicalOwnerEqualsPublished || !testing.materialization.canonicalOwnerEqualsPublished)
  throw new Error('actual Catalog/canonical publication correspondence not established');
const authoredStandalone = c2.nativeWorkReacquisitionGraphFunction();
const publishedStandalone = c2.constructWorksiteCommandExecutionModulePublication(inputs.artifactBasis).graphFunctions.find(g => g.name === authoredStandalone.name);
if (!publishedStandalone) throw new Error('standalone reacquisition declaration absent');
const standalone = compare(authoredStandalone, publishedStandalone);
const result = {
  kind: 'continuation15_pure_definition_identity_result',
  testing, standalone,
  supportedBlocker: 'The native occurrence owner hashes and materializes the authored Testing wrapper, whereas the admitted canonical publication has a different complete GraphFunction digest. Both the definition identity guard and the subsequent materialization identity must consume the existing canonical owner representation.',
  scope: 'Pure frozen43 definition calculation joined to the actual15 admitted Catalog Testing digest. No actual opened execution basis or occurrence request was reprojected.',
  exclusiveActualRefusalConjunctEstablished: false,
  authorityOrRuntimeEffects: false,
};
await writeFile(new URL('./calculation-result.json', import.meta.url), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ testing: { authoredDigest: testing.authoredDigest, publishedDigest: testing.publishedDigest, publishedEqualsActualCatalog: testing.publishedEqualsActualCatalog, differences: testing.exactDifferences, materializationDifferentFields: testing.materialization.exactDifferentFields }, standalone: { authoredDigest: standalone.authoredDigest, publishedDigest: standalone.publishedDigest, differences: standalone.exactDifferences } }) + '\n');
