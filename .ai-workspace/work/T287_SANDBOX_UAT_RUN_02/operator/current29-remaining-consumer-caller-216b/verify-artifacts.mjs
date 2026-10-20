import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';

/** Caller-local sequencing only. Receipts are produced anew by the installed owner. */
export async function verifyExpectedArtifacts({product:p,acquisitionRows,pulse}) {
 const items=[];
 for(const {label,pin} of acquisitionRows){
  const s=await lstat(pin.path);assert(s.isFile()&&!s.isSymbolicLink());
  const bytes=await readFile(pin.path);
  assert.equal(bytes.length,pin.byteCount);assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256);
  const expected=JSON.parse(bytes.toString('utf8'));
  await pulse(label+'-preverify-start',{artifactRef:expected.request.artifactRef});
  const start=performance.now();
  const verification=await p.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:expected.request});
  assert.equal(verification.kind,'product_verification_success','Installed artifact verifier refused: '+JSON.stringify({kind:verification.kind,code:verification.code,message:verification.message}));
  const verified=verification.verifiedArtifact;
  assert.equal(verified.kind,'verified_product_artifact');
  assert(Object.isFrozen(verified));
  assert.deepEqual(verified,expected.verification.verifiedArtifact,'Live verified bytes differ from the exact frozen artifact preimage');
  assert.deepEqual(verification,expected.verification,'Live verification projections differ from the frozen acquisition');
  assert.strictEqual(p.selectOwnedProductVerification(expected.request,verified),verified,'Actual owner receipt was not retained');
  items.push({...expected,verification,verified});
  await pulse(label+'-preverify-complete',{wallMs:performance.now()-start,artifactRef:verified.artifactRef,artifactDigest:verified.artifactDigest,verificationRef:verified.verificationRef,verificationDigest:verified.verificationDigest,checkedPayloadFiles:verified.checkedPayloadFiles,nominalReceipt:true});
 }
 return items;
}
