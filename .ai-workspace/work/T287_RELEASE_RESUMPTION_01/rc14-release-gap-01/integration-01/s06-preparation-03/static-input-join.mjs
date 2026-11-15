// Prospective constructor specimens only: no event, call, Run or application execution.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {witnessCommand,witnessProtocol,d2Input,sourceRecords} from './inputs.mjs';
const C=dirname(fileURLToPath(import.meta.url)),b=JSON.parse(await readFile(join(C,'BINDING.template.json'),'utf8')),t=JSON.parse(await readFile(join(C,'TOOLCHAIN.json'),'utf8'));
const root=process.argv[2];assert(root);
const packageRoot='/Users/jim/Library/Application Support/ABIogenesis/development-runs/rc14-proof-fixture-20261115-02/proof-01/installed/node_modules/@abiogenesis/typescript-tenant';
const pkg=JSON.parse(await readFile(join(packageRoot,'package.json'),'utf8'));
const product=await import(new URL(pkg.exports['./product'].import,pathToFileURL(join(packageRoot,'package.json'))).href);
const D=await import(pathToFileURL(join(b.controlSourceRoot,'build_tenants/abiogenesis/typescript/test_env/support/default-library.mjs')).href);
const {environment,commands,capability}=witnessProtocol(b,t);
/** @type {import('@abiogenesis/typescript-tenant/product').SemanticJobInput} */
const input={kind:'semantic_job_input',schemaVersion:'5.0.0',lifecycleRef:'lifecycle://s06/static-constructor-specimen',sourceRoleRef:'role://s06/static-constructor-specimen',
 members:[{memberRef:'source://s06/static-constructor-specimen',path:'source/d1-input.json',sourceLocator:'tool://s06/pure-constructor-check',base64:Buffer.from(JSON.stringify(sourceRecords)).toString('base64')}],
 taskData:{witnessCommands:commands},evaluationData:{},worksiteScope:{readRoots:['source','application'],writeRoots:['application'],parentWriteRoots:[],evidenceWriteRoots:['evidence'],executableCapabilities:[capability]}};
const admittedShape=product.constructSemanticJobInput(input);assert(product.isSemanticJobInput(admittedShape));
assert.equal(product.sha256Bytes(await readFile(join(C,'TOOLCHAIN.json'))),'sha256:'+environment.S06_TOOLCHAIN_SHA256);
for(const command of Object.values(commands)){
 assert.equal(command.executable,capability.executable);assert.deepEqual(command.environment,capability.environment);
 assert.equal(command.args[0],'application/witness.mjs');assert(command.timeoutMs<=capability.maxTimeoutMs);
 assert(command.terminationGraceMs<=capability.maxTerminationGraceMs);
}
await mkdir(join(root,'source'),{recursive:true});await writeFile(join(root,'source/d2-input.json'),JSON.stringify(sourceRecords),'utf8');
// A deliberately labelled prospective shape supplies no D1 producer or semantic credit.
const prospective={assets:[{candidate:{design:{commands:[commands.d1]}}}]};
const d2=await d2Input({product,D,worksite:root,d1Output:prospective,applicationFiles:['application/witness.mjs'],commands:[commands.d2],sourcePaths:['source/d2-input.json']});
assert.deepEqual(d2.original.testing.commands,[commands.d2]);
assert.deepEqual(d2.original.testing.selectedPaths,['application/witness.mjs','source/d2-input.json']);
assert.equal(d2.original.reviews.length,1);assert.equal(d2.original.reviews[0].required,true);
console.log(JSON.stringify({canonicalSemanticInput:true,canonicalGovernanceInput:true,capabilityCommandEnvironmentJoin:true,relativeWitnessInputReports:true,
 namedImpactReviewRetained:true,publicPackageVersion:pkg.version,runtimeAdmission:false,claim:'Prospective pure constructor shape and exact declared command join only; lifecycle/current D1 and installed RC14 remain unbound'}));
