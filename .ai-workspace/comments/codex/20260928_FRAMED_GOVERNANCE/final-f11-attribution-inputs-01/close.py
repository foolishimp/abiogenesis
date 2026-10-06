from pathlib import Path
import datetime, hashlib, json

R=Path('/Users/jim/src/apps/abiogenesis')
G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
D=G/'final-f11-attribution-inputs-01'; C=G/'final-candidate-construction-01'; Q=G/'final-qualification-inputs-01'
T='build_tenants/abiogenesis/typescript/'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def put(n,x):(D/n).write_text(json.dumps(x,indent=2)+'\n')
def row(p):
    b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def excerpt(path,first,last,ref):
    b=path.read_bytes();ls=b.splitlines(keepends=True);start=sum(map(len,ls[:first-1]));end=sum(map(len,ls[:last]));part=b[start:end]
    return {'sourceRef':ref,'sourcePath':str(path),'sourceDigest':'sha256:'+sha(b),'sourceByteCount':len(b),
        'startLine':first,'endLine':last,'startByte':start,'endByte':end,'spanDigest':'sha256:'+sha(part),'text':part.decode()}

owner_spans=[
 excerpt(C/'source-freeze/repo'/T/'code/src/validator/qualification_contracts.ts',106,140,'repo://abiogenesis/'+T+'code/src/validator/qualification_contracts.ts'),
 excerpt(C/'source-freeze/repo'/T/'code/src/validator/qualification.ts',613,715,'repo://abiogenesis/'+T+'code/src/validator/qualification.ts'),
 excerpt(C/'source-freeze/repo'/T/'code/src/abg/qualification_proof.ts',577,620,'repo://abiogenesis/'+T+'code/src/abg/qualification_proof.ts'),
 excerpt(C/'source-freeze/repo'/T/'design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md',43,89,'repo://abiogenesis/'+T+'design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md'),
 excerpt(Q/'prepare-inputs.py',40,57,'external-record://abiogenesis/'+str((Q/'prepare-inputs.py').relative_to(R))),
]
put('owner-source-spans.json',{'spans':owner_spans,'meaning':'Exact frozen source excerpts route the existing owner relation. No new law or implementation.'})
coverage=read(D/'inventory-attribution-coverage.json'); summary=read(D/'construction-class-summary.json'); checks=read(D/'source-transition-checks.json'); validation=read(D/'validation-result.json')
unknown=[x['member'] for x in coverage['members'] if x['classification']=='changed_selected_source_without_complete_routed_chain']
triage={
 'subject':coverage['subjectInventory'],
 'result':'incomplete_external_attribution_inputs',
 'productAndDesign':{'outcome':'A5-F11 exact-subject conformance, actual external authorship and later independent admitted assessment',
   'authority':'D4/D5 Section 3 external_construction and SELF-CONFORMANCE-001/002/008; no Product exemption',
   'constraint':'Byte correspondence, sufficient attribution and actual assessor independence are distinct relations. A package build does not author inherited source.'},
 'failures':[
  {'id':'ATTR-01-original-carrier-correspondence',
   'origin':'Two actual retained construction representations have not been joined to the existing F11 external-record consumer.',
   'variables':{'handoffRepair':'Four original closure paths are absolute /Users/jim/src/apps/abiogenesis/...; four inventory member paths are repository relative. Exact preimage bytes and original a/b patch reconstruct all four current postimages.',
    'selectedAction07':'Four original patch headers are before/... and after/..., whereas patchedMember accepts a/b or bare repository paths. Its exact preimages, closure members and current bytes otherwise join; all four original transitions reconstruct.'},
   'symptom':'The current consumer path/header relations cannot discharge these original carriers unchanged.',
   'escapeAndRecurrence':'Previous bounded source/component/package checks verified their own relations. F11 input construction was explicitly deferred; those passes do not establish this downstream provenance join. There is no evidence here of an earlier full F11 acceptance or a failed native assessment.',
   'alternativesAndUncertainty':'Existing source-grounded derived representation may be sufficient, but no normalization is selected or emitted. A Product design defect is not established by this data-to-consumer mismatch.',
   'owner':'Executive selects bounded external input realization through existing Validator.Conformance provenance owner.',
   'causalCone':'Original grant/preimage/patch/closure and original attribution spans -> derived representation if lawfully selected -> exact current member -> current provenance projector; retain unchanged originals.',
   'smallestReentry':'realization_refactor for an admissible deterministic external representation, only if existing owner law permits it; otherwise return the actual unrepresentable relation before any source/design change.',
   'reproof':'For every selected chain, current installed schema and actual original/derived preimage-delta-postimage equality, exact closure/inventory paths and source-span identity; no fabricated J or actor.'},
  {'id':'ATTR-02-concrete-identity-and-authority',
   'origin':'Routed original records name Worker activations, but do not supply a complete source-grounded correspondence from those labels to concrete author actors and the declared Product authority slot.',
   'variables':{'retainedAuthorClaims':['T287_S03_PUBLIC_HANDOFF_REPAIR_01','T287_S7_SELECTED_ACTION_INSTALLED_07'],
    'actorIdentityRef':None,'authorityRef':None,'schemaResult':'Both candidate chains are explicitly incomplete at these two fields.'},
   'symptom':'No complete provenance or assessor request can lawfully be materialized from these fragments.',
   'escapeAndRecurrence':'Role/request/closure labels are useful dispatch records. Repeating those labels would not add the missing actual identity/authority correspondence. No current actor is relabeled independent in this cut.',
   'alternativesAndUncertainty':'The original dispatch/session identity and grant chain may already exist outside the routed records. The bounded read did not search all history or invent their absence globally.',
   'owner':'Original construction/grant record owners supply their actual correspondence; native qualification owners later establish admitted assessor and peer identity.',
   'causalCone':'Original actor/activation/grant record -> supported author identity -> admitted assessment occurrence -> actual author/peer independence comparison.',
   'smallestReentry':'realization_refactor of external evidence inputs; no new role, method or Product law.',
   'reproof':'Current schemas accept genuinely supplied identity/authority fields, source-grounded attribution assessment establishes them, and actual native owner independently compares admitted actor identities.'},
  {'id':'ATTR-03-complete-population-attribution',
   'origin':'Complete inventory byte membership exists; complete corresponding authorship/construction input selection does not.',
   'variables':{'populationCounts':summary['counts'],'currentRoutedTransitions':8,'readyChains':0,
    'firstUnjoinedCurrentSourceMember':unknown[0],'allUnjoinedChangedSelectedSourceMembers':unknown},
   'symptom':'Whole-inventory F11 cannot be represented as one builder-author chain or discharged from the two repair fragments.',
   'escapeAndRecurrence':'Snapshot, package inventory, deterministic generation and ordinary input-control construction have distinct production owners. Their successful construction cannot silently fill original source or supplier authorship. Q already recorded attribution as pending.',
   'alternativesAndUncertainty':'Frozen-head Git trees/blobs ground 1,077 unchanged selected sources, but the one commit author is not evidence of all semantic authorship. Relevant actual commit deltas and original scoped grants may supply later bounded chains. Deterministic generation and copied controls retain their real operations, without no-op authored deltas.',
   'owner':'Executive selects exact remaining construction records; F11 applies them only to each genuine selected member/domain.',
   'causalCone':'1,103 source + 828 generated + 19 external inventory members, their actual construction/source relations, later scope mapping and actual assessment.',
   'smallestReentry':'realization_refactor of exact external input selection; missing later native basis or scope mapping is not a Product defect.',
   'reproof':'Each selected member has an adequate actual chain or a truthfully blocked relation; whole required member union is complete before whole-inventory attribution is claimed.'}
 ],
 'rulingLimits':{
   'source':'T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md Section 3 and qualification_proof.ts:579-597',
   'conditionalRoute':'qualification_ruling may obtain an actual authorized present source/Product-owner acknowledged/disputed/insufficient attribution response for exact candidate, recordSet, attributed identities and scope.',
   'onlyAfter':'The original record/byte/scope chain is structurally valid and has reached insufficient attribution, rather than invalid correspondence.',
   'cannotRepair':['missing chains or covered members','wrong original patch/closure correspondence','invented concrete actors or authority','native past-event absence','independence violations','semantic obligation failure'],
   'notUniversal':True,'noRulingRequested':True},
 'counterfactualNextInput':'A bounded derived carrier could preserve original record refs/spans and prove exact transition equivalence before feeding the existing consumer. This is a proposal only; no such carrier or source fix is selected here.',
 'stop':'Root requested freeze at this natural boundary while a separate native cut closes. That moving output was not read. No successor candidate is implied.'
}
put('causal-triage.json',triage)
put('next-inputs.json',{
 'subjectInventory':coverage['subjectInventory'],'recordSet':validation['recordSet'],
 'usableNow':['26 exact original material records with current installed schema/byte validation','6 original attribution spans','8 independently reconstructed real source transitions','1,950 exact member classifications and origin coordinates','frozen-head Git tree/blob membership without blanket authorship','existing source-bound carrier, authority and ruling limits'],
 'pendingBeforeProvenance':['Root disposition of original path/header carrier joins','original concrete author/actor and authority correspondence','remaining relevant original construction records for actual selected member domains'],
 'laterDistinctInputs':['closed per-rule domain mapping','actual candidate/source/law/native basis in future exact activation','actual admitted assessor/peer identities and semantic attribution judgments'],
 'notLaunchReady':True,'readyAssessmentTasks':0,'nativeEffectsAuthorized':False,
 'exactSubjectConservation':'This cut remains about C/Q only. Source changes invalidate dependent current-subject claims; do not relabel these records to a successor.'})

text=f'''# CLOSED — final F11 attribution inputs 01

**The exact C/Q input population is byte-bound; full external attribution remains incomplete.** Worker `T287_FINAL_F11_ATTRIBUTION_INPUTS_01` returns one bounded input cut and stops. No source, Product, Git, native, provider, resource or qualification effect occurred. Only this new directory was written.

The installed `a_c` join reproduces the exact seven-section 6,222-byte request, SHA256 `53bed891c2697db47e4694a9e8a268971794810d6ef7b3690710b5a3c7554d94`. Sole territory is this directory. The fixed fifteen-family Product, GOAL-035/T287, A5-F11, SELF-CONFORMANCE/QUAL056/064 and accepted D4/D5 Section3 govern this `realization_refactor` of external evidence inputs. The Root grant directs independent material-frame separation; this Worker neither assures its own output nor activates another actor.

Exact subject: construction01 freeze `f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f`, archive `2840b889d9207b48f7b1492934d3158a25352efa7b942f8ea58992ed15b57bcc`, Product content `2c7bab8f7425a2a675fd7c8666349391fefae76150823f5cc305eb57cd9176a`; Q freeze `0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe`, inventory `sha256:ca5a28d01f72202e3fefe39ea35755b0cbc8a2e6fbecf57d4b8392a90742351d`. No moving native/scope output was read. Root subsequently requested this useful exact cut be frozen; no successor binding is inferred.

## Constructed and checked

All **1,950** inventory members match their immutable physical origins. [Coverage](inventory-attribution-coverage.json) classifies them without selecting applicability or inventing authors:

| Actual material relation | Members |
|---|---:|
| Selected source unchanged at frozen Git HEAD | 1,077 |
| Current selected source with a routed real repair transition | 8 |
| Other changed/untracked selected source without a complete routed chain | 18 |
| Deterministic generated output | 828 |
| New or modified external Q control | 11 |
| Unchanged inherited external Q copy | 4 |
| Archive/dependency/toolchain observation manifest | 4 |

The source subtotal is 1,103; generated output is 828; external controls/manifests are 19. The 828 generated members include **30 changed and 798 unchanged outputs** under the actual C build. The four Q copies are `recipe.mjs`, `compare-generated.mjs`, `test-selection.json` and `release-claims.json`; copying them did not make the Q Worker their original author. C's observation manifests do not establish original supplier authorship.

[Original materials](external-record-materials.json) retain **26** complete records, **805,908 raw bytes**, with six original attribution spans. The current installed `QUALIFICATION_MATERIAL_SCHEMA`, `QUALIFICATION_SOURCE_SCHEMA`, coordinate schema and canonical digest owner validate these records and all member coordinates. Record-set digest is `{validation['recordSet']['digest']}`. [Validation](validation-result.json) also rechecks every consumed input and original span. No assessor task or synthetic raw judgment was used to turn unknown attribution into a pass.

[Two chain fragments](source-chain-inputs.json) retain the actual grants, preimage records, original deltas, closures and exact current postimages for **eight real source transitions**. A bounded diagnostic reconstructs every postimage byte from the original patch and preimage, without rendering a replacement delta. It is source-correspondence evidence, not a replacement F11 owner. The unchanged handoff test entry is excluded from newly authored scope; obsolete selected-action07 host/design/test postimages and old generated results are also excluded from these current source transitions.

Git reads use `GIT_OPTIONAL_LOCKS=0` and `git --no-optional-locks`. The exact frozen HEAD tree and commit body are retained; 1,094 selected source paths have real blobs and nine are absent from that tree. Of tracked members, 1,077 match and 17 differ. The commit metadata is retained as original evidence, without assigning its recorded author all inherited semantic work. No history-wide scan or Git mutation occurred.

## Exact missing joins

1. **Original carrier correspondence:** all four S03 handoff repair closure paths are absolute while inventory paths are repository relative; `manifestHasMember` requires exact equality. The four selected-action07 current transitions use original `before/after` patch headers while `patchedMember` accepts `a/b` or bare repository paths. Preimages and actual transitions are valid, but these original carriers do not join the existing consumer unchanged. Original records were not rewritten. A deterministic representation preserving original refs/spans and exact transition equivalence is a proposal requiring Root disposition under the existing owner relation, not a selected repair or new authority.
2. **Concrete identity and authority:** the actual records name Worker activations. The complete correspondence from those labels to concrete author actors and the published Product-authority slot is not established by the routed records. The fragments retain `actorIdentityRef: null` and `authorityRef: null`; the installed full provenance schema predictably refuses these two missing fields. **Zero complete attribution chains or launch-ready tasks are claimed.** Renaming the future assessor or copying a role label would not establish independence.
3. **Complete member coverage:** the other 1,942 members retain their actual classes and precise unknowns. The first ordered unjoined current source is the frozen T287 ticket, `{unknown[0]['digest']}`; all 18 changed/untracked source members are enumerated in the coverage and triage files. The two recent repair records cannot author the inherited source, generated population or external controls. The source maps route later bounded provenance acquisition; they do not prove that records are absent from all history.

The [causal triangulation](causal-triage.json) binds Product/design, integration, identity/authority/lifecycle, effect and Proof variables for each missing relation, including origin, escape, uncertainty, owner, causal cone, re-entry and reproof. Earlier source/build/schema checks had narrower accepted claims; Q explicitly left attribution pending. This cut establishes a current input-construction gap, not an already-proven Product design defect or a failed native F11 run.

The existing conditional `qualification_ruling` route can establish a present, scoped attribution acknowledgment from actual authorized source/Product authority **after** structurally valid source/record chains reach insufficient attribution. It cannot repair invalid byte/path/patch correspondence or missing required chain coverage: `qualification_proof.ts` returns on `invalid` before consulting acknowledgment. It also cannot invent historical ABG authors, waive semantic obligations or waive actual author/peer independence. Sufficient existing source attribution requires no additional acknowledgment. No human ruling was requested here.

## Basis precision and closed boundary

The request accidentally labels `5d306da1…` as the SHA of `stdo_abiogenesis.json`. Actual frozen and canonical Definition bytes have SHA256 **`2c13b1fd28f3aaa624d941537a858f67ca8784f0710f490522147f57964c4051`**. Its selected `constitution.stdo.basis.manifest_sha256` is **`5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64`**, for the same exact installed `v2.5.1-rc.1`. These distinct coordinates are independently preserved; no authority change was inferred and original request bytes remain exact.

[Next inputs](next-inputs.json) expose the actual later mapping and native identity dependencies. Pending scope mapping and native basis are explicit later inputs. Seven semantic seeds, native assessor calls, owner rulings and qualification are outside this activation. This return neither normalizes a historical carrier nor requests source/design repair. Root alone conjoins and selects the next work. Worker closes with work result **incomplete**, preserving useful verified records and all unknowns.
'''
(D/'return.md').write_text(text)

# Final read-only conservation of exactly this cut's inputs; freeze is not
# allowed to acquire moving resources or silently follow successor artifacts.
joins=read(D/'input-joins.json'); failures=[]
for r in joins['records']:
    b=Path(r['path']).read_bytes()
    if len(b)!=r['bytes'] or sha(b)!=r['sha256']:failures.append(r['path'])
assert not failures,failures
index=R/'.git/index'
index_row=row(index)
assert index_row['sha256']=='2b0e5154a5b9145385b027bc82b54bb9da07ba740c86e01d5816dd261f38ae88'
put('conservation.json',{'consumedInputs':len(joins['records']),'mismatches':failures,
    'indexObserved':index_row,'gitReadPolicy':'GIT_OPTIONAL_LOCKS=0; git --no-optional-locks',
    'sourceWrites':0,'nativeResourceAccesses':0,'providerCalls':0,'movingSiblingOutputReads':0,
    'territory':str(D)})
records=[]
for p in sorted(D.rglob('*')):
    if p.is_file() and p.name!='freeze.json':
        b=p.read_bytes();records.append({'path':str(p.relative_to(D)),'bytes':len(b),'sha256':sha(b)})
freeze={'status':'CLOSED','work_result':'incomplete','activation':'T287_FINAL_F11_ATTRIBUTION_INPUTS_01',
    'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'return':row(D/'return.md'),
    'subjectInventory':coverage['subjectInventory'],'recordSet':validation['recordSet'],'records':records,
    'effects':'Only new external input/proof/control bytes in exact territory. No source, Git, native, provider, resource, assessor, ruling or qualification effect.',
    'limits':['Original carrier/identity/authority joins incomplete','Full provenance is not ready','No new attribution judgment or candidate rebind','Worker stops; no self-review activation']}
put('freeze.json',freeze)
print(json.dumps({'return':row(D/'return.md'),'freeze':row(D/'freeze.json'),'files':len(records),
    'ownMaterialBytes':sum(r['bytes'] for r in records),'work_result':'incomplete'}))
