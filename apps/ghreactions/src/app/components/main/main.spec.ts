import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  PullRequestState,
  ReactableType,
  ReactionsFilter,
} from '@org/ghreactions-github/models';
import { provideSeo } from '@org/ui';
import { of } from 'rxjs';
import { Data } from '../../services/data';
import { Main } from './main';

const mockDataService = {
  analytics: () => of(null),
  page: () => of({ rows: [], nextCursor: null }),
};

describe('Main', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: Main }]),
        { provide: Data, useValue: mockDataService },
        provideSeo({ siteName: 'Example' }),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('initializes with defaults when there are no query params', async () => {
    const component = await harness.navigateByUrl('/', Main);

    expect(component.form.get('username')!.value).toBe(
      component.defaultModel.username,
    );
    expect(component.form.get('type')!.value).toBe(component.defaultModel.type);
    expect(component.form.get('state')!.value).toEqual(
      component.defaultModel.state,
    );
    expect(component.form.get('reactions')!.value).toEqual(
      component.defaultModel.reactions,
    );
  });

  it('reads params from the url test 1', async () => {
    const component = await harness.navigateByUrl(
      '/?username=swseverance&type=Issue&state=OPEN',
      Main,
    );

    expect(component.form.get('username')!.value).toBe('swseverance');
    expect(component.form.get('type')!.value).toBe(ReactableType.Issue);
    expect(component.form.get('state')!.value).toEqual([PullRequestState.Open]);
    expect(component.form.get('reactions')!.value).toEqual([]);
  });

  it('reads params from the url test 2', async () => {
    const component = await harness.navigateByUrl(
      '/?username=swseverance&type=PullRequest',
      Main,
    );

    expect(component.form.get('username')!.value).toBe('swseverance');
    expect(component.form.get('type')!.value).toBe(ReactableType.PullRequest);
    expect(component.form.get('state')!.value).toEqual([]);
    expect(component.form.get('reactions')!.value).toEqual([]);
  });

  it('reads params from the url test 3', async () => {
    const component = await harness.navigateByUrl(
      '/?username=swseverance&reactions=WITH_REACTIONS',
      Main,
    );

    expect(component.form.get('username')!.value).toBe('swseverance');
    expect(component.form.get('type')!.value).toBe(component.defaultModel.type);
    expect(component.form.get('state')!.value).toEqual(
      component.defaultModel.state,
    );
    expect(component.form.get('reactions')!.value).toEqual(
      component.defaultModel.reactions,
    );
  });

  it('reads params from the url test 4', async () => {
    const component = await harness.navigateByUrl(
      '/?username=swseverance&type=PullRequest&reactions=WITH_REACTIONS',
      Main,
    );

    expect(component.form.get('username')!.value).toBe('swseverance');
    expect(component.form.get('type')!.value).toBe(ReactableType.PullRequest);
    expect(component.form.get('state')!.value).toEqual([]);
    expect(component.form.get('reactions')!.value).toEqual([
      ReactionsFilter.WithReactions,
    ]);
  });

  it('ignores an unknown type and its filters', async () => {
    const component = await harness.navigateByUrl(
      '/?username=swseverance&type=Bogus&state=OPEN',
      Main,
    );

    expect(component.form.get('username')!.value).toBe('swseverance');
    expect(component.form.get('type')!.value).toBe(component.defaultModel.type);
    expect(component.form.get('state')!.value).toEqual(
      component.defaultModel.state,
    );
  });

  it('disables state & reactions dropdowns when appropriate', async () => {
    const component = await harness.navigateByUrl('/', Main);
    component.form.get('type')!.setValue(ReactableType.CommitComment);

    expect(component.form.get('state')!.value).toEqual([]);
    expect(component.form.get('state')!.disabled).toBe(true);
    expect(component.form.get('reactions')!.value).toEqual([]);
    expect(component.form.get('reactions')!.disabled).toBe(true);
  });

  it('on bad request', async () => {
    const component = await harness.navigateByUrl(
      '/?username=bob&type=PullRequest&state=OPEN&reactions=WITH_REACTIONS&reactions=WITHOUT_REACTIONS',
      Main,
    );
    component.onServerError(new HttpErrorResponse({ status: 400 }));

    expect(component.form.get('username')!.value).toBe(
      component.defaultModel.username,
    );
    expect(component.form.get('type')!.value).toBe(component.defaultModel.type);
    expect(component.form.get('state')!.value).toEqual(
      component.defaultModel.state,
    );
    expect(component.form.get('reactions')!.value).toEqual(
      component.defaultModel.reactions,
    );
  });
});
