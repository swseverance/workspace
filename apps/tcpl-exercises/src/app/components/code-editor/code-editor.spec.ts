import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { undo } from '@codemirror/commands';
import { CodeEditor } from './code-editor';

const STARTER = '#include <stdio.h>\n';

@Component({
  imports: [CodeEditor],
  template: `<app-code-editor
    [docId]="docId()"
    [code]="code()"
    [readonly]="readonly()"
  />`,
})
class Host {
  readonly docId = signal('1-1');
  readonly code = signal(STARTER);
  readonly readonly = signal(false);
  readonly editor = viewChild.required(CodeEditor);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const host = fixture.componentInstance;
  // The test reaches into the private view to type, like a user would.
  const view = host.editor()['view']!;

  const type = (text: string) =>
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: text },
      userEvent: 'input.type',
    });

  const switchTo = async (docId: string, code: string) => {
    host.docId.set(docId);
    host.code.set(code);
    await fixture.whenStable();
  };

  const setReadonly = async (readonly: boolean) => {
    host.readonly.set(readonly);
    await fixture.whenStable();
  };

  return { editor: host.editor(), view, type, switchTo, setReadonly };
}

describe('CodeEditor', () => {
  it('shows the new code when switching to a document with different code', async () => {
    const { editor, type, switchTo } = await render();

    type('typed in 1-1');
    await switchTo('1-2', 'code for 1-2');

    expect(editor.getCode()).toBe('code for 1-2');
  });

  it('drops typed text when switching to a document with the same code', async () => {
    const { editor, type, switchTo } = await render();

    type('typed in 1-1');
    await switchTo('1-2', STARTER);

    expect(editor.getCode()).toBe(STARTER);
  });

  it("does not undo into the previous document's text after switching", async () => {
    const { editor, view, type, switchTo } = await render();

    type('typed in 1-1');
    await switchTo('1-2', 'code for 1-2');
    undo(view);

    expect(editor.getCode()).toBe('code for 1-2');
  });

  it('blocks edits but keeps text selectable when readonly', async () => {
    const { view, setReadonly } = await render();

    await setReadonly(true);

    expect(view.state.readOnly).toBe(true);
    // Still focusable, so the selection works and can be copied.
    expect(view.contentDOM.getAttribute('contenteditable')).toBe('true');
  });

  it('keeps what the user typed when only the code input changes', async () => {
    const { editor, type, switchTo } = await render();

    type('typed in 1-1');
    await switchTo('1-1', 'typed in 1-1');

    expect(editor.getCode()).toBe('typed in 1-1');
  });
});
