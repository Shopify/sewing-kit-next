import {
  WebApp,
  Service,
  createComposedProjectPlugin,
} from '@sewing-kit/plugins';

import {esmodulesOutput} from './plugin-package-esmodules';
import {esnextOutput} from './plugin-package-esnext';

export interface ConsumerOptions {
  readonly esmodules?: boolean;
  readonly esnext?: boolean;
}

export function flexibleOutputs({
  esmodules = true,
  esnext = true,
}: ConsumerOptions = {}) {
  return createComposedProjectPlugin<WebApp | Service>(
    'SewingKit.PackageFlexibleOutputs',
    async (composer) => {
      composer.use(
        esmodules ? esmodulesOutput() : undefined,
        esnext ? esnextOutput() : undefined,
      );
    },
  );
}
