// Actual external helper checks only; framework owners are not imported here.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {assertSelectedSourceDelta,assertDeltaFlatViews} from './source-delta-contract.mjs';
const report=dirname(dirname(fileURLToPath(import.meta.url)));
const read=async n=>JSON.parse(await readFile(join(report,n),'utf8'));
const write=v=>writeFile(join(report,'delta-preflight-readiness.json'),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
try{
 const contract=await read('f11/current-source-delta.json'),pin=await read('f11/current-source-delta-pin.json');
 const bytes=await readFile(pin.path);
 assert.equal(bytes.length,pin.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256);
 const origins=(await read('f11/source-authorship-records.json')).sourceOrigins;
 const supplier=await read('current-source-supplier-view.json');
 assertDeltaFlatViews(contract,origins,supplier);
 const additions=contract.sourceChanges.filter(row=>row.changeKind==='addition');
 assert.equal(additions.length,contract.additionCount);
 assert.ok(additions.every(row=>Object.keys(row.copyRoles.selectedOrigin.fields).length===0));
 const cases=[
  ['missing',rows=>rows.pop()],
  ['extra-inherited-callback',rows=>rows.push({...structuredClone(rows[0]),path:'build_tenants/abiogenesis/typescript/test_env/tests/t287-result-evidence-lineage-projection.test.mjs'})],
  ['duplicate',rows=>{rows[rows.length-1]=structuredClone(rows[0]);}],
  ['wrong-cut',rows=>{rows[0].selectedCut.sha256='0'.repeat(64);}],
  ['wrong-postimage',rows=>{rows[0].postimage.sha256='0'.repeat(64);}],
  ['wrong-source-author',rows=>{rows[0].sourceAuthor='source-author://counterfeit';}],
  ['falsely-anchored-historical-copy',rows=>{rows[0].copyRoles.selectedOrigin.fields.copyBuildAuthor=rows[0].copyRoles.currentSupplier.fields.copyBuildAuthor;}],
  ['falsely-anchored-current-copy',rows=>{rows[0].copyRoles.currentSupplier.constructionActivation.sha256='0'.repeat(64);}],
  ['invented-addition-history',rows=>{rows.find(row=>row.changeKind==='addition').copyRoles.selectedOrigin.fields.copyBuildAuthor='historical-copy://invented';}]
 ];
 const negatives=[];
 for(const [name,mutate]of cases){
  const rows=structuredClone(contract.sourceChanges);mutate(rows);let error;
  try{assertSelectedSourceDelta(rows,contract);}catch(e){error=e;}
  assert.ok(error,'negative unexpectedly accepted: '+name);
  negatives.push({name,outcome:'refused',message:error.message});
 }
 await write({status:'CLOSED',workResult:'GO_CHEAP_ROLE_AWARE_DELTA_PREFLIGHT',operation:'T287_FINAL_QUALIFICATION_INPUTS_14',sourceChanges:contract.changeCount,replacements:contract.replacementCount,additions:contract.additionCount,deltaRef:contract.deltaRef,deltaDigest:contract.deltaDigest,completeUniqueSourceAndOwnCopyRoleCorrespondence:true,legitimateAdditionsRetainHistoricalAbsence:true,inheritedCallbackExcluded:true,negatives,allNegativesRefused:true,ProductImports:0,materialBodiesMaterialized:0,RuntimeEffects:0});
 process.stdout.write(JSON.stringify({workResult:'GO_CHEAP_ROLE_AWARE_DELTA_PREFLIGHT',sourceChanges:contract.changeCount,negatives:negatives.length})+'\n');
}catch(error){
 await write({status:'CLOSED',workResult:'NO_GO',frontier:'cheap external source delta contract',error:{name:error.name,message:error.message,stack:error.stack},ProductImports:0,RuntimeEffects:0,noAutonomousRepair:true});
 process.stderr.write(error.stack+'\n');process.exitCode=2;
}
