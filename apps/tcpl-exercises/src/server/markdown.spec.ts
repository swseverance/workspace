import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('wraps plain text in a paragraph', () => {
    expect(renderMarkdown('Write a program.')).toBe(
      '<p>Write a program.</p>\n',
    );
  });

  it('renders inline code, emphasis and lists', () => {
    const html = renderMarkdown('Use `getchar` **once**.\n\n- one\n- two\n');

    expect(html).toContain('<code>getchar</code>');
    expect(html).toContain('<strong>once</strong>');
    expect(html).toContain('<li>one</li>');
  });

  it('renders fenced C code blocks', () => {
    expect(renderMarkdown('```c\nint main() {}\n```')).toContain(
      '<pre><code class="language-c">int main() {}\n</code></pre>',
    );
  });
});
