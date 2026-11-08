import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, InjectionToken } from '@angular/core';

export const IS_MOBILE = new InjectionToken<boolean>('IS_MOBILE', {
  providedIn: 'root',
  factory: () => inject(BreakpointObserver).isMatched([Breakpoints.XSmall]),
});
