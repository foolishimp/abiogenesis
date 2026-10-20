import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const D=import.meta.dirname,read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const control=read(join(D,'control.json')),timing=read(join(D,'timing.json'));
const product=await import(pathToFileURL(join(control.core.packageRoot,'build/code/src/product/index.js')).href);
const save=(n,v)=>fs.writeFileSync(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const old=read(control.baselineResult.resultPath),fresh=read(join(D,'result.json'));
const same=(a,b)=>product.sha256Canonical(a)===product.sha256Canonical(b);
const checks={processSucceeded:timing.exitCode===0&&!timing.timedOut,
 normalTransport:fresh.kind==='installed_definition_call_transport_result',
 historicalClose:same(fresh.receipt?.resources?.eventResource?.closeHandoff?.prefix??null,control.genuineClose),
 publicResult:fresh.receipt?.exitCode===0&&fresh.receipt?.ownerOutput?.outcomeKind==='result'};
const p=fresh.receipt?.ownerOutput?.value?.projection,prior=old.receipt.ownerOutput.value.projection;
if(p?.terminalResult){
 const t=p.terminalResult;
 Object.assign(checks,{runIdentity:same(p.subject,control.historicalRun),resultIdentity:same(p.result,control.historicalResult),
 historicalProducer:same(t.producer,prior.terminalResult.producer),sourceProjectionBasis:same(t.projectionBasis,prior.terminalResult.projectionBasis),
 terminalRoute:same(p.terminalRoute,prior.terminalRoute),typedContract:same(t.contract,prior.terminalResult.contract),
 typedValueDigest:t.valueDigest===prior.terminalResult.valueDigest&&product.sha256Canonical(t.value)===t.valueDigest,
 typedValueSchema:product.isSemanticJobEnvelope(t.value),entireProjection:same(p,prior),
 nonClosingCoverage:t.value.applicationCoverage==='non_closing'&&t.value.applicationCoverage===prior.terminalResult.value.applicationCoverage,
 historicalSource:same(t.value.job,prior.terminalResult.value.job)&&same(t.value.basis,prior.terminalResult.value.basis)});
 save('terminal-summary.json',{run:p.subject,result:p.result,replay:p.replay,terminalRoute:p.terminalRoute,
 producer:t.producer,projectionBasis:t.projectionBasis,valueKind:t.valueKind,valueDigest:t.valueDigest,
 kind:t.kind,sourceBasis:t.value.basis,applicationCoverage:t.value.applicationCoverage,
 remainingGaps:t.value.remainingGaps??null,assessments:t.value.assets.map(a=>({stageRef:a.stageRef,disposition:a.assessment?.disposition??null})),
 status:'successful terminal Public Result; no separate status or replay port called'});
}
const stat=fs.statSync(fileURLToPath(control.genuineClose.eventLogRef),{bigint:true});
const after={device:Number(stat.dev),inode:Number(stat.ino),bytes:Number(stat.size),mtimeNs:stat.mtimeNs.toString()};
checks.physicalIdentityAndExtent=after.device===control.journalBefore.device&&after.inode===control.journalBefore.inode&&after.bytes===control.journalBefore.bytes;
const stderr=fs.readFileSync(join(D,'read.stderr'),'utf8');const rss=Number(stderr.match(/^\s*(\d+)\s+maximum resident set size$/m)?.[1]??0);
const elapsedBaseline=control.baselineResult.elapsedMs/1000;
save('comparison.json',{checks,passed:Object.values(checks).every(Boolean),freshReceiptPath:join(D,'result.json'),
 ownerDisposition:fresh.receipt?.ownerOutput??null,comparisonDisposition:p?.terminalResult?'terminal_result_compared':'unavailable_owner_refusal_no_result',
 baselineReceiptPath:control.baselineResult.resultPath,baselineReceiptSha256:await product.sha256File(control.baselineResult.resultPath),
 freshReceiptSha256:await product.sha256File(join(D,'result.json')),requestReusedUnchanged:control.requestReusedUnchanged,
 sourceCore:control.core.basis,originalClose:control.genuineClose,journalAfter:after,
 timing:{freshSeconds:timing.elapsedSeconds,baselineSeconds:elapsedBaseline,observedSecondsDifference:p?.terminalResult?timing.elapsedSeconds-elapsedBaseline:null,
 observedRatio:p?.terminalResult?timing.elapsedSeconds/elapsedBaseline:null,peakRssBytes:rss,limit:'Separate historical observations, not a controlled benchmark. Refused read is not comparable to the successful baseline Result read. Baseline includes caller checks; fresh timing is supervised CLI wall time. No actor or full-native performance claim.'}});
console.log(JSON.stringify({boundary:p?.terminalResult?'public_result_compared':'public_read_refusal_preserved',checks,elapsedSeconds:timing.elapsedSeconds,peakRssBytes:rss,valueDigest:p?.terminalResult?.valueDigest??null}));
