import type {
  Step,
  Target,
  TargetBuilder,
  WebApp,
  Service,
  Package,
  Project,
} from '@sewing-kit/core';

// ==================================================================
// PRIMITIVES
// ==================================================================

export const UNSET = Symbol('SewingKit.Hooks.Unset');
type Unset = typeof UNSET;

export type SeriesHookArguments<
  TFirst = Unset,
  TSecond = Unset,
  TThird = Unset
> = TFirst extends Unset
  ? []
  : TSecond extends Unset
  ? [TFirst]
  : TThird extends Unset
  ? [TFirst, TSecond]
  : [TFirst, TSecond, TThird];

export type SeriesHookFunction<TFirst, TSecond, TThird> = (
  ...args: SeriesHookArguments<TFirst, TSecond, TThird>
) => void | Promise<void>;

export class SeriesHook<TFirst = Unset, TSecond = Unset, TThird = Unset> {
  private hooks = new Set<SeriesHookFunction<TFirst, TSecond, TThird>>();

  get hasHooks() {
    return this.hooks.size > 0;
  }

  hook(
    idOrHook: string | SeriesHookFunction<TFirst, TSecond, TThird>,
    maybeHook?: SeriesHookFunction<TFirst, TSecond, TThird>,
  ) {
    if (typeof idOrHook === 'function') {
      this.hooks.add(idOrHook);
    } else if (maybeHook != null) {
      this.hooks.add(maybeHook);
    }

    return this;
  }

  async run(...args: SeriesHookArguments<TFirst, TSecond, TThird>) {
    for (const hook of [...this.hooks]) {
      await hook(...args);
    }
  }
}

export type WaterfallHookArguments<
  TValue,
  TFirst = Unset,
  TSecond = Unset,
  TThird = Unset
> = TFirst extends Unset
  ? [TValue]
  : TSecond extends Unset
  ? [TValue, TFirst]
  : TThird extends Unset
  ? [TValue, TFirst, TSecond]
  : [TValue, TFirst, TSecond, TThird];

export type WaterfallHookFunction<TValue, TFirst, TSecond, TThird> = (
  ...args: WaterfallHookArguments<TValue, TFirst, TSecond, TThird>
) => TValue | Promise<TValue>;

export class WaterfallHook<
  TValue,
  TFirst = Unset,
  TSecond = Unset,
  TThird = Unset
> {
  private hooks = new Set<
    WaterfallHookFunction<TValue, TFirst, TSecond, TThird>
  >();

  get hasHooks() {
    return this.hooks.size > 0;
  }

  // ID is automatically being passed in, but we just aren’t using it for anything
  hook(
    idOrHook: string | WaterfallHookFunction<TValue, TFirst, TSecond, TThird>,
    maybeHook?: WaterfallHookFunction<TValue, TFirst, TSecond, TThird>,
  ) {
    if (typeof idOrHook === 'function') {
      this.hooks.add(idOrHook);
    } else if (maybeHook != null) {
      this.hooks.add(maybeHook);
    }

    return this;
  }

  async run(...args: WaterfallHookArguments<TValue, TFirst, TSecond, TThird>) {
    const [initialValue, ...extraArgs] = args;

    let currentValue = initialValue;

    for (const hook of [...this.hooks]) {
      currentValue = await (hook as any)(currentValue, ...extraArgs);
    }

    return currentValue;
  }
}

// ==================================================================
// BUILD
// ==================================================================

// PROJECT

export interface BuildProjectConfigurationCustomHooks {}
export interface BuildProjectConfigurationCoreHooks {}
export interface BuildProjectConfigurationHooks
  extends BuildProjectConfigurationCoreHooks,
    Partial<BuildProjectConfigurationCustomHooks> {}

export interface BuildProjectCustomContext {}
export interface BuildProjectCoreContext {}
export interface BuildProjectContext
  extends BuildProjectCoreContext,
    Partial<BuildProjectCustomContext> {}

export interface BuildProjectTargetDetails<
  TType extends Project,
  TOptions,
  TContext,
  THooks
> {
  readonly target: Target<Project & TType, TOptions>;
  readonly context: TContext;
  readonly hooks: THooks;
}

// PACKAGE

export interface BuildPackageTargetOptions {
  [key: string]: unknown;
}

export interface BuildPackageConfigurationCustomHooks
  extends BuildProjectConfigurationCustomHooks {}

export interface BuildPackageConfigurationCoreHooks
  extends BuildProjectConfigurationCoreHooks {}

export interface BuildPackageConfigurationHooks
  extends BuildProjectConfigurationHooks,
    BuildPackageConfigurationCoreHooks,
    Partial<BuildPackageConfigurationCustomHooks> {}

export interface BuildPackageCustomContext extends BuildProjectCustomContext {}

interface BuildPackageCoreContext extends BuildProjectCoreContext {}

export interface BuildPackageContext
  extends BuildPackageCoreContext,
    Partial<BuildPackageCustomContext> {}

export interface BuildPackageHookContext {
  readonly project: BuildPackageContext;
  readonly workspace: BuildWorkspaceContext;
}

export interface BuildPackageTargetHooks {
  readonly configure: SeriesHook<BuildPackageConfigurationHooks>;
  readonly steps: WaterfallHook<
    ReadonlyArray<Step>,
    BuildPackageConfigurationHooks
  >;
}

export interface BuildPackageHooks {
  readonly targets: WaterfallHook<
    ReadonlyArray<TargetBuilder<Package, BuildPackageTargetOptions>>
  >;
  readonly configureHooks: WaterfallHook<BuildPackageConfigurationHooks>;
  readonly context: WaterfallHook<BuildPackageContext>;
  readonly steps: WaterfallHook<ReadonlyArray<Step>, BuildPackageHookContext>;
  readonly target: SeriesHook<
    BuildProjectTargetDetails<
      Package,
      BuildPackageTargetOptions,
      BuildPackageHookContext,
      BuildPackageTargetHooks
    >
  >;
}

// SERVICE

export interface BuildServiceTargetOptions {
  [key: string]: unknown;
}

export interface BuildServiceConfigurationCustomHooks
  extends BuildProjectConfigurationCustomHooks {}

export interface BuildServiceConfigurationCoreHooks
  extends BuildProjectConfigurationCoreHooks {}

export interface BuildServiceConfigurationHooks
  extends BuildProjectConfigurationHooks,
    BuildServiceConfigurationCoreHooks,
    Partial<BuildServiceConfigurationCustomHooks> {}

export interface BuildServiceCustomContext extends BuildProjectCustomContext {}

interface BuildServiceCoreContext extends BuildProjectCoreContext {}

export interface BuildServiceContext
  extends BuildServiceCoreContext,
    Partial<BuildServiceCustomContext> {}

export interface BuildServiceHookContext {
  readonly project: BuildServiceContext;
  readonly workspace: BuildWorkspaceContext;
}

export interface BuildServiceTargetHooks {
  readonly configure: SeriesHook<BuildServiceConfigurationHooks>;
  readonly steps: WaterfallHook<
    ReadonlyArray<Step>,
    BuildServiceConfigurationHooks
  >;
}

export interface BuildServiceHooks {
  readonly targets: WaterfallHook<
    ReadonlyArray<TargetBuilder<Service, BuildServiceTargetOptions>>
  >;
  readonly configureHooks: WaterfallHook<BuildServiceConfigurationHooks>;
  readonly context: WaterfallHook<BuildServiceContext>;
  readonly steps: WaterfallHook<ReadonlyArray<Step>, BuildServiceHookContext>;
  readonly target: SeriesHook<
    BuildProjectTargetDetails<
      Service,
      BuildServiceTargetOptions,
      BuildServiceHookContext,
      BuildServiceTargetHooks
    >
  >;
}

// WEB APP

export interface BuildWebAppTargetOptions {
  [key: string]: unknown;
}

export interface BuildWebAppConfigurationCustomHooks
  extends BuildProjectConfigurationCustomHooks {}

export interface BuildWebAppConfigurationCoreHooks
  extends BuildProjectConfigurationCoreHooks {}

export interface BuildWebAppConfigurationHooks
  extends BuildProjectConfigurationHooks,
    BuildWebAppConfigurationCoreHooks,
    Partial<BuildWebAppConfigurationCustomHooks> {}

export interface BuildWebAppCustomContext extends BuildProjectCustomContext {}

interface BuildWebAppCoreContext extends BuildProjectCoreContext {}

export interface BuildWebAppContext
  extends BuildWebAppCoreContext,
    Partial<BuildWebAppCustomContext> {}

export interface BuildWebAppHookContext {
  readonly project: BuildWebAppContext;
  readonly workspace: BuildWorkspaceContext;
}

export interface BuildWebAppTargetHooks {
  readonly configure: SeriesHook<BuildWebAppConfigurationHooks>;
  readonly steps: WaterfallHook<
    ReadonlyArray<Step>,
    BuildWebAppConfigurationHooks
  >;
}

export interface BuildWebAppHooks {
  readonly targets: WaterfallHook<
    ReadonlyArray<TargetBuilder<WebApp, BuildWebAppTargetOptions>>
  >;
  readonly configureHooks: WaterfallHook<BuildWebAppConfigurationHooks>;
  readonly context: WaterfallHook<BuildWebAppContext>;
  readonly steps: WaterfallHook<ReadonlyArray<Step>, BuildWebAppHookContext>;
  readonly target: SeriesHook<
    BuildProjectTargetDetails<
      WebApp,
      BuildWebAppTargetOptions,
      BuildWebAppHookContext,
      BuildWebAppTargetHooks
    >
  >;
}

// WORKSPACE

export interface BuildWorkspaceConfigurationCustomHooks {}

export interface BuildWorkspaceConfigurationCoreHooks {}

export interface BuildWorkspaceConfigurationHooks
  extends BuildWorkspaceConfigurationCoreHooks,
    Partial<BuildWorkspaceConfigurationCustomHooks> {}

export interface BuildWorkspaceCustomContext {}

export interface BuildWorkspaceCoreContext {
  readonly configuration: BuildWorkspaceConfigurationHooks;
}

export interface BuildWorkspaceContext
  extends BuildWorkspaceCoreContext,
    Partial<BuildWorkspaceCustomContext> {}

// ==================================================================
// DEV
// ==================================================================

// PROJECT

export interface DevProjectConfigurationCustomHooks {}
export interface DevProjectConfigurationCoreHooks {}
export interface DevProjectConfigurationHooks
  extends DevProjectConfigurationCoreHooks,
    Partial<DevProjectConfigurationCustomHooks> {}

export interface DevProjectCustomContext {}
export interface DevProjectCoreContext {}
export interface DevProjectContext
  extends DevProjectCoreContext,
    Partial<DevProjectCustomContext> {}

// PACKAGE

export interface DevPackageConfigurationCustomHooks
  extends DevProjectConfigurationCustomHooks {}
export interface DevPackageConfigurationCoreHooks
  extends DevProjectConfigurationCoreHooks {}
export interface DevPackageConfigurationHooks
  extends DevProjectConfigurationHooks,
    DevPackageConfigurationCoreHooks,
    Partial<DevPackageConfigurationCustomHooks> {}

export interface DevPackageCustomContext extends DevProjectCustomContext {}

interface DevPackageCoreContext extends DevProjectCoreContext {}

export interface DevPackageContext
  extends DevPackageCoreContext,
    Partial<DevPackageCustomContext> {}

export interface DevPackageHooks {
  readonly configureHooks: WaterfallHook<DevPackageConfigurationHooks>;
  readonly configure: SeriesHook<DevPackageConfigurationHooks>;
  readonly context: WaterfallHook<DevPackageContext>;
  readonly steps: WaterfallHook<
    ReadonlyArray<Step>,
    DevPackageConfigurationHooks,
    DevPackageContext
  >;
}

// SERVICE

export interface DevServiceConfigurationCustomHooks
  extends DevProjectConfigurationCustomHooks {}

export interface DevServiceConfigurationCoreHooks
  extends DevProjectConfigurationCoreHooks {
  readonly ip: WaterfallHook<string | undefined>;
  readonly port: WaterfallHook<number | undefined>;
}

export interface DevServiceConfigurationHooks
  extends DevProjectConfigurationHooks,
    DevServiceConfigurationCoreHooks,
    Partial<DevServiceConfigurationCustomHooks> {}

export interface DevServiceCustomContext extends DevProjectCustomContext {}

interface DevServiceCoreContext extends DevProjectCoreContext {}

export interface DevServiceContext
  extends DevServiceCoreContext,
    Partial<DevServiceCustomContext> {}

export interface DevServiceHooks {
  readonly configureHooks: WaterfallHook<DevServiceConfigurationHooks>;
  readonly configure: SeriesHook<DevServiceConfigurationHooks>;
  readonly context: WaterfallHook<DevServiceContext>;
  readonly steps: WaterfallHook<
    ReadonlyArray<Step>,
    DevServiceConfigurationHooks,
    DevServiceContext
  >;
}

// WEB APP

export interface DevWebAppConfigurationCustomHooks
  extends DevProjectConfigurationCustomHooks {}
export interface DevWebAppConfigurationCoreHooks
  extends DevProjectConfigurationCoreHooks {}
export interface DevWebAppConfigurationHooks
  extends DevProjectConfigurationHooks,
    DevWebAppConfigurationCoreHooks,
    Partial<DevWebAppConfigurationCustomHooks> {}

export interface DevWebAppCustomContext extends DevProjectCustomContext {}

interface DevWebAppCoreContext extends DevProjectCoreContext {}

export interface DevWebAppContext
  extends DevWebAppCoreContext,
    Partial<DevWebAppCustomContext> {}

export interface DevWebAppHooks {
  readonly configureHooks: WaterfallHook<DevWebAppConfigurationHooks>;
  readonly configure: SeriesHook<DevWebAppConfigurationHooks>;
  readonly context: WaterfallHook<DevWebAppContext>;
  readonly steps: WaterfallHook<
    ReadonlyArray<Step>,
    DevWebAppConfigurationHooks,
    DevWebAppContext
  >;
}

// WORKSPACE

export interface DevWorkspaceConfigurationCustomHooks {}

export interface DevWorkspaceConfigurationCoreHooks {}

export interface DevWorkspaceConfigurationHooks
  extends DevWorkspaceConfigurationCoreHooks,
    Partial<DevWorkspaceConfigurationCustomHooks> {}

export interface DevWorkspaceCustomContext {}

export interface DevWorkspaceCoreContext {
  readonly configuration: DevWorkspaceConfigurationHooks;
}

export interface DevWorkspaceContext
  extends DevWorkspaceCoreContext,
    Partial<DevWorkspaceCustomContext> {}

// ==================================================================
// LINT
// ==================================================================

// WORKSPACE

export interface LintWorkspaceConfigurationCustomHooks {}
export interface LintWorkspaceConfigurationCoreHooks {}

export interface LintWorkspaceConfigurationHooks
  extends LintWorkspaceConfigurationCoreHooks,
    Partial<LintWorkspaceConfigurationCustomHooks> {}

export interface LintWorkspaceCustomContext {}

interface LintWorkspaceCoreContext {
  readonly configuration: LintWorkspaceConfigurationHooks;
}

export interface LintWorkspaceContext
  extends LintWorkspaceCoreContext,
    Partial<LintWorkspaceCustomContext> {}

// ==================================================================
// TEST
// ==================================================================

// PROJECT

export interface TestProjectConfigurationCustomHooks {}

interface TestProjectConfigurationCoreHooks {}

export interface TestProjectConfigurationHooks
  extends TestProjectConfigurationCoreHooks,
    Partial<TestProjectConfigurationCustomHooks> {}

// WEB APP

export interface TestWebAppConfigurationCustomHooks {}

interface TestWebAppConfigurationCoreHooks {}

export interface TestWebAppConfigurationHooks
  extends TestProjectConfigurationHooks,
    TestWebAppConfigurationCoreHooks,
    Partial<TestWebAppConfigurationCustomHooks> {}

export interface TestWebAppHooks {
  readonly configureHooks: WaterfallHook<TestWebAppConfigurationHooks>;
  readonly configure: SeriesHook<TestWebAppConfigurationHooks>;
}

// SERVICE

export interface TestServiceConfigurationCustomHooks {}

interface TestServiceConfigurationCoreHooks {}

export interface TestServiceConfigurationHooks
  extends TestProjectConfigurationHooks,
    TestServiceConfigurationCoreHooks,
    Partial<TestServiceConfigurationCoreHooks> {}

export interface TestServiceHooks {
  readonly configureHooks: WaterfallHook<TestServiceConfigurationHooks>;
  readonly configure: SeriesHook<TestServiceConfigurationHooks>;
}

// PACKAGE

export interface TestPackageConfigurationCustomHooks {}

interface TestPackageConfigurationCoreHooks {}

export interface TestPackageConfigurationHooks
  extends TestProjectConfigurationHooks,
    TestPackageConfigurationCoreHooks,
    Partial<TestPackageConfigurationCoreHooks> {}

export interface TestPackageHooks {
  readonly configureHooks: WaterfallHook<TestPackageConfigurationHooks>;
  readonly configure: SeriesHook<TestPackageConfigurationHooks>;
}

// WORKSPACE

export interface TestWorkspaceConfigurationCustomHooks {}

interface TestWorkspaceConfigurationCoreHooks {}

export interface TestWorkspaceConfigurationHooks
  extends TestWorkspaceConfigurationCoreHooks,
    Partial<TestWorkspaceConfigurationCustomHooks> {}

export interface TestWorkspaceCustomContext {}

interface TestWorkspaceCoreContext {
  readonly configuration: TestWorkspaceConfigurationHooks;
}

export interface TestWorkspaceContext
  extends TestWorkspaceCoreContext,
    Partial<TestWorkspaceCustomContext> {}

// ==================================================================
// TYPE CHECK
// ==================================================================

// WORKSPACE

export interface TypeCheckWorkspaceConfigurationCustomHooks {}
export interface TypeCheckWorkspaceConfigurationCoreHooks {}

export interface TypeCheckWorkspaceConfigurationHooks
  extends TypeCheckWorkspaceConfigurationCoreHooks,
    Partial<TypeCheckWorkspaceConfigurationCustomHooks> {}

export interface TypeCheckWorkspaceCustomContext {}

interface TypeCheckWorkspaceCoreContext {
  readonly configuration: TypeCheckWorkspaceConfigurationHooks;
}

export interface TypeCheckWorkspaceContext
  extends TypeCheckWorkspaceCoreContext,
    Partial<TypeCheckWorkspaceCustomContext> {}
