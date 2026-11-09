import { Marked } from 'marked';

// Synchronous: exercise descriptions are converted once, at startup.
const markdown = new Marked({ async: false });

/**
 * Converts an exercise description to HTML. The markdown comes from files in
 * this repo, not users; the browser's [innerHTML] sanitizer still strips
 * anything unsafe.
 */
export function renderMarkdown(source: string): string {
  return markdown.parse(source) as string;
}
