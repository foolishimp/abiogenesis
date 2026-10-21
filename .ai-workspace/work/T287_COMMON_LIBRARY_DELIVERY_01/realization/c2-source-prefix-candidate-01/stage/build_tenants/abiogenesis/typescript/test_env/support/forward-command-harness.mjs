import assert from 'node:assert/strict';
import path from 'node:path';
import * as productBase from '../../build/code/src/product/index.js';
import * as command from '../../build/code/src/product/worksite_command_execution.js';
import * as effect from '../../build/code/src/product/worksite_effect.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as forward from '../../build/code/src/abg/worksite_command_forward.js';
import {ROOT_EVENT_CONTRACT_DIGEST} from '../../build/code/src/abg/event_store.js';
import {constructForwardComponentInput} from '../fixtures/forward-command/input.mjs';
const product={...productBase,...command,...effect};
export {product,gtl,validator,forward};
export const packageRoot=path.resolve(import.meta.dirname,'../..');
export const hash=product.sha256Canonical;
let component;
// Supplied component premises only; no journal, native admission or physical proof.
export function componentSource(){return component??=constructForwardComponentInput(product,ROOT_EVENT_CONTRACT_DIGEST);}
export function declarations(){
  const artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,
    artifactDigest:hash('uninstalled forward package'),productContentDigest:hash('uninstalled forward content'),productManifestDigest:hash('uninstalled forward manifest')};
  const publication=gtl.constructWorksiteCommandForwardModulePublication(artifact),legacy=gtl.constructWorksiteCommandExecutionModulePublication(artifact);
  const program=publication.programs.find(p=>p.programRef===product.WORKSITE_COMMAND_FORWARD_IDS.programRef);assert.ok(program);
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract://mechanical/forward/raw');assert.equal(r.kind,'raw_admitted_value');return r;};
  const pub=raw(publication,'module_publication');
  const validate=(mutate=x=>x)=>validator.validateProgram(mutate({declarationBasisDigest:pub.subjectDigest,programPublication:pub,
    program:raw(program,'gtl_program'),graphFunctions:publication.graphFunctions.map(g=>raw(g,'graph_function')),
    contracts:[...legacy.contracts,...publication.contracts].map(c=>raw(c,'contract_declaration')),
    implementationBindings:publication.implementationBindings.map(b=>raw(b,'implementation_binding')),
    closureContracts:publication.closureContracts.map(c=>raw(c,'closure_contract')),rules:[],evaluators:[]}));
  return {artifact,publication,legacy,program,validate,raw};
}
// Carrier-only currentness assumptions; these coordinates are intentionally
// NOT authenticated by the native forward relation or an installed Program.
export function carrierTask(){
  const {request,originalTask}=componentSource(),covers=['synthetic-lookup:cover'];
  const snapshotSources=originalTask.protectedObservations.map(row=>({sourceMemberRef:row.sourceMemberRef,subject:row.subject,observation:row.observation,source:{kind:'retained_construction',
    resultAdmissionEventRef:'synthetic-lookup:result:'+row.sourceMemberRef,evidenceEventRef:'synthetic-lookup:evidence:'+row.sourceMemberRef,
    bindingCoverEventRefs:covers}}));
  return product.constructWorksiteCommandForwardTask({request,originalTask,snapshotSources,bindingCoverEventRefs:covers});
}
