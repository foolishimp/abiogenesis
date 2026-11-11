import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const packageRoot=process.env.ABI5_ENV_TEST_PACKAGE_ROOT??resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const load=path=>import(pathToFileURL(join(packageRoot,'build/code/src',path+'.js')).href);
const semantic=await load('product/semantic_stage');

// Retired (T-292 TD-31): 'RC7 source citation boundary: real corpus access, both compiled role assemblies and unchanged grounding'; its subject is the retired STDO declaration, observation and evidence.

test('preserved failed RC6 output still has thirteen valid quotes and one ineligible role-frame quote',async t=>{
  if(!process.env.ABI5_ENV_PRIOR_EVENTS){t.skip('ABI5_ENV_PRIOR_EVENTS unset; requires preserved failed pilot history');return;}
  const bytes=await readFile(process.env.ABI5_ENV_PRIOR_EVENTS),events=bytes.toString('utf8').trim().split('\n').map(JSON.parse);
  const priorDeclaration=events.find(e=>e.kind==='invocation_admitted'&&e.payload.stdoEnvironment).payload.stdoEnvironment.declaration;
  assert.equal(priorDeclaration.source.releaseUri,'stdo://releases/v2.5.0-rc.6/');
  // Retired (T-292 TD-31): 'retained exact RC6 declaration remains supported'; no live predicate admits the retired shape, so the recorded declaration is read as data only.
  const source=events.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='requirement_handoff_output').payload.value;
  const raw=JSON.parse(events.find(e=>e.kind==='actor_result_artifact_observed').payload.finalOutput);
  const quotes=raw.statements.flatMap(s=>s.sourceQuotes),results=quotes.map(q=>({memberRef:q.memberRef,grounded:semantic.groundSemanticSourceQuote(source,q)!==null}));
  assert.equal(results.filter(r=>r.grounded).length,13);assert.equal(results.filter(r=>!r.grounded).length,1);
  assert.equal(results.find(r=>!r.grounded).memberRef,'member://stdo-note.example/role-frame@5');
  assert.deepEqual(await readFile(process.env.ABI5_ENV_PRIOR_EVENTS),bytes,'historical bytes are read only');
});
