// Root-only predictive capacity check. No native owner/admission result is fabricated.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export async function measureSelectorCapacity({input,observation,installedRoot,campaign,product}){
 const {projectFramedSynthesisPromptTask}=await import(pathToFileURL(join(installedRoot,'build/code/src/product/default_library.js')));
 const renderer=await readFile(join(installedRoot,'build/code/src/abg/instruction_assembly.js'),'utf8');
 assert(renderer.includes('return order.map(name => `## ${name}\\n${canonicalJson(sections[name])}`).join("\\n\\n");'),'Installed renderer format changed');
 const priorPath=join(campaign,'runtime-001/resources/archives/fp-0141c53486056a96-prompt.txt'),prior=await readFile(priorPath);
 const parts=prior.toString('utf8').split(/(?:^|\n\n)## ([a-z]+)\n/),sections={};
 for(let i=1;i<parts.length;i+=2)sections[parts[i]]=JSON.parse(parts[i+1]);
 sections.task=projectFramedSynthesisPromptTask({kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:input,context:observation});
 const prompt=['role','choices','task','binding','evidence','response'].map(name=>'## '+name+'\n'+product.canonicalJson(sections[name])).join('\n\n');
 const promptBytes=Buffer.byteLength(prompt),reserveBytes=65536;
 return {kind:'predictive_selector_capacity',installedRendererSha256:createHash('sha256').update(renderer).digest('hex'),
  historicalOtherSections:{path:priorPath,sha256:createHash('sha256').update(prior).digest('hex')},
  currentContextDigest:observation.observationDigest,currentInputDigest:product.sha256Canonical(input),sourceCount:input.original.sources.length,
  taskProjectionBytes:Buffer.byteLength(product.canonicalJson(sections.task)),promptBytes,promptBound:input.original.maxPromptBytes,reserveBytes,
  fitsWithReserve:promptBytes+reserveBytes<input.original.maxPromptBytes,providerCalls:0,RunAdmissions:0,
  limits:['Actual installed owner task projection and renderer format; other sections are exact prior RC4 selector sections with controlled historical bindings.',
   'Predictive operator check with64KiB reserve, not native assembly/admission or a proof of all future role contexts. Runtime owners remain authoritative.']};
}
