import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const work=path.dirname(fileURLToPath(import.meta.url));
const binding=JSON.parse(fs.readFileSync(path.join(work,'binding.json')));
const activation=JSON.parse(fs.readFileSync(path.join(work,'activation.json')));
assert.equal(binding.operation,activation.operation);
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json=file=>JSON.parse(fs.readFileSync(file));
const old=binding.oldStage,current=binding.newStage;
const packageJson=json(path.join(current,'package.json'));
const lockedPackages=json(path.join(current,'package-lock.json')).packages;
const bundledDependencyNames=packageJson.bundleDependencies;
assert(Array.isArray(bundledDependencyNames));

// The frozen manifest owner's closure algorithm is consumed verbatim. This
// evaluates only its two pure functions, without importing the Product builder.
const generator=fs.readFileSync(path.join(current,'scripts/generate-product-manifest.mjs'),'utf8');
const start=generator.indexOf('function dependencyLocator(');
const end=generator.indexOf('for (const locator of bundledDependencyClosure(',start);
assert(start>=0&&end>start);
const closureSource=generator.slice(start,end);
const closure=new Function('lockedPackages','names',closureSource+'\nreturn bundledDependencyClosure(names);')(lockedPackages,bundledDependencyNames);
assert.equal(closure.length,13,'the selected locked runtime closure');
const requires=[old,current].map(stage=>createRequire(path.join(stage,'scripts/generate-product-manifest.mjs')));
const dependencyRows=[];
for(const locator of closure){
 const name=locator.slice('node_modules/'.length);
 const roots=[old,current].map(stage=>path.join(stage,locator));
 const entries=requires.map(require=>require.resolve(name));
 const relatives=entries.map((entry,index)=>path.relative(fs.realpathSync(roots[index]),fs.realpathSync(entry)).split(path.sep).join('/'));
 assert(relatives.every(relative=>relative!==''&&!relative.startsWith('../')&&relative!=='..'),name+' physical entry containment');
 assert.equal(relatives[1],relatives[0],name+' resolution locator');
 assert.equal(digest(entries[1]),digest(entries[0]),name+' entry body');
 const packages=roots.map(root=>json(path.join(root,'package.json')));
 assert.equal(packages[1].version,lockedPackages[locator].version,name+' locked version');
 assert.equal(packages[0].version,packages[1].version);
 assert.equal(digest(path.join(roots[0],'package.json')),digest(path.join(roots[1],'package.json')));
 assert(!fs.lstatSync(roots[1]).isSymbolicLink(),name+' physical root');
 dependencyRows.push({locator,name,version:packages[1].version,entry:relatives[1],entrySHA256:digest(entries[1]),packageSHA256:digest(path.join(roots[1],'package.json')),physicalRoot:roots[1]});
}

const currentGraph={version:json(path.join(current,'node_modules/typescript/package.json')).version,compilerSHA256:digest(path.join(current,'node_modules/typescript/lib/typescript.js'))};
assert.equal(currentGraph.version,'5.9.2');
assert.equal(json(path.join(current,'node_modules/valibot/package.json')).version,'1.4.2');
const tests=['t287-gtl-serialization-publication.test.mjs','t287-gtl-language-corpus.test.mjs'].map(name=>({name,source:path.join(current,'test_env/tests',name),sha256:digest(path.join(current,'test_env/tests',name)),destination:path.join(work,'consumer',name)}));
assert(!fs.existsSync(binding.consumerPackageRoot),'new extracted consumer output is absent before pack');
assert.deepEqual(fs.readdirSync(path.join(work,'packs')),[],'one archive output is absent before pack');
const result={operation:activation.operation,kind:'PHYSICAL_CLOSURE_READY_NEW_COMPILE_REQUIRED',runtimeBundleRoots:bundledDependencyNames,dependencyRows,compilerPlan:{version:currentGraph.version,compilerSHA256:currentGraph.compilerSHA256,changedSource:true,compileRequired:true,newCompile:true},consumer:{packageRoot:binding.consumerPackageRoot,tests,baseline:binding.baseline,packReceipt:path.join(work,'pack.stdout')},defaultHeap:true,HOME:process.env.HOME,SourceWrites:0};
fs.writeFileSync(path.join(work,'preflight-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({kind:result.kind,runtimePackages:closure.length,compilerVersion:currentGraph.version,newCompile:true}));
