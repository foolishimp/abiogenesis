import { isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { installedProductContentMatches } from "./install_product.js";
export async function prepareInstalledProductModules(install) {
    if (!(await installedProductContentMatches(install))) {
        return Object.freeze({ kind: "refused", code: "content_mismatch" });
    }
    return Object.freeze({
        kind: "installed_product_module_loading",
        install,
        load: (modulePath) => loadModuleWithinProduct(install, modulePath),
    });
}
export async function loadVerifiedInstalledModule(install, modulePath) {
    const prepared = await prepareInstalledProductModules(install);
    return prepared.kind === "refused" ? prepared : prepared.load(modulePath);
}
async function loadModuleWithinProduct(install, modulePath) {
    const exactPath = resolve(install.installedRoot, modulePath);
    const relation = relative(install.installedRoot, exactPath);
    if (relation.length === 0 ||
        relation === ".." ||
        relation.startsWith(`..${sep}`) ||
        isAbsolute(relation)) {
        return Object.freeze({
            kind: "refused",
            code: "path_escape",
        });
    }
    try {
        const loaded = await import(pathToFileURL(exactPath).href);
        return Object.freeze({
            kind: "loaded",
            module: loaded,
        });
    }
    catch {
        return Object.freeze({
            kind: "refused",
            code: "load_failed",
        });
    }
}
