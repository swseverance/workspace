import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Environment } from './environment';

describe('Environment', () => {
  let component: Environment;
  let fixture: ComponentFixture<Environment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Environment],
    }).compileComponents();

    fixture = TestBed.createComponent(Environment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
