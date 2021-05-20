import {
  SeriesHook,
  WaterfallHook,
  TypeCheckWorkspaceContext,
  TypeCheckWorkspaceConfigurationHooks,
  TestWorkspaceConfigurationHooks,
  TestPackageHooks,
  TestWebAppHooks,
  TestServiceHooks,
  TestWorkspaceContext,
  LintWorkspaceContext,
  LintWorkspaceConfigurationHooks,
  BuildWorkspaceContext,
  BuildWorkspaceConfigurationHooks,
  BuildWebAppHooks,
  BuildPackageHooks,
  BuildServiceHooks,
  DevWorkspaceContext,
  DevWorkspaceConfigurationHooks,
  DevWebAppHooks,
  DevPackageHooks,
  DevServiceHooks,
} from '@sewing-kit/hooks';
import {Package, WebApp, Service, Project, Step} from '@sewing-kit/core';

export enum Env {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

export enum Task {
  Build = 'build',
  Dev = 'dev',
  Test = 'test',
  Lint = 'lint',
  TypeCheck = 'typeCheck',
}

// ==================================================================
// CONSOLIDATED
// ==================================================================

export interface WorkspaceTasks {
  readonly build: SeriesHook<BuildWorkspaceTask>;
  readonly dev: SeriesHook<DevWorkspaceTask>;
  readonly test: SeriesHook<TestWorkspaceTask>;
  readonly lint: SeriesHook<LintWorkspaceTask>;
  readonly typeCheck: SeriesHook<TypeCheckWorkspaceTask>;
}

export interface ProjectTasks<TType extends Project> {
  readonly build: SeriesHook<BuildProjectTask<TType>>;
  readonly dev: SeriesHook<DevProjectTask<TType>>;
  readonly test: SeriesHook<TestProjectTask<TType>>;
}

// ==================================================================
// TYPE CHECK
// ==================================================================

export interface TypeCheckOptions {
  readonly watch?: boolean;
  readonly cache?: boolean;
}

export interface TypeCheckWorkspaceTaskHooks {
  readonly configureHooks: WaterfallHook<TypeCheckWorkspaceConfigurationHooks>;
  readonly configure: SeriesHook<TypeCheckWorkspaceConfigurationHooks>;
  readonly context: WaterfallHook<TypeCheckWorkspaceContext>;
  readonly pre: WaterfallHook<ReadonlyArray<Step>, TypeCheckWorkspaceContext>;
  readonly steps: WaterfallHook<ReadonlyArray<Step>, TypeCheckWorkspaceContext>;
  readonly post: WaterfallHook<ReadonlyArray<Step>, TypeCheckWorkspaceContext>;
}

export interface TypeCheckWorkspaceTask {
  readonly hooks: TypeCheckWorkspaceTaskHooks;
  readonly options: TypeCheckOptions;
}

// ==================================================================
// LINT
// ==================================================================

export interface LintTaskOptions {
  readonly fix?: boolean;
  readonly cache?: boolean;
  readonly allowEmpty?: boolean;
}

export interface LintWorkspaceTaskHooks {
  readonly configureHooks: WaterfallHook<LintWorkspaceConfigurationHooks>;
  readonly configure: SeriesHook<LintWorkspaceConfigurationHooks>;
  readonly context: WaterfallHook<LintWorkspaceContext>;
  readonly pre: WaterfallHook<Step[], LintWorkspaceContext>;
  readonly steps: WaterfallHook<Step[], LintWorkspaceContext>;
  readonly post: WaterfallHook<Step[], LintWorkspaceContext>;
}

export interface LintWorkspaceTask {
  readonly hooks: LintWorkspaceTaskHooks;
  readonly options: LintTaskOptions;
}

// ==================================================================
// TEST
// ==================================================================

export interface TestTaskOptions {
  readonly watch?: boolean;
  readonly debug?: boolean;
  readonly coverage?: boolean;
  readonly testPattern?: string;
  readonly testNamePattern?: string;
  readonly updateSnapshots?: boolean;
}

export interface TestWorkspaceTaskHooks {
  readonly context: WaterfallHook<TestWorkspaceContext>;
  readonly pre: WaterfallHook<Step[], TestWorkspaceContext>;
  readonly post: WaterfallHook<Step[], TestWorkspaceContext>;
  readonly steps: WaterfallHook<Step[], TestWorkspaceContext>;
  readonly project: SeriesHook<TestWorkspaceProjectDetails>;
  readonly webApp: SeriesHook<TestWorkspaceProjectDetails<WebApp>>;
  readonly package: SeriesHook<TestWorkspaceProjectDetails<Package>>;
  readonly service: SeriesHook<TestWorkspaceProjectDetails<Service>>;
  readonly configure: SeriesHook<TestWorkspaceConfigurationHooks>;
  readonly configureHooks: WaterfallHook<TestWorkspaceConfigurationHooks>;
}

export type TestProjectTaskHooks<TType extends Project> = TType extends Package
  ? TestPackageHooks
  : TType extends WebApp
  ? TestWebAppHooks
  : TType extends Service
  ? TestServiceHooks
  : TestPackageHooks | TestWebAppHooks | TestServiceHooks;

export interface TestWorkspaceTask {
  readonly hooks: TestWorkspaceTaskHooks;
  readonly options: TestTaskOptions;
}

export interface TestProjectTask<TType extends Project> {
  readonly hooks: TestProjectTaskHooks<TType>;
  readonly options: TestTaskOptions;
  readonly context: TestWorkspaceContext;
}

export interface TestWorkspaceProjectDetails<TType extends Project = Project>
  extends TestProjectTask<TType> {
  readonly project: Project;
}

// ==================================================================
// BUILD
// ==================================================================

export interface BuildTaskOptions {
  readonly env: Env;
  readonly simulateEnv: Env;
  readonly sourceMaps?: boolean;
  readonly cache?: boolean;
}

export interface BuildWorkspaceTaskHooks {
  readonly configureHooks: WaterfallHook<BuildWorkspaceConfigurationHooks>;
  readonly configure: SeriesHook<BuildWorkspaceConfigurationHooks>;
  readonly context: WaterfallHook<BuildWorkspaceContext>;
  readonly project: SeriesHook<BuildWorkspaceProjectDetails>;
  readonly webApp: SeriesHook<BuildWorkspaceProjectDetails<WebApp>>;
  readonly package: SeriesHook<BuildWorkspaceProjectDetails<Package>>;
  readonly service: SeriesHook<BuildWorkspaceProjectDetails<Service>>;
  readonly pre: WaterfallHook<ReadonlyArray<Step>, BuildWorkspaceContext>;
  readonly post: WaterfallHook<ReadonlyArray<Step>, BuildWorkspaceContext>;
}

export type BuildProjectTaskHooks<TType extends Project> = TType extends Package
  ? BuildPackageHooks
  : TType extends WebApp
  ? BuildWebAppHooks
  : TType extends Service
  ? BuildServiceHooks
  : BuildPackageHooks | BuildWebAppHooks | BuildServiceHooks;

export interface BuildWorkspaceTask {
  readonly hooks: BuildWorkspaceTaskHooks;
  readonly options: BuildTaskOptions;
}

export interface BuildProjectTask<TType extends Project> {
  readonly hooks: BuildProjectTaskHooks<TType>;
  readonly options: BuildTaskOptions;
  readonly context: BuildWorkspaceContext;
}

export interface BuildWorkspaceProjectDetails<TType extends Project = Project>
  extends BuildProjectTask<TType> {
  readonly project: Project;
}

// ==================================================================
// DEV
// ==================================================================

export type DevReloadStyle = 'fast' | false;

export interface DevTaskOptions {
  readonly reload?: DevReloadStyle;
  readonly sourceMaps?: boolean;
}

interface DevWorkspaceStepDetails {
  readonly configuration: DevWorkspaceConfigurationHooks;
}

export interface DevWorkspaceTaskHooks {
  readonly configureHooks: WaterfallHook<DevWorkspaceConfigurationHooks>;
  readonly configure: SeriesHook<DevWorkspaceConfigurationHooks>;
  readonly context: WaterfallHook<DevWorkspaceContext>;
  readonly project: SeriesHook<DevWorkspaceProjectDetails>;
  readonly webApp: SeriesHook<DevWorkspaceProjectDetails<WebApp>>;
  readonly package: SeriesHook<DevWorkspaceProjectDetails<Package>>;
  readonly service: SeriesHook<DevWorkspaceProjectDetails<Service>>;
  readonly pre: WaterfallHook<ReadonlyArray<Step>, DevWorkspaceStepDetails>;
  readonly post: WaterfallHook<ReadonlyArray<Step>, DevWorkspaceStepDetails>;
}

export type DevProjectTaskHooks<TType extends Project> = TType extends Package
  ? DevPackageHooks
  : TType extends WebApp
  ? DevWebAppHooks
  : TType extends Service
  ? DevServiceHooks
  : DevPackageHooks | DevWebAppHooks | DevServiceHooks;

export interface DevWorkspaceTask {
  readonly hooks: DevWorkspaceTaskHooks;
  readonly options: DevTaskOptions;
}

export interface DevProjectTask<TType extends Project> {
  readonly hooks: DevProjectTaskHooks<TType>;
  readonly options: DevTaskOptions;
  readonly context: DevWorkspaceContext;
}

export interface DevWorkspaceProjectDetails<TType extends Project = Project>
  extends DevProjectTask<TType> {
  readonly project: Project;
}
