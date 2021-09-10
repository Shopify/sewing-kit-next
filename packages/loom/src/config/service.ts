import {ProjectPlugin} from '../plugins';
import {Service, ServiceOptions} from '../core';

import {BaseBuilder, ConfigurationKind} from './base';

class ServiceBuilder extends BaseBuilder<
  ProjectPlugin<Service>,
  ServiceOptions
> {
  constructor() {
    super(ConfigurationKind.Service);
  }

  entry(entry: string) {
    this.options.entry = entry;
    return this;
  }
}

export function createService(
  create: (pkg: ServiceBuilder) => void | Promise<void>,
) {
  return async () => {
    const builder = new ServiceBuilder();
    await create(builder);
    return builder.toOptions();
  };
}
