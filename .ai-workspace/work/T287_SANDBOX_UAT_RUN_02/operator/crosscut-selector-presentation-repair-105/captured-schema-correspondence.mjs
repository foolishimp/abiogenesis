import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as product from './isolated/build/code/src/product/index.js';
import {defaultGovernanceGraphFunctions} from './isolated/build/code/src/gtl/default_library.js';

// Phase-only conservation check. These are retained native input bytes, not a
// new reusable test fixture, source authority or authenticated occurrence.
const archive = '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T09-59-49-674Z-81e3a186-a2d9-42e0-bcc1-131eefcda893';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = await readFile(archive + '/resources/events/runtime.events.jsonl');
assert.equal(bytes.length, 5271934);
assert.equal(digest(bytes), '5dc5c5f9f12087a1daeb53f88c251ef2af844a9dc50743f7dac8d27e30895a50');
const rows = bytes.toString('utf8').trim().split('\n').map(line => JSON.parse(line));
const inputs = rows.filter(row => row.kind === 'c_call_result_admitted' && row.payload.value?.kind === 'framed_synthesis_task');
assert.equal(inputs.length, 1);
const input = inputs[0], task = input.payload.value;
assert.equal(input.admissionOrdinal, 40);
assert.equal(input.payload.resultRef, 'result://abiogenesis/c6098b23d32b8481c9f39dcdc7be84ed2ad3bcd1f6c2843cea6481cebd0bafe4');
assert.equal(product.sha256Canonical(task), input.payload.valueDigest);
assert.equal(product.isFramedSynthesisTask(task), true);
const transportBytes = await readFile(archive + '/resources/archives/fp-c2784cfcc5f72abe-transport.json');
assert.equal(digest(transportBytes), 'd7dcac0f7874d17db87611d6df79926bb683d6e064a8357278e1ff17be57614c');
const transport = JSON.parse(transportBytes), wireText = transport.args[transport.args.indexOf('--json-schema') + 1];
assert.equal(digest(wireText), '033fe8a29bcec6761a9dfaff23ebfd4b88c1a180367bab9c3448e3bb7db91106');
const targets = defaultGovernanceGraphFunctions().filter(row => row.declarations['abg.default_library_purpose']).map(row => ({
  graphFunctionRef: row.name, definitionDigest: product.sha256Canonical(row), purpose: row.declarations['abg.default_library_purpose'],
}));
const schema = product.framedSynthesisResponseSchema(task, targets);
assert.deepEqual(schema, JSON.parse(wireText));
assert.equal(product.sha256Canonical(schema), product.sha256Canonical(JSON.parse(wireText)));
console.log(JSON.stringify({kind:'captured_101_schema_conservation',inputResultRef:input.payload.resultRef,inputValueDigest:input.payload.valueDigest,
  canonicalSchemaDigest:product.sha256Canonical(schema),wireBytes:Buffer.byteLength(wireText),wireSha256:digest(wireText),
  rootAnyOfRetained:schema.anyOf.length,sourceObservationCount:task.state.observations.length,fullCanonicalSchemaEqualsFailedWire:true,
  claim:'pure existing-owner schema projection only; no native authentication/dispatch/provider adequacy'}));
