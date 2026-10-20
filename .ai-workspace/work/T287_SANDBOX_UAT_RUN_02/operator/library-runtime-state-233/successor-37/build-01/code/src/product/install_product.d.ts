import type { InstallProductRequest, ProductInstallCandidate, ProductInstallResult } from "./contracts.js";
import { type ProductInstall } from "./environment.js";
export declare function installedProductContentMatches(install: ProductInstallCandidate | ProductInstall): Promise<boolean>;
export declare function installProduct(request: InstallProductRequest): Promise<ProductInstallResult>;
