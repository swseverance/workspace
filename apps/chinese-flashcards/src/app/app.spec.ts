import { TestBed } from '@angular/core/testing';
import { ENVIRONMENT } from '@org/environment';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ENVIRONMENT, useValue: { name: 'local' } }],
    }).compileComponents();
  });

  it('should render the environment name', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('local');
  });
});
