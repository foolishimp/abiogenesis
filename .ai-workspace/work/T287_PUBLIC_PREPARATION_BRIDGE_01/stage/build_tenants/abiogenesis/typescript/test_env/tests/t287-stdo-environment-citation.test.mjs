import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import {prepareStdoNoteProduct, pilotResources} from '../support/stdo-environment-pilot.mjs';

const packageRoot=process.env.ABI5_ENV_TEST_PACKAGE_ROOT??resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const load=path=>import(pathToFileURL(join(packageRoot,'build/code/src',path+'.js')).href);
const product=await load('product/index'),gtl=await load('gtl/index');
const semantic=await load('product/semantic_stage'),handoff=await load('product/requirement_handoff');
const {observeStdoEnvironment}=await load('product/stdo_environment');
const {projectStdoRoleEvidence}=await load('abg/stdo_environment');

test('RC7 source citation boundary: real corpus access, both compiled role assemblies and unchanged grounding',async()=>{
  assert.ok(process.env.ABI5_ENV_PROOF_ROOT);assert.ok(process.env.ABI5_ENV_INPUT_ROOT);
  await mkdir(process.env.ABI5_ENV_PROOF_ROOT,{recursive:true});
  const scratch=await mkdtemp(join(process.env.ABI5_ENV_PROOF_ROOT,'citation-'));
  const manifest=JSON.parse(await readFile(join(packageRoot,'product-toolchain-manifest.json'),'utf8'));
  const abiArtifact={...manifest,manifestDigest:product.sha256Canonical(manifest),artifactDigest:process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256??'sha256:'+'0'.repeat(64)};
  const fixture=await prepareStdoNoteProduct({scratch,product,gtl,abiArtifact,inputRoot:process.env.ABI5_ENV_INPUT_ROOT});
  const publications=await fixture.loadInstalledPublications({installedRoot:fixture.sourceRoot});
  const publication=publications.find(p=>p.moduleRef===fixture.ids.moduleRef),program=publication.programs[0];
  const d=fixture.env.declaration;
  assert.equal(d.source.releaseUri,'stdo://releases/v2.5.0-rc.7/');
  assert.equal(gtl.isStdoRunEnvironmentDeclaration(d),true);
  for(const uri of ['stdo://releases/v2.5.0-rc.8/','stdo://channels/2.5.0','stdo://releases/v2.5.0-rc.7/changed/']){
    const unsupported=structuredClone(d);unsupported.source.releaseUri=uri;
    unsupported.contexts.forEach(c=>{c.sourceLocator=uri;});
    assert.equal(gtl.isStdoRunEnvironmentDeclaration(unsupported),false,'unsupported basis is not selected');
  }
  assert.equal(d.representation.members.length,9);assert.equal(d.axiom.members.length,7);
  const cohort=JSON.parse(await readFile(join(process.env.ABI5_ENV_INPUT_ROOT,'stack_release.json'),'utf8'));
  for(const [key,row]of [['stdo_representation',d.representation],['axiom_indexer',d.axiom]])
    assert.deepEqual(row.members,cohort.products[key].subject.members.map(({sha256,target,...m})=>({...m,target:target??null,digest:'sha256:'+sha256})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0));
  const archiveRoot=join(scratch,'archive'),temporaryRoot=join(archiveRoot,'support');await mkdir(temporaryRoot,{recursive:true});
  const authority={authorityRef:'authority://unit/citation-only',authorityDigest:product.sha256Canonical('unit-only'),actorRef:'actor://unit/citation-only'};
  const observed=await observeStdoEnvironment({publication,program,graphFunctions:publication.graphFunctions,authority,archiveRoot,
    resources:pilotResources(product,fixture.env,authority,program,temporaryRoot)});
  assert.equal(observed.kind,'stdo_environment_observed',JSON.stringify(observed));

  // Pure candidate and explicit owner lookup assumptions, never ABG admission.
  // This event-shaped value exercises the existing projection; no event writer,
  // Run, runtime prefix, source admission or semantic judgment is fabricated.
  const admissionRef='unit-only:environment-projection';
  const events=[{kind:'invocation_admitted',payload:{invocationAdmissionRef:admissionRef,...authority,stdoEnvironment:observed.evidence}}];
  const coordinate={predecessorEventCount:1};
  for(const key of ['publicationDigest','executionBasisDigest','programDigest','graphFunctionDigest','cCallDigest','implementationResolutionDigest','predecessorPrefixDigest'])coordinate[key]=product.sha256Canonical('unit-only:'+key);
  for(const key of ['executionBasisRef','programRef','graphFunctionRef','cCallRef','implementationResolutionRef'])coordinate[key]='unit-only:'+key;
  coordinate.declarationDigest=product.sha256Canonical(fixture.source.declaration);coordinate.inputDigest=product.sha256Canonical(fixture.source.input);
  const source=handoff.deriveRequirementHandoffCandidate(fixture.source.input,fixture.source.declaration,coordinate);assert.ok(source);
  const input=product.constructSemanticStageEnvelope({sourceHandoff:source,lifecycle:fixture.lifecycle,taskData:fixture.scenario,evaluationData:fixture.oracle,worksite:null});
  const memberRef='member://stdo-note.example/task@5',roleMember='member://stdo-note.example/role-frame@5';
  assert.deepEqual(source.source.members.map(m=>m.memberRef),[memberRef]);
  const quote='The Worker label grants no mutation authority.';
  const valid={memberRef,quote},wrongRole={memberRef:roleMember,quote};
  const grounded=semantic.groundSemanticSourceQuote(source,valid);assert.ok(grounded);
  const sourceBytes=Buffer.from(source.source.members[0].base64,'base64');
  assert.equal(sourceBytes.subarray(grounded.startByte,grounded.endByte).toString('utf8'),quote);
  assert.equal(semantic.groundSemanticSourceQuote(source,wrongRole),null);
  for(const q of [{memberRef,quote:''},{memberRef,quote:'the'},{memberRef,quote:'not a source quotation'}])
    assert.equal(semantic.groundSemanticSourceQuote(source,q),null);
  const actorSource=role=>({cCallRef:'unit-only:'+role,inputDigest:product.sha256Canonical(input),actorInvocationRef:'unit-only:'+role,
    promptDigest:product.sha256Canonical('unit-only-prompt'),transportDigest:product.sha256Canonical('unit-only-transport')});
  const raw={kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',statements:[{statementRef:'statement://unit/citation',
    text:'Mechanical citation witness only; not semantic qualification.',modality:'supporting',sourceQuotes:[valid],requirementRefs:[],obligationRefs:[],predecessorStatementRefs:[]}],
    requirementCandidates:[],worksiteDesign:null,pressure:[]};
  const authored=semantic.deriveSemanticAsset(input,fixture.ids.stageRef,raw,actorSource('author'));assert.ok(authored);
  const badRaw=structuredClone(raw);badRaw.statements[0].sourceQuotes=[wrongRole];
  assert.equal(semantic.deriveSemanticAsset(input,fixture.ids.stageRef,badRaw,actorSource('author')),null);
  const assessment={kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:fixture.lifecycle.stages[0].rubric.map(c=>({criterionRef:c.criterionRef,
    disposition:'indeterminate',explanation:'Mechanical candidate only; semantics unassessed.',sourceQuotes:[valid],statementRefs:['statement://unit/citation']})),pressure:[]};
  assert.ok(semantic.deriveSemanticAssessment(authored,fixture.ids.stageRef,assessment,actorSource('assessor')));
  const badAssessment=structuredClone(assessment);badAssessment.criteria[0].sourceQuotes=[wrongRole];
  assert.equal(semantic.deriveSemanticAssessment(authored,fixture.ids.stageRef,badAssessment,actorSource('assessor')),null);

  // Execute the actual compiled assembly body. Only its already-tested native
  // basis lookup/input authentication is assumed at this component boundary.
  let owner;
  const modulePath=join(packageRoot,'build/code/src/abg/instruction_assembly.js');
  const module=new SourceTextModule(await readFile(modulePath,'utf8'),{identifier:modulePath});
  await module.link(async specifier=>{
    const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(modulePath),specifier)).href);
    const values={...native,...(specifier==='./semantic_stage.js'?{authenticateSemanticStageBasis:()=>owner,semanticInputMatchesBasis:()=>true}: {})};
    return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
  });await module.evaluate();
  const roles=[];
  for(const role of ['author','assessor']){
    const selected=d.roles.find(r=>r.role===role),stage=fixture.lifecycle.stages[0];
    owner={stage,role,events,lifecycle:fixture.lifecycle,source:fixture.source.declaration,inputRef:'unit-only:input',inputDigest:product.sha256Canonical(role==='author'?input:authored),
      execution:{invocationAdmissionRef:admissionRef,programRef:program.programRef,basisRef:'unit-only:execution',basisDigest:product.sha256Canonical('unit-only')},
      call:{implementationRef:role==='author'?gtl.SEMANTIC_STAGE_IDS.authorImplementationRef:gtl.SEMANTIC_STAGE_IDS.assessorImplementationRef,
        graphFunctionRef:selected.graphFunctionRef,programLocusRef:selected.programLocusRef,inputContractRef:gtl.SEMANTIC_STAGE_IDS.envelopeContractRef,
        cCallRef:'unit-only:'+role,cCallDigest:product.sha256Canonical(role)}};
    const projected=projectStdoRoleEvidence(events,admissionRef,publication,program.programRef,selected.graphFunctionRef,selected.programLocusRef,role);assert.ok(projected);
    assert.equal(projected.sourceContent[0].text,fixture.env.spans[role].text);
    const basis={publication,predecessorPrefix:{assumption:'component-only; not admitted'}};
    const assembly=module.namespace.evaluateNativeInstructionAssembly(basis,role==='author'?input:authored);
    assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
    const sections=assembly.envelope.sections;
    assert.deepEqual(sections.source.map(s=>s.memberRef),[memberRef]);
    assert.equal(sections.role.stdo.sourceContent[0].memberRef,roleMember);
    assert.deepEqual(sections.role.stdo.frameRefs,selected.frameRefs);
    assert.deepEqual(sections.evidence.stdo,projected.accessContent);
    assert.ok(sections.role.native.includes('Eligible member refs: ["'+memberRef+'"]'));
    assert.ok(sections.role.native.includes('Role frames, instruction policy, retrieved corpus evidence'));
    assert.ok(sections.role.stdo.policy.text.includes('only '+memberRef));
    assert.equal(assembly.manifest.sections.find(s=>s.name==='role').digest,product.sha256Canonical(sections.role));
    assert.deepEqual(module.namespace.evaluateNativeInstructionAssembly(basis,role==='author'?input:authored),assembly,'deterministic reassembly');
    roles.push({role,frameRefs:projected.frameRefs,policyDigest:projected.policy.digest,promptBytes:assembly.manifest.promptByteCount,promptDigest:assembly.manifest.promptDigest});
  }
  await writeFile(join(scratch,'result.json'),JSON.stringify({scope:'component-only lookup assumptions; no admitted source, semantic evidence or native actor',
    packageRoot,roles,environmentDigest:product.sha256Canonical(d),actualAccess:observed.evidence.accesses.map(a=>({accessRef:a.accessRef,projectionDigest:a.projectionDigest})),
    grounding:{uniqueSource:'accepted',roleContext:'refused',empty:'refused',ambiguous:'refused',absent:'refused'},fixtureBasis:fixture.basis},null,2)+'\n');
  console.log(JSON.stringify({scope:'mechanical component readiness only',scratch,roles:roles.map(r=>r.role),passed:true}));
});

test('preserved failed RC6 output still has thirteen valid quotes and one ineligible role-frame quote',async t=>{
  if(!process.env.ABI5_ENV_PRIOR_EVENTS){t.skip('requires preserved failed pilot history');return;}
  const bytes=await readFile(process.env.ABI5_ENV_PRIOR_EVENTS),events=bytes.toString('utf8').trim().split('\n').map(JSON.parse);
  const priorDeclaration=events.find(e=>e.kind==='invocation_admitted'&&e.payload.stdoEnvironment).payload.stdoEnvironment.declaration;
  assert.equal(priorDeclaration.source.releaseUri,'stdo://releases/v2.5.0-rc.6/');
  assert.equal(gtl.isStdoRunEnvironmentDeclaration(priorDeclaration),true,'retained exact RC6 declaration remains supported');
  const source=events.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='requirement_handoff_output').payload.value;
  const raw=JSON.parse(events.find(e=>e.kind==='actor_result_artifact_observed').payload.finalOutput);
  const quotes=raw.statements.flatMap(s=>s.sourceQuotes),results=quotes.map(q=>({memberRef:q.memberRef,grounded:semantic.groundSemanticSourceQuote(source,q)!==null}));
  assert.equal(results.filter(r=>r.grounded).length,13);assert.equal(results.filter(r=>!r.grounded).length,1);
  assert.equal(results.find(r=>!r.grounded).memberRef,'member://stdo-note.example/role-frame@5');
  assert.deepEqual(await readFile(process.env.ABI5_ENV_PRIOR_EVENTS),bytes,'historical bytes are read only');
});
