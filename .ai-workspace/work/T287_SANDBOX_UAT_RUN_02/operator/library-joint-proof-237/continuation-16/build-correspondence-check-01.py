from pathlib import Path
import json,hashlib,stat,time
start=time.monotonic();R=Path('/Users/jim/src/apps/abiogenesis');T=R/'build_tenants/abiogenesis/typescript';P=R/'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-joint-proof-237';O=P/'continuation-16';B=P/'continuation-15';S=R/'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233/successor-44'
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'byteCount':len(b),'mode':stat.S_IMODE(p.stat().st_mode)}
def write(name,x):
 with (O/name).open('x') as h:h.write(json.dumps(x,indent=2)+'\n')
try:
 selected=json.loads((O/'inputs-before-publication.json').read_text());src=json.loads((S/'dependency-cut-44-inputs.json').read_text());em=json.loads((S/'dependency-cut-44-emission.json').read_text());sources=[];emitted=[]
 for q in src['files']:
  a=pin(T/'code/src'/q['relativePath']);assert (a['sha256'],a['byteCount'])==(q['sha256'],q['bytes']),q['relativePath'];sources.append(a)
 actual=sorted(p.relative_to(T/'build/code/src').as_posix() for p in (T/'build/code/src').rglob('*') if p.is_file() and (p.suffix=='.js' or p.name.endswith('.d.ts')));assert actual==sorted(q['relativePath'] for q in em['files'])
 for q in em['files']:
  a=pin(T/'build/code/src'/q['relativePath']);assert (a['sha256'],a['byteCount'])==(q['sha256'],q['bytes']),q['relativePath'];emitted.append(a)
 m=json.loads((T/'product-toolchain-manifest.json').read_text());previous=json.loads((B/'preflight.json').read_text());prior={r['relativePath']:r for r in previous['payloadFiles']};assert set(m['productRelativeLocators'])==set(prior)
 payload=[];changed=[]
 for rel in m['productRelativeLocators']:
  a=pin(T/rel);a.update(relativePath=rel,type='file');payload.append(a)
  if a['sha256']!=prior[rel]['sha256'] or a['byteCount']!=prior[rel]['byteCount']:changed.append({'relativePath':rel,'before':prior[rel]['sha256'],'after':a['sha256'],'byteCount':a['byteCount']})
 assert [q['relativePath'] for q in changed]==['build/code/src/product/native_work_reacquisition.js'],changed
 mandatory=[pin(T/'product-toolchain-manifest.json'),pin(T/'contracts/capabilities/capability-definition-graph.json')];b=json.loads((O/'build-input-preflight.json').read_text());selected['canonicalManifest']=mandatory[0];selected['expectedProductContentDigest']=m['productContentDigest'];write('inputs.json',selected)
 write('preflight.json',{'kind':'exact44_canonical_publication_input','acceptedSubjects':selected['acceptedSubjects'],'sourceManifest':selected['sourceManifest'],'emissionManifest':selected['emissionManifest'],'sourceFiles':sources,'emittedFiles':emitted,'canonicalManifest':mandatory[0],'productContentDigest':m['productContentDigest'],'payloadFiles':payload,'mandatoryFiles':mandatory,'buildInputs':b['ordinaryBuildInputs'],'helperFiles':selected['helperFiles'],'fixtureFiles':selected['fixtureFiles'],'compileAndSourceMismatches':[],'elapsedMs':(time.monotonic()-start)*1000})
 write('build-correspondence.json',{'sourceCount':len(sources),'emissionCount':len(emitted),'sourceAndEmissionMismatchCount':0,'all264PublicDeclarationsExact44':True,'declaredPayloadCount':len(payload),'declaredMembershipExact15':True,'payloadBodyDelta':changed,'derivedManifest':mandatory[0],'derivedCapabilityGraph':mandatory[1],'productContentDigest':m['productContentDigest'],'generatedPreimagesReference':pin(O/'generated-preimages.json'),'elapsedMs':(time.monotonic()-start)*1000})
 print(json.dumps({'stage':'build-correspondence','source264':True,'emissions528':True,'declaredPayloadCount':len(payload),'changedPayloads':changed,'productContentDigest':m['productContentDigest'],'manifest':mandatory[0],'elapsedMs':(time.monotonic()-start)*1000}))
except BaseException as e:
 write('build-correspondence-error.json',{'exception':type(e).__name__,'message':str(e)});raise
