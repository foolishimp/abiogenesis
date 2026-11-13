// Predictive formatting only: no future admitted task, producer or assessment is created.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here=dirname(fileURLToPath(import.meta.url)),x=dirname(here),old=join(x,'native-06');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex'),bytes=s=>Buffer.byteLength(s);
const taskBytes=await readFile(join(old,'ACTUAL_UAT_TASK.json'));
assert.equal(sha(taskBytes),'f8d585d107f847decc652cef2f93a230c1f0b863e5e4d763c3d22bd77aba9455');
const baseline=JSON.parse(taskBytes),w=await read(join(here,'workload.json'));
const retained=await read(join(old,'execution/resume.json'));
const ownerPath=join(retained.installedRoot,'build/code/src/product/native_workspace_work.js');
const {renderNativeWorkspaceWorkOrder}=await import(pathToFileURL(ownerPath));
const {canonicalJson}=await import(pathToFileURL(join(retained.installedRoot,'build/code/src/shared/canonical_json.js')));
const roles=await read(join(old,'uat-capacity-triage-001/actual-role-content.json'));
const role=roles.roles.find(r=>r.role==='assessor').content;
const rolePrefix='Declared role context:\n'+canonicalJson(role)+'\n\n';
const diagnostic=structuredClone(baseline);
const producerInstruction=diagnostic.instructions[9],offset=producerInstruction.indexOf('{');
const producer=JSON.parse(producerInstruction.slice(offset));
const pack=producer.commandResults.find(r=>r.ordinal===5),meta=JSON.parse(pack.stdout.text)[0];
const compact=meta.filename+'\n';
pack.stdout={byteLength:bytes(compact),digest:'sha256:'+sha(compact),encoding:'utf8',text:compact};
diagnostic.instructions[9]=producerInstruction.slice(0,offset)+JSON.stringify(producer);
diagnostic.instructions[1]=w.workOrders.uat.instructions.join('\n');
diagnostic.instructions[2]='Conserved original task: '+w.task;
diagnostic.instructions[6]='Governing full-original assessment outcome: '+w.task;
diagnostic.outcome=w.workOrders.uat.outcome;
diagnostic.context.readRoots=w.readRoots;
diagnostic.readFirst=[...new Set([...baseline.readFirst.map(p=>p.replaceAll('native-06','native-07')),...w.workOrders.uat.readFirst,...w.assessment.sources])];
diagnostic.assessment.sources=w.sources.filter(s=>s.path!==w.assessment.rubricPath);
diagnostic.checks=w.workOrders.uat.checks;
diagnostic.writeRoots=w.workOrders.uat.writeRoots;
const rendered=renderNativeWorkspaceWorkOrder(diagnostic),prompt=rolePrefix+rendered;
const reserveBytes=131072;
const report={kind:'predictive_final_control_assessor_capacity',recordedUtc:new Date().toISOString(),
  standing:'Pure installed-renderer diagnostic using actual closed role bytes, current control text/scopes/source pins and a labelled baseline C2 producer with compact pack stdout. Not a future owner task, assembly basis, admission, Result or assessment.',
  baselineTaskSha256:sha(taskBytes),workloadSha256:sha(await readFile(join(here,'workload.json'))),
  installedRendererSha256:sha(await readFile(ownerPath)),actualRolePrefixBytes:bytes(rolePrefix),
  selectedReadRoots:w.readRoots.length,diagnosticReadFirst:diagnostic.readFirst.length,
  currentAssessmentSources:diagnostic.assessment.sources.length,compactPackStdoutBytes:bytes(compact),
  workOrderBytes:bytes(rendered),promptBytes:bytes(prompt),promptSha256:sha(prompt),
  maxPromptBytes:w.maxPromptBytes,reserveBytes,headroomBytes:w.maxPromptBytes-bytes(prompt),
  fitsWithReserve:bytes(prompt)+reserveBytes<w.maxPromptBytes,providerCalls:0,RunAdmissions:0,
  limits:['Baseline admitted identity/parent/planner/producer fields remain historical labels only. Actual future diagnostic streams, planning and source handoffs may differ.',
    'The baseline full proof stdout is retained in this estimate; selected wrapper removes that duplicate. Current compact archive/report custody remains required.',
    '128KiB additional reserve is an operator allowance, not proof of every future context. Actual installed assembly remains authoritative and fail-closed.']};
await writeFile(join(here,'DOWNSTREAM_CAPACITY_PREFLIGHT.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
assert(report.fitsWithReserve,'Current downstream predictive capacity does not fit unchanged cap with reserve');
console.log(JSON.stringify({status:'PREDICTIVE_DOWNSTREAM_CAPACITY_FITS',promptBytes:report.promptBytes,maxPromptBytes:report.maxPromptBytes,headroomBytes:report.headroomBytes,reserveBytes}));
