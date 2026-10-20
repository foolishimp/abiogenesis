// Future source-blind check resolves only the exact installed successor package.
// This does not assert runtime admission or semantic completion.
import {ProductEnvironmentPort,ProductExecutionResolutionPort,ProductRunInvocationPort} from '@abiogenesis/typescript-tenant/product';
import {constructInstalledPublicDefinitionCall} from '@abiogenesis/typescript-tenant/public';
export type ResolutionInput=Parameters<typeof ProductEnvironmentPort.resolve>[0];
export type ExecutionInput=Parameters<typeof ProductExecutionResolutionPort.resolve>[0];
export type PreparationInput=Parameters<typeof ProductRunInvocationPort.prepare>[0];
export type PublicCallInput=Parameters<typeof constructInstalledPublicDefinitionCall>[0];
export const owners={ProductEnvironmentPort,ProductExecutionResolutionPort,ProductRunInvocationPort,constructInstalledPublicDefinitionCall};
