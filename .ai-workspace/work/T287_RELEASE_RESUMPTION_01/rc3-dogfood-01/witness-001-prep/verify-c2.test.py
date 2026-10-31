#!/usr/bin/env python3
"""Model-free C2 byte/provenance boundary; these fixtures are not native admission."""
import base64,hashlib,importlib.util,io,json,tarfile,tempfile,unittest
from pathlib import Path
s=importlib.util.spec_from_file_location('witness_verify_c2',Path(__file__).with_name('verify-c2.py'));v=importlib.util.module_from_spec(s);s.loader.exec_module(v)
def pin(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
class Boundary(unittest.TestCase):
 def test_selection_and_tamper_refuse_without_extraction(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve(); (root/'sandbox/x').mkdir(parents=True); artifact=root/'sandbox/x/pkg.tgz';z='sha256:'+'a'*64
   manifest={'productId':'product://abiogenesis/typescript-tenant@5.0.0-rc.3','packageName':'@abiogenesis/typescript-tenant','packageVersion':'5.0.0-rc.3','productContentDigest':z};m=json.dumps(manifest).encode()
   with tarfile.open(artifact,'w:gz') as tar:
    ti=tarfile.TarInfo('package/product-toolchain-manifest.json');ti.size=len(m);tar.addfile(ti,io.BytesIO(m))
   body=artifact.read_bytes(); c2='command://abiogenesis/rc3-dogfood/increment-b-04/'
   ids=['fixture-current-measurement','source-correspondence','toolchain','contract-seeds','build','package','focused-owner-chain','affected-owner-tests','artifact-tests']
   p={'runRef':'run://r','resultRef':'result://r','resultDigest':z,'helperArtifactRef':'helper://h','helperArtifactDigest':z,'artifactRelativePath':'x/pkg.tgz'}
   helper={'disposition':'success','artifactRef':p['helperArtifactRef'],'artifactDigest':z,'commandResults':[{'commandId':c2+i,'exitStatus':0,'timedOut':False,'processSignal':None,'terminationConfirmed':True} for i in ids],'worksiteDelta':[{'relativePath':'x/pkg.tgz','after':{'nodeKind':'file','digest':pin(body),'byteLength':len(body)}}]}
   row={'path':'src/file','sha256':'b'*64,'bytes':1};output=(json.dumps(row)+'\n').encode();helper['commandResults'][1]['stdout']={'payload':base64.b64encode(output).decode(),'encoding':'base64','byteLength':len(output),'digest':pin(output)};helper['snapshotMembers']=[{'relativePath':'src/file','digest':'sha256:'+'b'*64,'byteLength':1}]
   evidence=root/'evidence.json';evidence.write_text(json.dumps(list(p.values()))); h=root/'result.json';h.write_text(json.dumps(helper));authority=root/'authority';authority.write_text('authority');consumer=root/'consumer.mjs';consumer.write_text('consumer');tool=root/'tool';tool.write_text('tool')
   p.update(admissionEvidencePath=str(evidence),admissionEvidenceSha256=pin(evidence.read_bytes()),helperResultPath=str(h),helperResultSha256=pin(h.read_bytes()))
   a={**manifest,'sha256':pin(body),'bytes':len(body),'manifestByteSha256':pin(m),'manifestDigest':z}
   o={'authorityPath':str(authority),'authoritySha256':pin(authority.read_bytes()),'consumerModulePath':str(consumer),'consumerModuleSha256':pin(consumer.read_bytes()),'policyRef':'context://policy','nodePath':str(tool),'npmPath':str(tool),'nodeSha256':pin(tool.read_bytes()),'npmSha256':pin(tool.read_bytes()),'taskSha256':z,'rubricSha256':z}
   selected={'kind':'rc3_b04_c2_selected_producer_v1','producer':p,'artifact':a,'operator':o}
   self.assertEqual(v.verify(selected)['artifactSha256'],pin(body));self.assertFalse((root/'extraction').exists())
   artifact.write_bytes(body+b'tamper')
   with self.assertRaisesRegex(ValueError,'pinned bytes changed'):v.verify(selected,str(root/'extraction'))
   self.assertFalse((root/'extraction').exists())
   del selected['operator']['policyRef']
   with self.assertRaises((KeyError,ValueError)):v.verify(selected)
if __name__=='__main__':unittest.main()
