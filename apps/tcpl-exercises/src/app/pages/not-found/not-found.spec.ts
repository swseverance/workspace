import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideSeo } from '@org/ui';
import { NotFound } from './not-found';

describe('NotFound', () => {
  function create(responseInit?: ResponseInit) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideSeo({ siteName: 'Example' }),
        ...(responseInit
          ? [{ provide: RESPONSE_INIT, useValue: responseInit }]
          : []),
      ],
    });

    return TestBed.createComponent(NotFound);
  }

  it('sets a 404 status during SSR', () => {
    const responseInit: ResponseInit = {};

    create(responseInit);

    expect(responseInit.status).toBe(404);
  });

  it('renders in the browser, where there is no response to set', () => {
    const fixture = create();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(
      'Page not found',
    );
  });

  it('asks search engines not to index the page', () => {
    create();

    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe(
      'noindex',
    );
  });
});
