import {readFile,writeFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
const life="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01";
const read=async p=>JSON.parse(await readFile(p,"utf8"));
const core=await read("/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-20/selected-core.json");
const consumer=await read("/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/consumer-dev10/installed-consumer.json");
const src=core.packageRoot+"/build/code/src/",load=p=>import(pathToFileURL(src+p).href);
const [{constructSemanticRevisionGraphFunction,isNativeSemanticRevisionGraphFunction},{canonicalizeAuthoredGtlCarrier},{sha256Canonical},{modulePublication},{modulePublicationSemanticDigest},{rawAdmitValue},{validatePublication}]=await Promise.all([load("gtl/semantic_revision_publication.js"),load("gtl/canonicalization.js"),load("shared/digests.js"),load("gtl/declarations.js"),load("product/publication.js"),load("validator/raw_admission.js"),load("validator/validation.js")]);
const frozen=await read(life+"/bootstrap-preparation-01/calls/06-catalog.jsonl"),r=frozen.invocation.resources,p=r.publications.at(-1);
const installedBytes=await readFile(consumer.packageRoot+"/build/publication.json"),data=JSON.parse(installedBytes);
const prepared=await read(life+"/bootstrap-declaration-01/prospective-publication.json");
const name="graph-function://odd-glc/native-semantic-revision/construction@5",graph=p.graphFunctions.find(g=>g.name===name);
const canon=g=>canonicalizeAuthoredGtlCarrier(g,"graph_function"),same=(a,b)=>sha256Canonical(a)===sha256Canonical(b);
const fromFactory=constructSemanticRevisionGraphFunction({graphFunctionRef:name,closureContractRef:graph.declarations["abg.closure_contract"],role:"nativeConstruction"});
const materialized=modulePublication({kind:"module_publication",moduleVersion:"5.0.0",...structuredClone(data),artifactDigest:consumer.basis.artifactDigest,productContentDigest:consumer.basis.productContentDigest,productManifestDigest:consumer.basis.manifestDigest,contributions:data.contributions.map(row=>({...structuredClone(row),provenanceRefs:[consumer.basis.artifactDigest,consumer.basis.manifestDigest]}))});
const normalized=structuredClone(p),changed=normalized.graphFunctions.find(g=>g.name===name);changed.environment.carries=[...new Set(changed.environment.carries)];
const validate=q=>validatePublication(rawAdmitValue(q,"module_publication","contract://abiogenesis/gtl/module-publication@5"),q.contributions.map(c=>rawAdmitValue(c,"catalog_contribution","contract://abiogenesis/gtl/catalog-contribution@5")));
const validation=validate(normalized),binding=r.verifiedProducts.at(-1).contributionManifest.publicationBindings.find(b=>b.moduleRef===p.moduleRef);
const report={kind:"pure_producer_relation_and_single_field_counterexample",runtimeCalls:0,subjectEdits:0,graphRef:name,
 installedPublicationFileSha256:createHash("sha256").update(installedBytes).digest("hex"),
 producer:{factoryCanonicalGraphEqualsFrozenGraph:same(canon(fromFactory),graph),installedPayloadGraphEqualsFrozenGraph:same(canon(data.graphFunctions.find(g=>g.name===name)),graph),preparedPublicationGraphEqualsFrozenGraph:same(canon(prepared.graphFunctions.find(g=>g.name===name)),graph),materializedInstalledPublicationEqualsFrozenPublication:same(materialized,p),factoryCarries:fromFactory.environment.carries,nodeOutputCarriers:fromFactory.template.nodes.map(n=>({nodeRef:n.nodeRef,output:n.term.outputCarrierRef})),rawCarriesCount:graph.environment.carries.length,uniqueCarriesCount:new Set(graph.environment.carries).size,exactFactoryRetentionPredicate:isNativeSemanticRevisionGraphFunction(p,graph)},
 manifest:{binding,actualPublicationSemanticDigest:modulePublicationSemanticDigest(p)},
 lifecycle:{requestDigest:sha256Canonical(p.semanticJobLifecycle),installedPayloadDigest:sha256Canonical(data.semanticJobLifecycle),preparedPublicationDigest:sha256Canonical(prepared.semanticJobLifecycle),counterexampleDigest:sha256Canonical(normalized.semanticJobLifecycle)},
 counterexample:{changedField:"one duplicate occurrence removed from target graph environment.carries in memory only",publicationValidationKind:validation.kind,publicationValidationDisposition:validation.disposition,diagnostics:validation.diagnostics,exactOldFactoryRetentionPredicate:isNativeSemanticRevisionGraphFunction(normalized,changed),interpretation:"Single duplicate removal clears this publication validator. The old exact factory rejects caller-only cleanup; repair belongs to the shared producer, then successor declarations. No readiness/catalog/runtime continuation was attempted."}};
await writeFile(new URL("producer-probe.json",import.meta.url),JSON.stringify(report,null,2)+"\n",{flag:"wx"});console.log(JSON.stringify(report,null,2));
