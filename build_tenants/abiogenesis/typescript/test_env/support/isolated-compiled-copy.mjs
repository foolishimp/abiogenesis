// A second real ESM URL tree, without package/install effects. Callers retain
// explicit lower-owner fixture premises; dependency implementation is unchanged.
// The copy carries the payload the executing manifest inventories (all of
// `build/`, `contracts/`, `package.json`; `node_modules/` by link), so the
// copy's modules admit the copy as their executing package.
import fs from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
export function isolatedCompiledCopy(t){
 const root=resolve(import.meta.dirname,'../..'),copy=fs.mkdtempSync(join(tmpdir(),'abg-module-owner-'));
 t.after(()=>fs.rmSync(copy,{recursive:true,force:true}));
 for(const name of ['build','contracts','package.json','product-toolchain-manifest.json'])fs.cpSync(join(root,name),join(copy,name),{recursive:true});
 fs.symlinkSync(join(root,'node_modules'),join(copy,'node_modules'),'dir');
 return {path:relative=>join(copy,'build/code/src',relative),load:relative=>import(pathToFileURL(join(copy,'build/code/src',relative)).href)};
}
