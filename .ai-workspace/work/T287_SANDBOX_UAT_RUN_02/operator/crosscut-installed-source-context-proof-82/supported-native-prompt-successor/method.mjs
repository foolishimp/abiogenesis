import assert from 'node:assert/strict';
import {readFile, mkdir, realpath} from 'node:fs/promises';
import {join} from 'node:path';

export const methodRoot='/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.2';
export const manifestDigest='sha256:3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782';
const ref=(kind,name)=>`${kind}://crosscut-local-protocol/${name}@5`;

// A generic source-only fixture declaration. This does not activate the STDO
// corpus specialization or claim Representation/Axiom/model acceptance.
export async function sourceOnlyEnvironment({gtl,product}) {
  const root=await realpath(methodRoot),recordPath=join(root,'manifest.json');
  const manifest=await readFile(recordPath);assert.equal(product.sha256Bytes(manifest),manifestDigest);
  const members=product.runEnvironmentRecordMembers('stdo_source_manifest@1',manifest);
  const basisRef='stdo://releases/v2.5.1-rc.2/',path='standards/STDO_REFERENCE_FRAME_BASELINE.md';
  const bytes=await readFile(join(root,path)),digest=product.sha256Bytes(bytes);
  assert.ok(members.some(m=>m.path===path&&m.type==='file'&&m.digest===digest));
  const contextRef=ref('context','frames'),memberRef=ref('member','frames');
  const member={memberRef,path,byteCount:bytes.length,digest};
  const binding=heading=>{
    const marker=Buffer.from(`## ${heading}\n`),startByte=bytes.indexOf(marker);assert.ok(startByte>=0,heading);
    const next=bytes.indexOf(Buffer.from('\n## '),startByte+marker.length),endByte=next<0?bytes.length:next+1;
    return {contextRef,memberRef,memberDigest:digest,startByte,endByte,spanDigest:product.sha256Bytes(bytes.subarray(startByte,endByte))};
  };
  const native=product.NATIVE_WORKSPACE_WORK_IDS,c2=product.WORKSITE_COMMAND_EXECUTION_IDS;
  const roles=[
    ['graph-function://default-library-witness/executive-step@5',product.governanceRef('node','select'),'selector',['Derived Executive Frame']],
    [native.graphFunctionRef,native.nodeRef,'constructor',['Derived Worker Frame','Derived Generic Specialist Frame Set']],
    [native.assessmentGraphFunctionRef,native.assessmentNodeRef,'assessor',['Derived Reviewer Frame','Derived Product Testing Frame Set']],
    [c2.graphFunctionRef,c2.nodeRef,'command_executor',['Derived Worker Frame','Derived Product Testing Frame Set']],
  ];
  const declaration=gtl.constructRunEnvironmentDeclaration({kind:'run_environment_declaration',schemaVersion:'5.0.0',declarationRef:ref('environment','source-only'),
    dependencies:[{dependencyRef:ref('dependency','rc2-source'),basisRef,recordRef:basisRef+'manifest.json',recordDigest:manifestDigest,recordFormat:'stdo_source_manifest@1',inventoryDigest:gtl.stdoInventoryDigest(members),members}],
    contexts:[{contextRef,sourceLocator:basisRef,inventoryDigest:product.sha256Canonical([member]),members:[member]}],corpusAccess:null,accesses:[],
    roles:roles.map(([graphFunctionRef,programLocusRef,role,headings])=>({graphFunctionRef,programLocusRef,role,
      frameRefs:headings.map(h=>basisRef+path+'#'+h.toLowerCase().replaceAll(' ','-')).sort(),
      policy:{policyRef:ref('policy',role),text:product.DEFAULT_LIBRARY_POLICY,digest:product.sha256Bytes(Buffer.from(product.DEFAULT_LIBRARY_POLICY))},
      contextPolicy:{policyRef:ref('policy',role+'/context'),selectors:role==='selector'?['full_source','active_binding_semantics']:['current_worksite','admitted_execution_evidence']},
      accessRefs:[],sourceBindings:headings.map(binding)}))});
  return {declaration,source:{root,recordPath,memberDigest:digest,memberBytes:bytes.length},async resources({authority,program,workspaceBinding,product}){
    const temporaryRoot=join(workspaceBinding.roots.archiveRoot,'local-source-context');await mkdir(temporaryRoot,{recursive:true});
    const coordinates={dependencies:[{dependencyRef:declaration.dependencies[0].dependencyRef,root,recordPath}],pythonPath:null,temporaryRoot:await realpath(temporaryRoot)};
    return product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
      permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,programRef:program.programRef,
        environmentRef:declaration.declarationRef,environmentDigest:product.sha256Canonical(declaration),operations:['read_context'],...coordinates}});
  }};
}
