import { TestBed } from '@angular/core/testing';
import { CheckOutline, CopyOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { ExerciseDescription, splitDescription } from './exercise-description';

describe('splitDescription', () => {
  it('returns prose with no code blocks as one segment', () => {
    expect(splitDescription('<p>Hi</p>\n')).toEqual([
      { kind: 'html', html: '<p>Hi</p>\n' },
    ]);
  });

  it('separates code blocks from the prose around them, in order', () => {
    const html =
      '<p>Before</p>\n<pre><code class="language-c">a &lt; b\n</code></pre>\n<p>Between</p>\n<pre><code>2\n</code></pre>\n<p>After</p>\n';

    expect(splitDescription(html)).toEqual([
      { kind: 'html', html: '<p>Before</p>\n' },
      {
        kind: 'code',
        html: '<pre><code class="language-c">a &lt; b\n</code></pre>',
      },
      { kind: 'html', html: '\n<p>Between</p>\n' },
      { kind: 'code', html: '<pre><code>2\n</code></pre>' },
      { kind: 'html', html: '\n<p>After</p>\n' },
    ]);
  });

  it('drops the empty prose around a description that is only code', () => {
    expect(splitDescription('<pre><code>x</code></pre>\n')).toEqual([
      { kind: 'code', html: '<pre><code>x</code></pre>' },
    ]);
  });
});

describe('ExerciseDescription', () => {
  it('gives each code block a copy button', async () => {
    TestBed.configureTestingModule({
      imports: [ExerciseDescription],
      providers: [provideNzIcons([CheckOutline, CopyOutline])],
    });
    const fixture = TestBed.createComponent(ExerciseDescription);
    fixture.componentRef.setInput(
      'description',
      '<p>Text</p>\n<pre><code>one</code></pre>\n<pre><code>two</code></pre>\n',
    );
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.prose p')?.textContent).toBe('Text');
    expect(root.querySelectorAll('app-code-block pre')).toHaveLength(2);
    expect(root.querySelectorAll('app-code-block button')).toHaveLength(2);
  });
});
