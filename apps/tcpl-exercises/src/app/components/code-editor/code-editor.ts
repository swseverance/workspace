import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { indentWithTab } from '@codemirror/commands';
import { cpp } from '@codemirror/lang-cpp';
import { indentUnit } from '@codemirror/language';
import { Compartment, EditorState, Transaction } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import type { ThemeMode } from '@org/theme';
import { basicSetup, EditorView } from 'codemirror';
import { SkeletonCodeEditor } from '../skeleton-code-editor/skeleton-code-editor';
import { SmartLoader } from '../smart-loader/smart-loader';

const editorStyles = EditorView.theme({
  '&': {
    border: '1px solid rgba(0, 0, 0, 0.15)',
    borderRadius: '4px',
    fontSize: '16px',
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
});

@Component({
  selector: 'app-code-editor',
  imports: [SkeletonCodeEditor, SmartLoader],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.scss',
})
export class CodeEditor implements AfterViewInit, OnChanges, OnDestroy {
  @Input() loading: boolean = false;

  private _code = '';

  @Input() set code(code: string) {
    this._code = code ?? '';
  }

  get code() {
    return this._code;
  }

  private _theme: ThemeMode = 'light';

  @Input() set theme(theme: ThemeMode) {
    this._theme = theme ?? 'light';
  }

  get theme() {
    return this._theme;
  }

  private _readonly = false;

  @Input() set readonly(readonly: boolean) {
    this._readonly = readonly ?? false;
  }

  get readonly() {
    return this._readonly;
  }

  @Input() language: 'cpp' | 'text' = 'cpp';

  /**
   * Identifies the document being edited (e.g. the exercise id). Changing it
   * starts a fresh editor state, so switching documents always shows the new
   * `code` and never carries over the previous one's text or undo history.
   * `code` alone can't signal this: it stays the same while the user types,
   * and two documents can have identical code.
   */
  @Input() docId = '';

  @Output() codeChange = new EventEmitter<string>();

  @ViewChild('host', { static: true })
  private host!: ElementRef<HTMLDivElement>;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeCompartment = new Compartment();
  private readonly readonlyCompartment = new Compartment();
  private view?: EditorView;

  private readonlyExtensions() {
    return [
      EditorView.editable.of(!this.readonly),
      EditorState.readOnly.of(this.readonly),
    ];
  }

  private createState(): EditorState {
    return EditorState.create({
      doc: this.code,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        indentUnit.of('  '),
        this.language === 'cpp' ? cpp() : [],
        editorStyles,
        EditorView.updateListener.of((update) => {
          const isUserInput = update.transactions.some(
            (tr) => tr.annotation(Transaction.userEvent) !== undefined,
          );

          if (update.docChanged && isUserInput) {
            this.codeChange.emit(update.state.doc.toString());
          }
        }),
        this.themeCompartment.of(this.theme === 'dark' ? oneDark : []),
        this.readonlyCompartment.of(this.readonlyExtensions()),
      ],
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.view = new EditorView({
      state: this.createState(),
      parent: this.host.nativeElement,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.view) {
      return;
    }

    // A new document: the fresh state already has the current code, theme
    // and readonly setting.
    if (changes['docId']) {
      this.view.setState(this.createState());
      return;
    }

    if (changes['theme']) {
      this.view.dispatch({
        effects: this.themeCompartment.reconfigure(
          this.theme === 'dark' ? oneDark : [],
        ),
      });
    }

    if (changes['readonly']) {
      this.view.dispatch({
        effects: this.readonlyCompartment.reconfigure(
          this.readonlyExtensions(),
        ),
      });
    }

    if (changes['code'] && this.code !== this.view.state.doc.toString()) {
      this.view.dispatch({
        changes: { from: 0, to: this.view.state.doc.length, insert: this.code },
      });
    }
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  getCode(): string {
    return this.view?.state.doc.toString() ?? this.code;
  }
}
