import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=dirname(import.meta.dirname),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(name,value)=>fs.writeFileSync(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(read(join(D,'construction-execution-grant.json')).activation,'T287_RC1_SUCCESSOR_CONSTRUCTION_07');
const selected=read(join(D,'final-selected-core.json')),verification=read(join(D,'final-product-verification-summary.json'));
const pkg=read(join(selected.packageRoot,'package.json'));
const load=name=>import(pathToFileURL(join(selected.packageRoot,pkg.exports['./'+name].import)).href);
const [gtl,validator,product]=await Promise.all(['gtl','validator','product'].map(load));
const began=performance.now(),basis={...selected.basis,productManifestDigest:selected.basis.manifestDigest};
assert.deepEqual(verification.basis,selected.basis);
const generator=fs.readFileSync(join(D,'final-source/build_tenants/abiogenesis/typescript/scripts/generate-product-manifest.mjs'),'utf8');
const constructorBlock=/const modulePublications = \[([\s\S]*?)\];/.exec(generator); assert.ok(constructorBlock,'actual generator module-publication population');
const constructors=[...constructorBlock[1].matchAll(/(construct\w+ModulePublication)\(publicationBasis\)/g)].map(m=>m[1]);
assert.equal(new Set(constructors).size,constructors.length); assert.equal(constructors.length,verification.publicationBindings.length);
const publications=constructors.map(name=>{assert.equal(typeof gtl[name],'function');return gtl[name](basis);});
const rows=publications.map((publication,i)=>{
  const raw=validator.rawAdmitValue(publication,'module_publication','contract://abiogenesis/gtl/module-publication@5');
  const contributions=publication.contributions.map(c=>validator.rawAdmitValue(c,'catalog_contribution','contract://abiogenesis/gtl/catalog-contribution@5'));
  const result=raw.kind!=='raw_admitted_value'?raw:contributions.find(c=>c.kind!=='raw_admitted_value')??validator.validatePublication(raw,contributions);
  return {constructor:constructors[i],moduleRef:publication.moduleRef,owningProductId:publication.owningProductId,
    publicationDigest:product.modulePublicationSemanticDigest(publication),result};
});
const status=rows.every(r=>r.result.kind==='publication_validation')?'passed':'failed';
save('final-installed-publication-results.json',{status,installedExports:{root:selected.packageRoot,gtl:pkg.exports['./gtl'],validator:pkg.exports['./validator'],product:pkg.exports['./product']},
  actualVerifiedBasis:selected.basis,constructorPopulationFrom:'exact selected generator modulePublications array',rows,elapsedMs:performance.now()-began,
  limit:'Static installed publication validity only; no ordinary runtime admission or all-Program closure.'});
assert.equal(status,'passed','installed publication validity failure; retained outcomes');
assert.deepEqual(rows.map(r=>[r.moduleRef,r.publicationDigest].join('\0')).sort(),verification.publicationBindings.map(r=>[r.moduleRef,r.publicationDigest].join('\0')).sort());
save('final-publication-bindings.json',{actualVerifiedBasis:selected.basis,rootModuleArtifactBasis:basis,
  constructorPopulation:rows.map(({constructor,moduleRef,publicationDigest})=>({constructor,moduleRef,publicationDigest})),modulePublications:publications,
  manifestJoin:'Complete actual constructor population equals installed owner publication bindings',
  authorityLimit:'Evidence JSON is not nominal verification; runtime caller reacquires current owner verification and environment.'});
save('final-construction-readiness.json',{status:'CONSTRUCTION_READY_PENDING_EXECUTIVE_REVIEW',selected,
  sourceFreezeSHA256:product.sha256Bytes(fs.readFileSync(join(D,'final-source-freeze-manifest.json'))),
  sourceMembers:read(join(D,'final-source-members.json')).length,generated:read(join(D,'final-generated-summary.json')),
  archiveMembers:read(join(D,'final-package-identity.json')).archiveMembers,installedPublicationCount:rows.length,
  physicalInstalledVerification:true,installedFullPublicationValidity:true,manifestBindingEquality:true,
  nativeAdmission:false,qualified:false,published:false,F11:'whole installed discriminator and genuine assessment remain future ordinary execution'});
console.log(JSON.stringify({status,publications:rows.length,productContentDigest:selected.basis.productContentDigest,elapsedMs:performance.now()-began}));
