// Pure existing native renderer; no assembly/admission/transport is asserted.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {constructionAssessmentTask} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/program-construction-runtime.mjs';
const start=performance.now(),root='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-06';
const {renderNativeWorkspaceWorkOrder}=await import(pathToFileURL(process.env.ABI5_COMPONENT_ROOT+'/build/code/src/product/native_workspace_work.js'));
const retained=JSON.parse(await fs.readFile(root+'/execution/terminal-value.json','utf8'));
const task=constructionAssessmentTask(retained.assessmentInput),old=renderNativeWorkspaceWorkOrder(retained.assessmentObservation.task),next=renderNativeWorkspaceWorkOrder(task);
const prompt=await fs.readFile(root+'/invocation/archives/fp-acf53f1bff5e640d-prompt.txt','utf8');
assert.equal(prompt.split(old).length,2);assert(task.instructions.every(s=>next.includes(s)));
const result={scope:'pure native order rendering, same archived role prefix; not installed assembly or dispatch',
  nativeOrderBefore:Buffer.byteLength(old),nativeOrderAfter:Buffer.byteLength(next),archivedPromptBefore:Buffer.byteLength(prompt),
  projectedSameRolePromptAfter:Buffer.byteLength(prompt.replace(old,next)),growth:Buffer.byteLength(next)-Buffer.byteLength(old),elapsedMs:performance.now()-start};
await fs.writeFile(import.meta.dirname+'/render-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
