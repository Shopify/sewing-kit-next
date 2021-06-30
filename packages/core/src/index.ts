export * from './config';
export * from './core';
export * from './plugins';
export * from './tasks';

// Content from hooks may be augmented from external packages
// A bug in typescript however does not allow augmentation when reexporting with
// `export *`. See https://github.com/microsoft/TypeScript/issues/18877
// So we have to explicitly reexport every named reexport from hooks if we want
// people to be able to do the following and have it work:
//   interface MyExtraHooks { someNewkey: string; }
//   declare module '@sewing-kit/core' {
//    interface BuildProjectConfigurationCustomHooks extends MyExtraHooks {}
//   }
//
// At some point we should identify only the types that can be augmented, and
// split them into a separate file, to reduce this noise
export {SeriesHook, WaterfallHook} from './hooks';

export type {
  //
  // Primitives
  //
  SeriesHookArguments,
  SeriesHookFunction,
  WaterfallHookArguments,
  WaterfallHookFunction,
  //
  // Build
  //
  // Project
  BuildProjectConfigurationCustomHooks,
  BuildProjectConfigurationCoreHooks,
  BuildProjectConfigurationHooks,
  BuildProjectCustomContext,
  BuildProjectCoreContext,
  BuildProjectContext,
  BuildProjectTargetDetails,
  // Package
  BuildPackageTargetOptions,
  BuildPackageConfigurationCustomHooks,
  BuildPackageConfigurationCoreHooks,
  BuildPackageConfigurationHooks,
  BuildPackageCustomContext,
  BuildPackageContext,
  BuildPackageHookContext,
  BuildPackageTargetHooks,
  BuildPackageHooks,
  // Service
  BuildServiceTargetOptions,
  BuildServiceConfigurationCustomHooks,
  BuildServiceConfigurationCoreHooks,
  BuildServiceConfigurationHooks,
  BuildServiceCustomContext,
  BuildServiceContext,
  BuildServiceHookContext,
  BuildServiceTargetHooks,
  BuildServiceHooks,
  // Web App
  BuildWebAppTargetOptions,
  BuildWebAppConfigurationCustomHooks,
  BuildWebAppConfigurationCoreHooks,
  BuildWebAppConfigurationHooks,
  BuildWebAppCustomContext,
  BuildWebAppContext,
  BuildWebAppHookContext,
  BuildWebAppTargetHooks,
  BuildWebAppHooks,
  // Workspace
  BuildWorkspaceConfigurationCustomHooks,
  BuildWorkspaceConfigurationCoreHooks,
  BuildWorkspaceConfigurationHooks,
  BuildWorkspaceCustomContext,
  BuildWorkspaceCoreContext,
  BuildWorkspaceContext,
  //
  // Dev
  //
  // Project
  DevProjectConfigurationCustomHooks,
  DevProjectConfigurationCoreHooks,
  DevProjectConfigurationHooks,
  DevProjectCustomContext,
  DevProjectCoreContext,
  DevProjectContext,
  // Package
  DevPackageConfigurationCustomHooks,
  DevPackageConfigurationCoreHooks,
  DevPackageConfigurationHooks,
  DevPackageCustomContext,
  DevPackageContext,
  DevPackageHooks,
  // Service
  DevServiceConfigurationCustomHooks,
  DevServiceConfigurationCoreHooks,
  DevServiceConfigurationHooks,
  DevServiceCustomContext,
  DevServiceContext,
  DevServiceHooks,
  // Web App
  DevWebAppConfigurationCustomHooks,
  DevWebAppConfigurationCoreHooks,
  DevWebAppConfigurationHooks,
  DevWebAppCustomContext,
  DevWebAppContext,
  DevWebAppHooks,
  // Workspace
  DevWorkspaceConfigurationCustomHooks,
  DevWorkspaceConfigurationCoreHooks,
  DevWorkspaceConfigurationHooks,
  DevWorkspaceCustomContext,
  DevWorkspaceCoreContext,
  DevWorkspaceContext,
  //
  // Lint
  //
  // Workspace
  LintWorkspaceConfigurationCustomHooks,
  LintWorkspaceConfigurationCoreHooks,
  LintWorkspaceConfigurationHooks,
  LintWorkspaceCustomContext,
  LintWorkspaceContext,
  //
  // Test
  //
  // Project
  TestProjectConfigurationCustomHooks,
  TestProjectConfigurationHooks,
  // Web App
  TestWebAppConfigurationCustomHooks,
  TestWebAppConfigurationHooks,
  TestWebAppHooks,
  // Service
  TestServiceConfigurationCustomHooks,
  TestServiceConfigurationHooks,
  TestServiceHooks,
  // Package
  TestPackageConfigurationCustomHooks,
  TestPackageConfigurationHooks,
  TestPackageHooks,
  // Workspace
  TestWorkspaceConfigurationCustomHooks,
  TestWorkspaceConfigurationHooks,
  TestWorkspaceCustomContext,
  TestWorkspaceContext,
  //
  // Type Check
  //
  // Workspace
  TypeCheckWorkspaceConfigurationCustomHooks,
  TypeCheckWorkspaceConfigurationCoreHooks,
  TypeCheckWorkspaceConfigurationHooks,
  TypeCheckWorkspaceCustomContext,
  TypeCheckWorkspaceContext,
} from './hooks';
