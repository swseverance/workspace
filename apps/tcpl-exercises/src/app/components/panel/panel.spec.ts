import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Panel } from './panel';

@Component({
  imports: [Panel],
  template: `
    <app-panel heading="Heading">
      <p>Body</p>

      @if (footer; as text) {
        <span panel-footer>{{ text }}</span>
      }
    </app-panel>
  `,
})
class Host {
  footer: string | null = 'Footer';
}

function render(footer: string | null): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.footer = footer;
  fixture.detectChanges();

  return fixture.nativeElement.querySelector('.panel-footer');
}

describe('Panel', () => {
  it('puts [panel-footer] content in the footer, not the body', () => {
    expect(render('Footer').textContent).toBe('Footer');
  });

  it('leaves the footer empty, so hidden, with nothing to put in it', () => {
    expect(render(null).childElementCount).toBe(0);
    expect(render(null).textContent).toBe('');
  });
});
