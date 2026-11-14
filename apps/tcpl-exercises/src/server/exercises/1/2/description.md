This exercise has two steps.

1. Experiment to find out what happens when `printf`'s argument string contains `\c`, where `c` is some character other than the ones K&R lists (`\n`, `\t`, `\b`, `\"`, `\\`). The compiler may warn about an unknown escape sequence.

2. Write a program that prints one line containing, in order, a tab (`\t`), a backspace (`\b`), a double quote (`\"`), a backslash (`\\`) and a newline (`\n`), separated by single spaces.
