import { WORKSITE_COMMAND_FORWARD_IDS as F } from "../product/worksite_command_forward_identity.js";
import { isWorksiteCommandForwardTask } from "../product/worksite_command_forward.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as C2 } from "../product/worksite_command_execution.js";
import { authenticateWorksiteCommandForwardBasis } from "../abg/worksite_command_forward.js";
import { realizeWorksiteCommandExecution, installedProductInventoryDigest } from "./worksite_command_execution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate } from "./contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const same=(a:unknown,b:unknown)=>canonicalJson(a as JsonValue)===canonicalJson(b as JsonValue);
function descriptor(prepare:boolean):PackagedLeafImplementationDescriptor {
  const body={implementationRef:prepare?F.prepareImplementationRef:F.implementationRef,packageName:ABI5_PACKAGE_NAME,
    packageVersion:ABI5_PACKAGE_VERSION,modulePath:"build/code/src/implementation/worksite_command_forward.js",
    namedSymbol:prepare?"prepareWorksiteCommandForward":"realizeWorksiteCommandForward",computeRegime:prepare?"F_D" as const:"F_P" as const,
    inputContractRef:prepare?F.requestContractRef:F.taskContractRef,outputContractRef:prepare?F.taskContractRef:F.observationContractRef,
    failureContractRef:C2.failureContractRef,refusalContractRef:C2.refusalContractRef};
  return deepFreeze({kind:"packaged_leaf_implementation_descriptor",schemaVersion:"5.0.0",descriptorDigest:sha256Canonical(body),...body});
}
export const WORKSITE_COMMAND_FORWARD_PREPARE_DESCRIPTOR=descriptor(true);
export const WORKSITE_COMMAND_FORWARD_EXECUTE_DESCRIPTOR=descriptor(false);
export function prepareWorksiteCommandForward(input:unknown,occurrence:LeafExecutionOccurrence):Readonly<LeafRealizationCandidate> {
  const basis=occurrence.worksiteCommandForwardBasis,owner=basis===undefined?null:authenticateWorksiteCommandForwardBasis(basis,true);
  if(owner===null||owner.call.implementationRef!==F.prepareImplementationRef||owner.call.cCallRef!==occurrence.cCallRef||
    !same(input,owner.relation.task.request))throw new TypeError("forward preparation requires its current native occurrence");
  const resultCandidate=owner.relation.task as unknown as Readonly<Record<string,JsonValue>>;
  return deepFreeze({kind:"leaf_realization_candidate",schemaVersion:"5.0.0",disposition:"success",
    evidenceCandidates:[{kind:"deterministic_evidence_candidate",schemaVersion:"5.0.0",implementationRef:F.prepareImplementationRef,
      inputDigest:sha256Canonical(input as JsonValue),outputDigest:sha256Canonical(resultCandidate)}],resultCandidate});
}
export function realizeWorksiteCommandForward(input:unknown,occurrence:LeafExecutionOccurrence) {
  const basis=occurrence.worksiteCommandForwardBasis,owner=basis===undefined?null:authenticateWorksiteCommandForwardBasis(basis,true);
  if(owner===null||owner.call.implementationRef!==F.implementationRef||owner.call.cCallRef!==occurrence.cCallRef||
    !isWorksiteCommandForwardTask(input)||!same(input,owner.relation.task))throw new TypeError("forward command requires its admitted preparation source");
  const inventories=owner.relation.installedRoots.map(root=>({root,digest:installedProductInventoryDigest(root)}));
  const {worksiteCommandForwardBasis:_basis,...plain}=occurrence;
  const prepared=realizeWorksiteCommandExecution(input,plain);
  return deepFreeze({...prepared,async complete(exchange:Parameters<typeof prepared.complete>[0]){
    if(inventories.some(row=>installedProductInventoryDigest(row.root)!==row.digest))
      throw new TypeError("forward historical/current installed Product inventory changed");
    const result=await prepared.complete(exchange);
    if(inventories.some(row=>installedProductInventoryDigest(row.root)!==row.digest))
      throw new TypeError("forward historical/current installed Product inventory changed");
    return result;
  }});
}
