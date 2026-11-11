Write a function `escape(s,t)` that converts characters like newline and tab into visible escape sequences like `\n` and `\t` as it copies the string `t` to `s`. Use a `switch`. Write a function for the other direction as well, converting escape sequences into the real characters.

Handle newline, tab and backslash (`\n`, `\t` and `\\`), and copy every other character unchanged, including a backslash that doesn't start one of these sequences. Read the whole input, at most 3000 characters, into `t`. Print `escape(s,t)` followed by a newline, then `t` converted the other way.
