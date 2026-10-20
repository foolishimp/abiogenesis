import type { CatalogContribution, ClosureContract, ContractDeclaration, EvaluatorDeclaration, ImplementationBinding, ModulePublication, ProductSemanticsBinding, RuleDeclaration } from "./contracts.js";
export declare function evaluatorDeclaration(input: Readonly<EvaluatorDeclaration>): EvaluatorDeclaration;
export declare function ruleDeclaration(input: Readonly<RuleDeclaration>): RuleDeclaration;
export declare function contractDeclaration(input: Readonly<ContractDeclaration>): ContractDeclaration;
export declare function implementationBinding(input: Readonly<ImplementationBinding>): ImplementationBinding;
export declare function productSemanticsBinding(input: Readonly<ProductSemanticsBinding>): ProductSemanticsBinding;
export declare function closureContract(input: Readonly<ClosureContract>): ClosureContract;
export declare function catalogContribution(input: Readonly<CatalogContribution>): CatalogContribution;
export declare function modulePublication(input: Readonly<ModulePublication>): Readonly<ModulePublication>;
export declare const GTL_DECLARATION_CONSTRUCTORS: Readonly<{
    catalogContribution: typeof catalogContribution;
    closureContract: typeof closureContract;
    contractDeclaration: typeof contractDeclaration;
    implementationBinding: typeof implementationBinding;
    modulePublication: typeof modulePublication;
    productSemanticsBinding: typeof productSemanticsBinding;
}>;
