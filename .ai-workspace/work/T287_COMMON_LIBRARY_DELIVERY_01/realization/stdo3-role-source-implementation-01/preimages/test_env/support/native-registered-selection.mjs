import assert from 'node:assert/strict';
import {readFile,realpath,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {ref} from '../fixtures/registered-selection-product/index.mjs';

/** Fixture data for the existing current run-environment owner, not a new owner. */
export async function nativeSelectionEnvironment({gtl,product}) {
  const release='v2.5.1-rc.1',support='/Users/jim/Library/Application Support';
  const roots=await Promise.all(['STDO','STDO Representation','Axiom Indexer'].map(name=>realpath(join(support,name,'releases',release))));
  const sourceUri=`stdo://releases/${release}/`;
  const dependencyKinds=['source','representation','axiom'];
  const recordPaths=[join(roots[0],'manifest.json'),join(roots[1],'releases/v2.5.1.md'),join(roots[2],'releases/v2.5.1.md')];
  const recordBytes=await Promise.all(recordPaths.map(path=>readFile(path)));
  assert.equal(product.sha256Bytes(recordBytes[0]),'sha256:5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64');
  const dependencies=dependencyKinds.map((kind,i)=>{
    const recordFormat=i===0?'stdo_source_manifest@1':'release_record@1';
    const members=product.runEnvironmentRecordMembers(recordFormat,recordBytes[i]);
    return {dependencyRef:ref('dependency',kind),basisRef:i===0?sourceUri:`${kind}://releases/${release}/`,
      recordRef:i===0?sourceUri+'manifest.json':`https://raw.githubusercontent.com/foolishimp/specification_methodology/4e83fdc4e31ad2161ab70a9759cecbbae5390b69/${i===1?'stdo_representation':'axiom_indexer'}/releases/v2.5.1.md`,
      recordDigest:product.sha256Bytes(recordBytes[i]),recordFormat,inventoryDigest:gtl.stdoInventoryDigest(members),members};
  });
  const programPath=`build_tenants/axiom_indexer/representation/stdo-${release}/axiomatic-program.json`;
  const mapPath=`build_tenants/axiom_indexer/representation/stdo-${release}/logical-constraint-map.json`;
  const programBytes=await readFile(join(roots[1],programPath)),mapBytes=await readFile(join(roots[1],mapPath));
  const program=JSON.parse(programBytes),map=JSON.parse(mapBytes);
  const pythonPath=await realpath('/usr/local/bin/python3');
  const contextRef=ref('context','executive');
  const selections=[['standards/STDO_REFERENCE_FRAME_BASELINE.md','Derived Executive Frame'],['standards/REFERENCE_FRAME_METHOD.md','Canonical Compression']];
  const members=[],sourceBindings=[],frameRefs=[];
  for(const [path,heading] of selections){
    const bytes=await readFile(join(roots[0],path)),marker=Buffer.from(`## ${heading}\n`),startByte=bytes.indexOf(marker);
    assert.ok(startByte>=0,heading);const next=bytes.indexOf(Buffer.from('\n## '),startByte+marker.length),endByte=next<0?bytes.length:next+1;
    const memberRef=ref('member',path),memberDigest=product.sha256Bytes(bytes);
    members.push({memberRef,path,byteCount:bytes.length,digest:memberDigest});
    sourceBindings.push({contextRef,memberRef,memberDigest,startByte,endByte,spanDigest:product.sha256Bytes(bytes.subarray(startByte,endByte))});
    frameRefs.push(sourceUri+path+'#'+heading.toLowerCase().replaceAll(' ','-'));
  }
  const policyText='Under the declared bounded Executive frame, judge whether one permitted registered capability serves the supplied task and recipient requirements. Respect the declared purpose, conditions, input, result and effect contracts. This computation produces a suitability finding and permitted choice or gap; it does not confer operation authority or claim a wider STDO disposition. Supplied observations are current request facts, not independently verified workspace state. A missing suitable capability or required support remains an explicit gap. Do not generate capabilities, repair input, inspect the workspace or treat capability presence as success.';
  const declaration=gtl.constructStdoRunEnvironmentDeclaration({kind:'run_environment_declaration',schemaVersion:'5.0.0',declarationRef:ref('declaration','native-environment'),dependencies,
    contexts:[{contextRef,sourceLocator:sourceUri,inventoryDigest:product.sha256Canonical(members),members}],
    corpusAccess:{kind:'axiom_indexer',sourceDependencyRef:dependencies[0].dependencyRef,representationDependencyRef:dependencies[1].dependencyRef,axiomDependencyRef:dependencies[2].dependencyRef,
      program:{path:programPath,uri:program.uri,byteDigest:product.sha256Bytes(programBytes),canonicalDigest:product.sha256Canonical(program)},
      map:{path:mapPath,uri:`urn:stdo-representation:map:stdo-${release}`,byteDigest:product.sha256Bytes(mapBytes),canonicalDigest:map.map_sha256},
      executablePath:'build_tenants/core/code/ac.py',outputContractPath:'skills/axiomatize-corpus/references/output-contract.md',
      pythonExecutableDigest:product.sha256Bytes(await readFile(pythonPath)),pythonVersion:execFileSync(pythonPath,['--version'],{encoding:'utf8'}).trim()},
    accesses:[{accessRef:ref('access','source-corpus-validation'),operation:'validate',mode:'validation',frameIndexRefs:[],maxOutputBytes:2_000_000,timeoutMs:30_000}],
    roles:[{graphFunctionRef:ref('graph-function','root'),programLocusRef:ref('node','select'),role:'selector',frameRefs:frameRefs.sort(),
      policy:{policyRef:ref('policy','native-suitability'),text:policyText,digest:product.sha256Bytes(Buffer.from(policyText))},
      contextPolicy:{policyRef:ref('policy','native-context'),selectors:['full_source','active_binding_semantics']},
      accessRefs:[ref('access','source-corpus-validation')],sourceBindings}]});
  const physicalDependencies=dependencies.map((d,i)=>({dependencyRef:d.dependencyRef,root:roots[i],recordPath:recordPaths[i]}));
  return {declaration,physicalDependencies,pythonPath,
    async resources({authority,program,workspaceBinding,product}){
      const path=join(workspaceBinding.roots.archiveRoot,'native-selection-context');await mkdir(path,{recursive:true});const temporaryRoot=await realpath(path);
      const coordinates={dependencies:physicalDependencies,pythonPath,temporaryRoot};
      return product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
        permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,programRef:program.programRef,
          environmentRef:declaration.declarationRef,environmentDigest:product.sha256Canonical(declaration),operations:['read_context','validate'],...coordinates}});
    }};
}
