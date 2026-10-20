import type { ProductInstall } from "./environment.js";
export type InstalledModuleLoadResult = Readonly<{
    kind: "loaded";
    module: Readonly<Record<string, unknown>>;
}> | Readonly<{
    kind: "refused";
    code: "content_mismatch" | "load_failed" | "path_escape";
}>;
/** Physical content established for one resolution lifetime only. The caller
 * retains this derived result, never serializes it or uses it as admission. */
export interface InstalledProductModuleLoading {
    readonly kind: "installed_product_module_loading";
    readonly install: ProductInstall;
    readonly load: (modulePath: string) => Promise<InstalledModuleLoadResult>;
}
export type InstalledProductModulePreparation = InstalledProductModuleLoading | Readonly<{
    readonly kind: "refused";
    readonly code: "content_mismatch";
}>;
export declare function prepareInstalledProductModules(install: ProductInstall): Promise<InstalledProductModulePreparation>;
export declare function loadVerifiedInstalledModule(install: ProductInstall, modulePath: string): Promise<InstalledModuleLoadResult>;
