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
  /** 4-4: `?` print top, `d` duplicate, `s` swap top two, `c` clear. */
  stackCommands?: boolean;
  /** 4-5: a word of lower-case letters is a command (sin, exp, pow, ...). */
  functions?: boolean;
};

const isDigit = (c: string | null): boolean =>
  c !== null && c >= '0' && c <= '9';

const isLower = (c: string | null): boolean =>
  c !== null && c >= 'a' && c <= 'z';

type Token =
  | { kind: 'eof' }
  | { kind: 'number'; text: string }
  | { kind: 'name'; text: string }
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

    if (this.options.functions && isLower(c)) {
      let name = '';
      while (isLower(c) && name.length < MAXOP - 1) {
        name += c;
        c = this.getch();
      }
      this.ungetch(c);
      return { kind: 'name', text: name };
    }

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

  private unknown(char: string): void {
    this.output += `error: unknown command ${char}\n`;
  }

  // 4-5. WARNING: Math.sin/exp/pow can differ from C's libm in the last
  // significant digit, so a generated test must never print a value these
  // produce. Only name tokenising and the unknown-word path are safe to
  // stress; feed sin/exp/pow a result you don't print, or not at all.
  private mathfnc(name: string): void {
    if (name === 'sin') this.push(Math.sin(this.pop()));
    else if (name === 'exp') this.push(Math.exp(this.pop()));
    else if (name === 'pow') {
      const op2 = this.pop();
      this.push(Math.pow(this.pop(), op2));
    } else this.unknown(name);
  }

  // 4-4 commands. `?` prints the top in the same format a newline does; `d`
  // duplicates it through push (so a full stack reports stack-full); `s`
  // swaps the top two; `c` clears. Each guards too-few elements like main.c.
  private printTop(): void {
    const n = this.stack.length;
    if (n > 0) this.output += `\t${formatG(this.stack[n - 1], 8)}\n`;
    else this.output += 'error: stack empty\n';
  }

  private duplicate(): void {
    const n = this.stack.length;
    if (n > 0) this.push(this.stack[n - 1]);
    else this.output += 'error: stack empty\n';
  }

  private swap(): void {
    const n = this.stack.length;
    if (n > 1) {
      [this.stack[n - 1], this.stack[n - 2]] = [
        this.stack[n - 2],
        this.stack[n - 1],
      ];
    } else {
      this.output += "error: can't swap, fewer than two elements\n";
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
      if (token.kind === 'name') {
        this.mathfnc(token.text);
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
            this.unknown(token.char);
          }
          break;
        case '?':
          if (this.options.stackCommands) this.printTop();
          else this.unknown(token.char);
          break;
        case 'd':
          if (this.options.stackCommands) this.duplicate();
          else this.unknown(token.char);
          break;
        case 's':
          if (this.options.stackCommands) this.swap();
          else this.unknown(token.char);
          break;
        case 'c':
          if (this.options.stackCommands) this.stack.length = 0;
          else this.unknown(token.char);
          break;
        case '\n': {
          // pop() first: it may append "error: stack empty"; folding the call
          // into `output +=` would read output before that and lose it.
          const top = this.pop();
          this.output += `\t${formatG(top, 8)}\n`;
          break;
        }
        default:
          this.unknown(token.char);
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
