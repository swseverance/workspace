import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ScrollTopOnNavigation } from './scroll-top-on-navigation';

@Component({
  imports: [ScrollTopOnNavigation],
  template: `<div libScrollTopOnNavigation></div>`,
})
class Host {}

describe('ScrollTopOnNavigation', () => {
  let events: Subject<unknown>;

  function setup(platform: 'browser' | 'server') {
    events = new Subject();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { events } },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });

    const fixture = TestBed.createComponent(Host);
    const element: HTMLElement = fixture.nativeElement.querySelector('div');
    element.scrollTo = vi.fn();
    return element;
  }

  it('scrolls to the top when a navigation ends', () => {
    const element = setup('browser');

    events.next(new NavigationStart(1, '/exercises/1-2'));
    expect(element.scrollTo).not.toHaveBeenCalled();

    events.next(new NavigationEnd(1, '/exercises/1-2', '/exercises/1-2'));
    expect(element.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('does nothing on the server', () => {
    const element = setup('server');

    events.next(new NavigationEnd(1, '/', '/'));

    expect(element.scrollTo).not.toHaveBeenCalled();
  });
});
