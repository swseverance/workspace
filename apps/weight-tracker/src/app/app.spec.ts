import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ENVIRONMENT } from '@org/environment';
import { AUTH, FIREBASE_APP_CHECK } from '@org/firebase';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ENVIRONMENT, useValue: { name: 'local' } },
        { provide: AUTH, useValue: null },
        { provide: FIREBASE_APP_CHECK, useValue: null },
      ],
    }).compileComponents();
  });

  it('renders the header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Weight Tracker');
  });

  it('does not show the logout button when signed out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Logout');
  });
});
