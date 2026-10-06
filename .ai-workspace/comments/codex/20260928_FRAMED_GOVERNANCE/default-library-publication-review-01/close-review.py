from pathlib import Path
import datetime,hashlib,json,os
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
D=G/'default-library-publication-review-01';S=G/'default-library-publication-repair-01';C=G/'final-candidate-construction-01'
T='build_tenants/abiogenesis/typescript/'
def read(p):return json.loads(p.read_text())
def sha(b):return hashlib.sha256(b).hexdigest()
def row(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def put(n,v):(D/n).write_text(json.dumps(v,indent=2)+'\n')
assert (D/'controls/request.txt').read_bytes()==(D/'controls/joined-request.txt').read_bytes()
cut=read(S/'freeze.json'); attrs=read(S/'source-attribution.json');full=read(D/'independent-full11.json')
checks=read(D/'selected-tests-result.json');assert checks['exitCode']==0
preimage_joins=[]
for m in attrs['sources']:
 p=C/'source-freeze/repo'/m['logicalPath'];b=p.read_bytes();assert b==(S/m['preimage']['path']).read_bytes()
 preimage_joins.append({'source':m['logicalPath'],'originalFrozenCandidate':row(p),'repairPreimage':row(S/m['preimage']['path']),
   'postimage':row(S/m['postimage']['path']),'externalAuthor':m['actualAuthor']})
authority_paths=['specification/GOALS.md','specification/INTENT.md','specification/PRODUCT.md',
 'specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md',
 T+'design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',T+'design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md','AGENTS.md','stdo_abiogenesis.json']
authority=[row(R/p) for p in authority_paths]
authority.append(row(Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1/standards/STDO_REFERENCE_FRAME_BASELINE.md')))
put('source-authority-joins.json',{'authority':authority,'sourcePreimages':preimage_joins,
 'constructionAuthorshipMeaning':'Actual external source edit by /root/s03_phase_b under the retained grant; no ABG author event, supplier authorship or whole F11 attribution ruling is inferred.',
 'reviewerTask':'/root/f11_attribution_inputs','independentSubject':'Distinct other-Worker publication repair only. Closed attribution input work and moving attribution review were not inspected.'})
triage={
 'originalDefect':{'ProductRequirement':'GRAPHFUNCTION-016/017/018 require immutable cumulative typed binding availability; GRAPHFUNCTION-025 requires ordinary GTL templates.',
  'design':'Accepted default wrappers project state to native/C2 task, execute the fixed child and fold its observation into conserved state; publication/closure proof precedes the live witness.',
  'origin':'wrapper() concatenated required state with all node outputs, including fold output state. Every one of the six purposes therefore published the same carried binding twice.',
  'symptom':'Actual installed N2 catalog.admit refused malformed_contribution; the unchanged installed publication validator reports six environment.carries duplicate_identity diagnostics.',
  'integrationEscape':'The earlier local Program helper raw-admitted a publication without validatePublication; installed-root fixture validated only the selected Program publication, leaving added non-selected publications outside that precondition.',
  'identityAndLifecycle':'Carried contract availability is a declaration set, not a sequence of runtime production occurrences. Deduplication changes immutable declaration identity and dependent Product/catalog identity; it does not merge or rewrite ABG occurrences.',
  'ownerAndEffects':'GTL default-library producer owns valid declarations. Existing validator owns refusal. Test helper owns proof preconditions only; no native/C2 leaf, foldback, Program, runtime owner or Public API changed.',
  'proofConjunction':'Six raw wrappers + all eleven actual request publications + unchanged rejection + actual independent consumer, with exact constructor/patch/source correspondence.',
  'causeScope':'Realization defect and omitted proof-consumer join under existing design. No missing Product law or new architecture is established.',
  'recurrencePrevention':'The shared proof helper now validates every actual publication before lower catalog readiness; Program tests invoke the same full-array precondition. Current independent review exercises the existing secondary consumer affected by that helper.',
  'smallestReentry':'realization_refactor',
  'affectedCone':'Three source/proof files; one isolated generated gtl/default_library.js; subsequent generated declaration/Product/catalog/manifest/package identities and affected installed admission proof.',
  'repairComplexity':'One stable set union in the existing producer plus bounded shared proof precondition. No new runtime carrier or controller.'},
 'currentFindings':[],
 'recommendation':'Accept the exact bounded source/component repair. Root owns disposition and any successor construction/native grant.',
 'remainingReproof':['New exact source/build/package/install subject and generated identities','Actual corrected ordinary Public full11 catalog admission, view/conformance and applicable installed execution/cold proof','Remaining complete exact-candidate qualification through existing owners'],
 'evidenceLimits':['Original actual installed refusal is observed at C; corrected acceptance is static compiled source only','Four selected pure tests cover default Program and one real independent consumer; full11 Program closure is not claimed','No corrected immutable Product was built, installed, admitted or qualified by this review','Original runtime resources and moving attribution outputs were not accessed'],
 'reviewCheckCorrection':read(D/'review-check-triage.json')}
put('review-findings.json',triage)

tests=read(D/'selected-tests-command.json')['selectedNames']
code_ref=T+'code/src/gtl/default_library.ts'; helper_ref=T+'test_env/support/root-installed-environment.mjs';test_ref=T+'test_env/tests/t287-default-library.test.mjs'
ret=f'''# Independent review — default-library publication repair 01

**Product Frame.** The fixed fifteen-family ABIogenesis 5.0, GOAL-035/T287 and current default-library outcome govern this review. GTL Program/GraphFunction declarations are immutable definitions; HoG directly traverses admitted GTL; ABG alone owns runtime admission, events, lineage and closure. The six library purposes compose existing native/C2 children, truthful observation foldback and separate parent evaluation. Test helpers are derived tooling. GRAPHFUNCTION-016/017/018/025 and accepted default-library design fix cumulative typed bindings and publication/closure proof. No Product reprice, alternate controller, copied runtime authority or newly inferred execution grant is permitted.

**Verdict: no findings at the authorized source/component scope. Recommend accepting this exact bounded repair.** Executive acceptance, a successor Product and corrected native admission remain separate.

Reviewer `T287_DEFAULT_LIBRARY_PUBLICATION_REVIEW_01` explicitly follows the CLOSED attribution-input Worker activation and examines another actor's repair, authored by `/root/s03_phase_b`. The previous attribution inputs and the parallel moving attribution review were not inspected. The sole output/scratch territory is this directory. Installed `a_c` reproduces the exact 5,785-byte request, SHA256 `b102d05c4f58ef5cb9a6fde8f8c97a7ca0448f8e0df8e16134216d6b4746d721`.

## Exact subject and authority

Repair freeze SHA256 `{sha((S/'freeze.json').read_bytes())}` and return SHA256 `{sha((S/'return.md').read_bytes())}` were independently reacquired. All **5,470** records and all three canonical postimages verify. Each preserved preimage equals its original C frozen source. Applying the original `{sha((S/'source.patch').read_bytes())}` patch in this review's isolated reconstruction reproduces all three postimages exactly. Original external author/grant records remain distinct from ABG-native authorship.

Exact STDO remains `v2.5.1-rc.1`. Definition-file digest is `{sha((R/'stdo_abiogenesis.json').read_bytes())}`; the separately selected installed manifest is `5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64`. [Source/authority bindings](source-authority-joins.json) preserve the actual originals.

## Independent evidence

- **Actual installed original:** all eleven original constructors reproduce the complete N2 failed-call publication array. The unchanged installed validator identifies exactly one invalid publication and its six carried-binding duplicates. Its ten peers pass the same static check. The actual saved Public receipt is `malformed_contribution` at `/contributionManifests`, with `read_only_unchanged`; all 62 N2 frozen records verify. No original live resource was acquired or read.
- **Complete repaired population:** all eleven corrected publications pass both the compiled component validator and the unchanged installed original validator. Full-value comparison proves that the only declaration changes are removal of one repeated state binding from each of six wrappers. All other purposes, contracts, nodes, child callees, effects, Programs and foldback remain equal.
- **Cumulative binding and meaningful refusal:** each raw wrapper keeps stable first-occurrence `[state, task, observation]` availability; canonical publication sorting remains separately unchanged. Required/provided state and each exact native, assessment or C2 child are conserved. Reintroducing the repeated binding into each of the six purposes is rejected by the unchanged installed validator. With Hello selected, an invalid library placed last in the full eleven-member array is rejected by the actual new helper; the valid full array is accepted.
- **Affected consumer:** all four exact pure tests pass, including the previously unrun `independent consumer restricts choices while preserving actual native role and schema owners`. That path constructs its real STDO-based consumer declaration, passes strict publication validation and then validates its restricted Program with the existing native/schema owners. The mixed test file was never run without the exact name filter; no provider/native test ran.
- **Generated impact:** independent comparison finds one changed file, `gtl/default_library.js`, among 260 isolated JavaScript outputs. Publication validators/raw admission remain byte-identical to the original installed implementation. No canonical generated output was written.

The four-test process took {checks['elapsedSeconds']:.3f}s. The independent complete publication/nearest-negative probe took {read(D/'independent-component-result.json')['elapsedSeconds']:.3f}s. See [complete results](independent-full11.json), [test transcript](selected-tests.stdout), [patch reconstruction](patch-reconstruction-result.json) and [generated comparison](generated-correspondence.json).

One Reviewer-owned probe initially expected raw constructor array order from canonical module-publication data. The existing `gtl/canonicalization.ts:137` sorts publication inventories. The original probe and [triage](review-check-triage.json) are retained; only the review's expected representation was corrected. The final probe tests both raw stable order and published canonical order. No subject repair or new Product failure followed from this check mistake.

## Root cause and bounded disposition

The producer conflated cumulative binding availability with the repeated occurrence of the state contract at entry and fold output. The same generator served all six purposes. The earlier Program proof and selected-publication fixture check omitted the actual full publication-validation join, allowing a narrower green to miss the later Public catalog prerequisite.

Existing Product and design already required valid declarations and publication/closure proof. This is a realization defect with a proof integration escape. The repair operates at those two owners: `default_library.ts:43` constructs unique available bindings; `root-installed-environment.mjs:119` validates every member before lower catalog readiness; `t287-default-library.test.mjs:27` applies that precondition to Program proof. The helper remains test tooling and is not a new admission authority. Its location does not promise absence of earlier environment/install setup effects.

[Causal triangulation](review-findings.json) binds Product/design, integration, identity/lifecycle, owner/effect and Proof variables, alternatives, complete affected cone, lawful `realization_refactor` and reproof. The observed defect is closed at source/component scope. No further source change is recommended by this review.

## Limits and return

The original installed rejection is genuine native evidence. Corrected acceptance here is compiled-source static/component evidence using historical artifact coordinates as comparison parameters. It does not verify a changed Product, establish complete eleven-Program closure or prove corrected installed Public behavior.

The original C archive and its qualification block remain unchanged. Any successor needs separately granted source/build/package/install construction and coherent generated Product/manifest/catalog/lock/WorkspaceBinding joins, followed by affected ordinary Public catalog/view/conformance, execution/cold proof and remaining qualification. Earlier accepted native evidence keeps its original subjects; it is not relabeled.

No source fix, canonical generation/build, package/install, native/provider/resource, qualification, Git/index or old-cut mutation occurred. Review writes are confined to the granted directory. Reviewer freezes one return and stops. Root alone accepts, reprices and selects further work.
'''
(D/'return.md').write_text(ret)

bad=[]
for r in cut['records']:
 p=S/r['path']
 if r['kind']=='symlink':
  if not p.is_symlink() or os.readlink(p)!=r['target']:bad.append(str(p))
 else:
  b=p.read_bytes()
  if len(b)!=r['bytes'] or sha(b)!=r['sha256']:bad.append(str(p))
for r in cut['sources']:
 b=(R/r['logicalPath']).read_bytes()
 if len(b)!=r['bytes'] or sha(b)!=r['sha256']:bad.append(r['logicalPath'])
assert not bad,bad
before=read(D/'initial-verification.json');index=row(R/'.git/index');assert index['sha256']==before['indexSha256']
for r in read(D/'component-input-joins.json')['inputs']:
 b=Path(r['path']).read_bytes();assert len(b)==r['bytes'] and 'sha256:'+sha(b)==r['digest']
put('conservation.json',{'repairRecordsVerified':len(cut['records']),'canonicalPostimagesVerified':3,'mismatches':bad,
 'index':index,'nativeResourceReads':0,'providerCalls':0,'subjectEdits':0,'movingAttributionOutputReads':0,
 'territory':str(D)})
records=[]
for p in sorted(D.rglob('*')):
 if p.is_symlink():records.append({'path':str(p.relative_to(D)),'kind':'symlink','target':os.readlink(p)})
 elif p.is_file() and p.name!='freeze.json':
  b=p.read_bytes();records.append({'path':str(p.relative_to(D)),'kind':'file','bytes':len(b),'sha256':sha(b)})
freeze={'status':'CLOSED','role':'Reviewer','activation':'T287_DEFAULT_LIBRARY_PUBLICATION_REVIEW_01',
 'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verdict':'no_findings_at_source_component_scope',
 'subjectFreeze':row(S/'freeze.json'),'return':row(D/'return.md'),'records':records,
 'recommendation':'Accept exact bounded repair; Root owns disposition and successor/native authority.',
 'limits':['No changed installed Product or corrected Public call','No full11 Program closure or qualification','No subject, Git, resource or provider effect'],
 'stop':'Reviewer CLOSED; no mutation, implementation or agent activation follows.'}
put('freeze.json',freeze)
print(json.dumps({'return':row(D/'return.md'),'freeze':row(D/'freeze.json'),'recordCount':len(records),'verdict':freeze['verdict']}))
