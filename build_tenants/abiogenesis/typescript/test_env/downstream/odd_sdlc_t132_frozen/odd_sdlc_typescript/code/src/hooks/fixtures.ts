// Implements: REQ-F-ODDSDLC-043

import { admitSdlcHookInvocation } from "./admission.js";
import type { SdlcHookContract, SdlcHookInvocation } from "./carriers.js";
import { defaultOperationForTarget } from "./policy.js";

export function minimalSdlcHookInvocationForContract(input: {
  readonly contract: SdlcHookContract;
  readonly targetAssetId: string;
  readonly fpWorkerContractRef: string;
}): SdlcHookInvocation {
  const sourceBindings = input.contract.sourceAssetTypes.map((assetType) =>
    Object.freeze({
      nodeName: assetType,
      assetIds: [`asset://${assetType}`]
    })
  );
  const inputIdentities = input.contract.sourceAssetTypes.map((assetType) =>
    Object.freeze({
      assetId: `asset://${assetType}`,
      uri: `file:///workspace/${assetType}`,
      declaredType: assetType,
      digest: `sha256:${assetType}`,
      byteCount: assetType.length
    })
  );
  return admitSdlcHookInvocation({
    hookName: `hook://${input.contract.edgeName}`,
    edgeName: input.contract.edgeName,
    edgeClass: input.contract.edgeClass,
    sourceBindings,
    targetBinding: {
      nodeName: input.contract.targetAssetType,
      assetIds: [input.targetAssetId]
    },
    inputIdentities,
    requestedOperation: defaultOperationForTarget(input.contract.targetAssetType),
    fpWorkerContractRef: input.fpWorkerContractRef
  });
}
