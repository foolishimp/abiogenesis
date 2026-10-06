import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const work=path.dirname(fileURLToPath(import.meta.url));
const binding=JSON.parse(fs.readFileSync(path.join(work,'binding.json')));
const root=binding.consumerPackageRoot;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'contracts/conformance/gtl-language-conformance-corpus.json')));
const body=fs.readFileSync(path.join(root,corpus.schema.path));
assert.equal('sha256:'+createHash('sha256').update(body).digest('hex'),corpus.schema.contentDigest);
const schema=JSON.parse(body),require=createRequire(path.join(root,'package.json'));
const Ajv=require(path.join(root,'node_modules/ajv/dist/2020.js')).default;
const ajv=new Ajv({strict:true,allowUnionTypes:true});
ajv.addSchema(schema);
const names=['GraphFunction','ModulePublication','CProgramSyntax','GtlProgramConformanceInput','GtlLanguageConformanceCorpus'];
const tupleRows=[];
for(const name of names){
 assert.equal(typeof ajv.getSchema(schema.$id+'#/$defs/'+name),'function',name+' strict Ajv2020 compilation');
 const visit=(node,pointer)=>{
  if(node===null||typeof node!=='object')return;
  if(Array.isArray(node.prefixItems)){
   assert.equal(node.minItems,node.prefixItems.length,pointer+' exact minimum');
   assert.equal(node.items,false,pointer+' closed tail');
   tupleRows.push({definition:name,pointer,arity:node.prefixItems.length,items:node.items});
  }
  for(const [key,value]of Object.entries(node))visit(value,pointer+'/'+key);
 };
 visit(schema.$defs[name],'#/$defs/'+name);
}
assert.equal(tupleRows.length,23,'complete actual composed tuple population');
assert.equal(ajv.getSchema(schema.$id+'#/$defs/GtlLanguageConformanceCorpus')(corpus),true,'published fixed corpus');
const result={operation:binding.operation,kind:'COMPLETE_PACKAGED_SCHEMA_PREFLIGHT_READY',strictAjv2020:true,
 compiledDefinitions:names,tupleRows,schemaPath:corpus.schema.path,schemaDigest:corpus.schema.contentDigest,
 packageRoot:root,beforeIndividualFocusedCases:true,RuntimeEffects:0};
fs.writeFileSync(path.join(work,'schema-preflight-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({kind:result.kind,compiledDefinitions:names,closedTupleCount:tupleRows.length,beforeIndividualFocusedCases:true}));
