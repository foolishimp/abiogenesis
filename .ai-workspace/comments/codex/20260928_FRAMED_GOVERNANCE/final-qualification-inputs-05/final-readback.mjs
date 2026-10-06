// Final readback of retained complete Task and the final complete inventory.
// No constructor, observation owner, Runtime, or qualification execution.
import fs from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {assertPreparationCorrespondence} from './recipe-correspondence.mjs';
import {selectedFiles} from './recipe.mjs';
const report=dirname(fileURLToPath(import.meta.url));
const read=async n=>JSON.parse(await fs.readFile(join(report,n),'utf8'));
const candidate=await read('candidate-binding.json');
const metadata=JSON.parse(await fs.readFile(join(candidate.physicalBootstrapRoot,'package.json'),'utf8'));
const route=metadata.exports?.['./product']?.import;
if(route!=='./build/code/src/product/index.js')throw Error('actual declared Product route changed');
const product=await import(pathToFileURL(resolve(candidate.physicalBootstrapRoot,route)).href);
const task=await read('complete-observed-task.json');
const result=assertPreparationCorrespondence({product,task,selectedFiles:await selectedFiles(),
 inventory:await read('qualification-inventory.json'),protectedPopulation:await read('protected-inputs.json'),
 recipeBytes:await fs.readFile(join(report,'mechanical-worksite/recipe/verification-recipe.json'))});
const inventory=await read('qualification-inventory.json');
for(const root of inventory.selectedRoots)if(!inventory.members.some(m=>m.ref.startsWith(root)))throw Error('unrepresented selected root');
await fs.writeFile(join(report,'final-current-recipe-correspondence.json'),JSON.stringify({...result,
 task:{ref:task.taskRef,digest:task.taskDigest},inventoryMembers:inventory.members.length,
 allSelectedRootsRepresented:true,initialDriverReceiptRetained:'readiness-result.json',
 controlClosure:'18 exact inherited historical supplier/control bodies and reusable projector readback; no Task/protected/recipe changes',
 ownerConstructorCalls:0,newFileObservations:0,qualificationCommandsExecuted:0,C05Binding:null},null,2)+'\n',{flag:'wx'});
process.stdout.write(JSON.stringify({status:'passed',taskDigest:task.taskDigest,inventoryDigest:inventory.inventoryDigest,inventoryMembers:inventory.members.length})+'\n');
