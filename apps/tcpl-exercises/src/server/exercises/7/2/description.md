Write a program that will print arbitrary input in a sensible way. As a minimum, it should print non-graphic characters in octal or hexadecimal according to local custom, and break long text lines.

Print each character that `isprint` accepts (graphic characters and the blank) as it is, and every other character except newline as `\x` and two lower-case hexadecimal digits, so a tab is `\x09`. Keep output lines to at most 40 characters: start a new line before a character whose printed form wouldn't fit. Copy newlines, and add none at the end.
