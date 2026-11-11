import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { CheckOutline, CopyOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CodeBlock, COPIED_MS } from './code-block';

async function render(html: string, copied = true) {
  const copy = vi.fn().mockReturnValue(copied);

  TestBed.configureTestingModule({
    imports: [CodeBlock],
    providers: [
      provideNzIcons([CheckOutline, CopyOutline]),
      { provide: Clipboard, useValue: { copy } },
    ],
  });

  const fixture = TestBed.createComponent(CodeBlock);
  fixture.componentRef.setInput('html', html);
  await fixture.whenStable();

  const root = fixture.nativeElement as HTMLElement;
  const button = root.querySelector('button')!;

  const click = async () => {
    button.click();
    await fixture.whenStable();
  };

  return { root, button, copy, click, fixture };
}

describe('CodeBlock', () => {
  afterEach(() => vi.useRealTimers());

  it('renders the block', async () => {
    const { root } = await render('<pre><code>int x;\n</code></pre>');

    expect(root.querySelector('pre code')?.textContent).toBe('int x;\n');
  });

  it('copies the text as shown, with entities decoded', async () => {
    const { copy, click } = await render(
      '<pre><code>if (a &lt; b &amp;&amp; c)\n</code></pre>',
    );

    await click();

    expect(copy).toHaveBeenCalledWith('if (a < b && c)\n');
  });

  it('shows a check mark after copying, then goes back', async () => {
    const { button, fixture } = await render('<pre>x</pre>');
    // Faked after rendering: whenStable() waits on timers, so it would hang.
    vi.useFakeTimers();

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copied');

    vi.advanceTimersByTime(COPIED_MS);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copy code');
  });

  it('shows no check mark when copying fails', async () => {
    const { button, click } = await render('<pre>x</pre>', false);

    await click();

    expect(button.getAttribute('aria-label')).toBe('Copy code');
  });
});
