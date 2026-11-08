import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import type { AuthState } from '@org/auth';
import { EMPTY } from 'rxjs';
import { App } from './app';

async function render(auth: AuthState) {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter([]),
      provideMockStore({ initialState: { auth } }),
      provideMockActions(() => EMPTY),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture.nativeElement.textContent as string;
}

describe('App', () => {
  it('renders the header', async () => {
    expect(await render({ status: 'signedOut', user: null })).toContain(
      'Weight Tracker',
    );
  });

  it('does not show the logout button when signed out', async () => {
    expect(await render({ status: 'signedOut', user: null })).not.toContain(
      'Logout',
    );
  });

  it('shows the logout button when signed in', async () => {
    expect(await render({ status: 'signedIn', user: { uid: 'u1' } })).toContain(
      'Logout',
    );
  });
});
