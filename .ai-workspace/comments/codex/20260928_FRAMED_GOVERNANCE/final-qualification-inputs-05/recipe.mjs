// Ordinary future caller construction. No effect occurs merely by importing.
// Q05 preparation never calls these functions or a Product/helper owner.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {materializeCommandEnvironment,constructPreparedObservedTask} from './command-environment.mjs';
import {assertPreparationCorrespondence} from './recipe-correspondence.mjs';
const directory=dirname(fileURLToPath(import.meta.url));
const read=async name=>JSON.parse(await fs.readFile(join(directory,name),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function selectedFiles(){
 const manifest=await read('input-manifest.json'),names=await read('recipe-member-names.json');
 const recipe=await Promise.all(names.map(async name=>{
  const origin=join(directory,name),bytes=await fs.readFile(origin);
  return {origin,target:'recipe/'+name,bytes:bytes.length,sha256:hash(bytes),mode:0o444,classification:'declared_recipe',memberRef:'recipe-input://abiogenesis/q05/'+name};
 }));
 return [...manifest.sourceFiles,...manifest.authoritySources,...manifest.lawMembers,
  ...manifest.toolFiles,...manifest.fixtureFiles,...manifest.dependencies,...recipe];
}
export async function stageIntoExistingWorkspace({worksiteRoot,workspaceAuthorityBasis,workspaceBinding}){
 // Caller must first obtain genuinely admitted workspace.create.clean A/W.
 const root=resolve(worksiteRoot);
 if(root!==workspaceAuthorityBasis.canonicalRoot||await fs.realpath(root)!==root||!(await fs.lstat(root)).isDirectory())throw Error('actual canonical existing clean workspace required');
 if(workspaceBinding===undefined||workspaceBinding===null)throw Error('actual admitted workspace binding required');
 const files=await selectedFiles(),copies=[];
 for(const row of files){
  const target=resolve(root,row.target),rel=relative(root,target);
  if(!rel||rel==='..'||rel.startsWith('../')||isAbsolute(rel)||rel!==row.target)throw Error('unsafe selected input target');
  try{await fs.lstat(target);throw Error('selected input target already exists: '+row.target);}catch(error){if(error.code!=='ENOENT')throw error;}
  // Existing ancestor aliases are refused before any write.
  for(let parent=dirname(target);parent!==root;parent=dirname(parent)){
   try{if(await fs.realpath(parent)!==parent||!(await fs.lstat(parent)).isDirectory())throw Error('aliased input ancestor');}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  const bytes=await fs.readFile(row.origin);
  if(bytes.length!==row.bytes||hash(bytes)!==row.sha256)throw Error('changed selected input: '+row.origin);
  copies.push({row,target,bytes});
 }
 if(new Set(copies.map(c=>c.target)).size!==copies.length)throw Error('duplicate selected target');
 for(const {row,target,bytes}of copies){await fs.mkdir(dirname(target),{recursive:true});await fs.writeFile(target,bytes,{flag:'wx',mode:row.mode});}
 return {kind:'recipe_input_staging',root,files:files.length,bytes:files.reduce((n,row)=>n+row.bytes,0),runtimeClaim:'none; original admitted A/W is retained'};
}
export async function constructObservedProducerTask({product,workspaceAuthorityBasis,workspaceBinding,capabilityGrant}){
 const files=await selectedFiles(),pin=files.find(row=>row.target==='toolchain/bin/node');
 const sourceConfig=await read('raw-config.json'),declared=await read('config.json');
 const preparation=await materializeCommandEnvironment({product,sourceConfig,pin,workspaceAuthorityBasis,workspaceBinding});
 if(product.sha256Canonical(preparation.configuration)!==product.sha256Canonical(declared))throw Error('actual environment/configuration differs from Q05');
 const constructed=await constructPreparedObservedTask({product,preparation,pin,workspaceAuthorityBasis,workspaceBinding,capabilityGrant,selectedFiles:files});
 const recipe=await read('verification-recipe.json');
 for(const key of ['commandConfigurationDigest','predicateConfigurationDigest','writeTerritoriesDigest'])if(constructed.digests[key]!==recipe[key])throw Error('actual task/recipe digest differs: '+key);
 assertPreparationCorrespondence({product,task:constructed.task,selectedFiles:files,
  inventory:await read('qualification-inventory.json'),protectedPopulation:await read('protected-inputs.json'),
  recipeBytes:await fs.readFile(join(directory,'verification-recipe.json'))});
 return constructed.task;
}
