/**
 * A faithful TypeScript model of the book's reverse Polish calculator
 * (calculator.md), used to compute the expected output of generated stress
 * tests. The calculator is extended across chapter 4 (4-3 adds `%` and
 * negative numbers, 4-4 adds stack commands, ...), so this models the base
 * machine and takes flags for the per-exercise additions.
 *
 * It must print exactly what the reference C prints: same `%.8g` formatting,
 * same error messages, same tokenisation. `test-exercises` compiles the real
 * `main.c` and compares, so any drift from the C is caught there.
 *
 * JavaScript and C both use IEEE-754 doubles, and `+ - * /` and `a % b`
 * (which matches C's `fmod` for finite operands) agree between them, so the
 * only subtle parts are number parsing (`cAtof`) and formatting (`formatG`).
 */

const MAXVAL = 100; // stack depth, as in main.c
const MAXOP = 100; // token buffer size, as in main.c

/**
 * What `printf("%.*g", precision, x)` prints: `precision` significant digits
 * (at least one), trailing zeros and a trailing point dropped, exponent form
 * when the decimal exponent is below -4 or at least `precision`.
 */
export function formatG(x: number, precision: number): string {
  if (Number.isNaN(x)) return 'nan';
  if (!Number.isFinite(x)) return x < 0 ? '-inf' : 'inf';
  const p = precision < 1 ? 1 : precision;
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';

  const [mantissa, exponent] = x.toExponential(p - 1).split('e');
  const e = Number(exponent);

  if (e >= -4 && e < p) {
    // Fixed notation; Number(...) drops the trailing zeros %g also drops.
    return String(Number(x.toPrecision(p)));
  }

  const digits = String(Math.abs(e)).padStart(2, '0');
  return `${Number(mantissa)}e${e < 0 ? '-' : '+'}${digits}`;
}

/**
 * C's `atof` of a number token produced by `getop`: the token is already a
 * clean run of an optional `-`, digits and one `.`, so `Number` converts it,
 * except that a token with no digit (`.`, `-`, `-.`) is 0, where `Number`
 * would give `NaN`.
 */
function cAtof(token: string): number {
  return /[0-9]/.test(token) ? Number(token) : 0;
}

export type CalculatorOptions = {
  /** 4-3: a `-` before a digit or `.` starts a negative number. */
  negativeNumbers?: boolean;
  /** 4-3: the `%` operator (remainder, via C's `fmod`). */
  modulus?: boolean;
};

const isDigit = (c: string | null): boolean =>
  c !== null && c >= '0' && c <= '9';

type Token =
  | { kind: 'eof' }
  | { kind: 'number'; text: string }
  | { kind: 'op'; char: string };

class Calculator {
  private readonly input: string;
  private pos = 0;
  private readonly pushback: string[] = [];
  private readonly stack: number[] = [];
  private readonly options: CalculatorOptions;
  output = '';

  constructor(input: string, options: CalculatorOptions) {
    this.input = input;
    this.options = options;
  }

  private getch(): string | null {
    if (this.pushback.length > 0) return this.pushback.pop() as string;
    return this.pos < this.input.length ? this.input[this.pos++] : null;
  }

  private ungetch(c: string | null): void {
    // main.c only ever pushes back a real character (`if (c != EOF)`).
    if (c !== null) this.pushback.push(c);
  }

  /** getop: the next number, operator character, newline, or end of input. */
  private getop(): Token {
    let c = this.getch();
    while (c === ' ' || c === '\t') c = this.getch();
    if (c === null) return { kind: 'eof' };

    const numberStart =
      isDigit(c) || c === '.' || (this.options.negativeNumbers && c === '-');
    if (!numberStart) return { kind: 'op', char: c };

    let text = '';
    if (c === '-') {
      const next = this.getch();
      if (isDigit(next) || next === '.') {
        text = '-';
        c = next;
      } else {
        this.ungetch(next);
        return { kind: 'op', char: '-' };
      }
    }
    if (isDigit(c)) {
      while (isDigit(c) && text.length < MAXOP - 1) {
        text += c;
        c = this.getch();
      }
    }
    if (c === '.') {
      text += '.';
      c = this.getch();
      while (isDigit(c) && text.length < MAXOP - 1) {
        text += c;
        c = this.getch();
      }
    }
    this.ungetch(c);
    return { kind: 'number', text };
  }

  private pop(): number {
    const value = this.stack.pop();
    if (value === undefined) {
      this.output += 'error: stack empty\n';
      return 0;
    }
    return value;
  }

  private push(value: number): void {
    if (this.stack.length < MAXVAL) {
      this.stack.push(value);
    } else {
      this.output += `error: stack full, can't push ${formatG(value, 6)}\n`;
    }
  }

  /** Divide/remainder share the zero-divisor guard; the dividend stays. */
  private divide(apply: (a: number, b: number) => number): void {
    const divisor = this.pop();
    if (divisor !== 0) {
      this.push(apply(this.pop(), divisor));
    } else {
      this.output += 'error: zero divisor\n';
    }
  }

  run(): string {
    for (;;) {
      const token = this.getop();
      if (token.kind === 'eof') break;
      if (token.kind === 'number') {
        this.push(cAtof(token.text));
        continue;
      }
      switch (token.char) {
        case '+':
          this.push(this.pop() + this.pop());
          break;
        case '*':
          this.push(this.pop() * this.pop());
          break;
        case '-': {
          const op2 = this.pop();
          this.push(this.pop() - op2);
          break;
        }
        case '/':
          this.divide((a, b) => a / b);
          break;
        case '%':
          if (this.options.modulus) {
            this.divide((a, b) => a % b); // JS % matches C fmod for finite
          } else {
            this.output += `error: unknown command ${token.char}\n`;
          }
          break;
        case '\n': {
          // pop() first: it may append "error: stack empty"; folding the call
          // into `output +=` would read output before that and lose it.
          const top = this.pop();
          this.output += `\t${formatG(top, 8)}\n`;
          break;
        }
        default:
          this.output += `error: unknown command ${token.char}\n`;
          break;
      }
    }
    return this.output;
  }
}

/** Runs `input` through the calculator and returns exactly what it prints. */
export function runCalculator(
  input: string,
  options: CalculatorOptions = {},
): string {
  return new Calculator(input, options).run();
}
