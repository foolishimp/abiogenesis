import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';

// Exercise exact emitted private pure functions without changing production
// exports. Imports remain the actual isolated modules unless a test explicitly
// labels a supplied lookup assumption. No native operation or resource
// acquisition is invoked by this harness.
export async function privateOwner(relative, names, overrides = {}) {
  const file=path.resolve(import.meta.dirname,'../../build/code/src',relative);
  const compiled=fs.readFileSync(file,'utf8');
  const module=new SourceTextModule(compiled+'\nexport { '+names.join(', ')+' };\n',{identifier:file});
  const links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const url=specifier.startsWith('.')?pathToFileURL(path.resolve(path.dirname(file),specifier)).href:specifier;
    const actual={...await import(url),...(overrides[specifier]??{})};
    const linked=new SyntheticModule(Object.keys(actual),function(){for(const [key,value] of Object.entries(actual))this.setExport(key,value);});
    links.set(specifier,linked);return linked;
  });
  await module.evaluate();return module.namespace;
}
