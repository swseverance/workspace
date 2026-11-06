import { InjectionToken } from '@angular/core';

export type EnvironmentName = 'prod' | 'dev' | 'local';

export const ENVIRONMENT = new InjectionToken<{ name: EnvironmentName }>(
  'ENVIRONMENT',
);
