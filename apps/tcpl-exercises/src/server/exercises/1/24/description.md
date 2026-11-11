Write a program to check a C program for rudimentary syntax errors like unmatched parentheses, brackets and braces. Don't forget about quotes, both single and double, escape sequences, and comments. (This program is hard if you do it in full generality.)

Ignore anything inside `/* */` comments, strings and character constants, where a backslash escapes the next character. Print `ok` if everything matches. Otherwise print only the first error found, numbering lines from 1:

- `line N: unmatched C` for a closing `C` that doesn't match the most recent unclosed opener, or, at the end of input, for the most recent unclosed opener `C`.
- `line N: unterminated comment`, where `N` is the line the comment starts on.
- `line N: unterminated string` or `line N: unterminated character constant` when a newline or the end of input comes before the closing quote.
