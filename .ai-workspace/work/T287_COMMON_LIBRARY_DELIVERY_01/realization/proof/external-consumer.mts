// Declaration-only installed consumer: no relative source import or runtime execution.
import type * as Product from '@abiogenesis/typescript-tenant/product';
import type * as Gtl from '@abiogenesis/typescript-tenant/gtl';
import type * as Abg from '@abiogenesis/typescript-tenant/abg';
import type * as Public from '@abiogenesis/typescript-tenant/public';
import type * as Validator from '@abiogenesis/typescript-tenant/validator';

export type InstalledDeclarationSurface = {
  resolve: typeof Product.ProductExecutionResolutionPort.resolve;
  acquireSource: typeof Product.observeRunEnvironment;
  sourceMembers: typeof Product.runEnvironmentRecordMembers;
  standalone: typeof Gtl.constructStdoRunEnvironmentDeclaration;
  eventResource: typeof Abg.readRuntimeEventsAtDurablePrefix;
  publicCall: typeof Public.constructInstalledPublicDefinitionCall;
  programLaw: typeof Validator.validateProgram;
};
