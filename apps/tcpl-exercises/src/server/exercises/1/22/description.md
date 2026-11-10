Write a program to "fold" long input lines into two or more shorter lines after the last non-blank character that occurs before the n-th column of input. Make sure your program does something intelligent with very long lines, and if there are no blanks or tabs before the specified column.

Fold lines longer than 20 characters, counting a tab as one character. End each piece at the last blank or tab that keeps it within 20 characters, and drop the blanks and tabs at the break. If there's no blank or tab to break at, break after 20 characters. Print shorter lines unchanged.
