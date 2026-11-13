import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  GithubOutline,
  LoginOutline,
  LogoutOutline,
  MoonOutline,
  SunOutline,
} from '@ant-design/icons-angular/icons';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import type { AuthState } from '@org/auth';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { EMPTY } from 'rxjs';
import { App } from './app';

async function render(auth: AuthState) {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter([]),
      provideNzIcons([
        GithubOutline,
        LoginOutline,
        LogoutOutline,
        MoonOutline,
        SunOutline,
      ]),
      provideMockStore({ initialState: { auth } }),
      // AuthFacade listens for sign-in link results.
      provideMockActions(() => EMPTY),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('App', () => {
  it('renders the title', async () => {
    const root = await render({ status: 'signedOut', user: null });

    expect(root.querySelector('strong')?.textContent).toContain(
      'K&R Exercises',
    );
  });

  it('offers sign in when signed out', async () => {
    const root = await render({ status: 'signedOut', user: null });

    expect(
      root.querySelector('[aria-label="Sign in with Google"]'),
    ).not.toBeNull();
    expect(root.querySelector('[aria-label="Sign out"]')).toBeNull();
  });

  it('offers sign out when signed in', async () => {
    const root = await render({ status: 'signedIn', user: { uid: 'u1' } });

    expect(root.querySelector('[aria-label="Sign out"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Sign in with Google"]')).toBeNull();
  });
});
