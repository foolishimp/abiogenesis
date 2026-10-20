import type { GraphFunction, ImplementationBinding, RootModuleArtifactBasis } from "./contracts.js";
import { type RunEnvironmentDeclaration } from "./stdo_run_environment.js";
import { type GovernancePurpose } from "../product/default_library.js";
export declare function defaultLibraryImplementationBindings(artifact: Pick<RootModuleArtifactBasis, "packageName" | "packageVersion">): readonly ImplementationBinding[];
export declare function defaultGovernanceGraphFunctions(options?: {
    purposes?: readonly GovernancePurpose[];
    recursionBound?: number;
}): readonly GraphFunction[];
export declare const DEFAULT_LIBRARY_STDO_SOURCE: {
    readonly basisRef: "stdo://releases/v2.5.1-rc.1/";
    readonly manifestDigest: "sha256:5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64";
    readonly path: "standards/STDO_REFERENCE_FRAME_BASELINE.md";
    readonly assetPath: "contracts/default-library/stdo/standards/STDO_REFERENCE_FRAME_BASELINE.md";
    readonly byteCount: 133684;
    readonly digest: "sha256:29ac1367a77bf686e621a3e1b88bb39a0ba8e6c44b40e2b29904a7eb5606571d";
    readonly spans: {
        readonly "Derived Executive Frame": {
            readonly startByte: 30700;
            readonly endByte: 35546;
            readonly spanDigest: "sha256:462f85054e7a000076051c2fc0adb7c9b6c80726057ce4112e6da192e501c485";
        };
        readonly "Derived Worker Frame": {
            readonly startByte: 35546;
            readonly endByte: 38401;
            readonly spanDigest: "sha256:97fbe3a344cd77dd263495db42e334916e76d50fdf8f075452ecebe56fd58b26";
        };
        readonly "Derived Reviewer Frame": {
            readonly startByte: 38401;
            readonly endByte: 42638;
            readonly spanDigest: "sha256:b5e9f2ac18af32a6586f860b9bfe23826d9b633ac844a880170652e35952791b";
        };
        readonly "Derived Generic Specialist Frame Set": {
            readonly startByte: 42638;
            readonly endByte: 52663;
            readonly spanDigest: "sha256:a837522281bdfbaa533e8e9ab048b21c183465e8094a8b43c599be40e1586c2b";
        };
        readonly "Derived Product Testing Frame Set": {
            readonly startByte: 52663;
            readonly endByte: 76400;
            readonly spanDigest: "sha256:89765aa681593fdcd6fece4bf88960bd8a883d7e15a32d7e7d433b3fbb53ba8b";
        };
    };
};
export declare const DEFAULT_LIBRARY_CONTEXT_INVENTORY: {
    path: string;
    content: string;
};
export declare function defaultLibraryRunEnvironment(): RunEnvironmentDeclaration;
export declare function constructDefaultGovernanceLibraryModulePublication(artifact: RootModuleArtifactBasis): Readonly<import("./contracts.js").ModulePublication>;
