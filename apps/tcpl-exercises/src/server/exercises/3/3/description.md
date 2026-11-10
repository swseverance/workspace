Write a function `expand(s1,s2)` that expands shorthand notations like `a-z` in the string `s1` into the equivalent complete list `abc...xyz` in `s2`. Allow for letters of either case and digits, and be prepared to handle cases like `a-b-c` and `a-z0-9` and `-a-z`. Arrange that a leading or trailing `-` is taken literally.

Expand `x-y` only when `x` and `y` are both lower case letters, both upper case letters or both digits, and `x` comes no later than `y`; copy anything else unchanged. Each input line, at most 1000 characters, holds `s1` without its newline. Print `s2` on a line of its own.
