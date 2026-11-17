Write a program to "fold" long input lines into two or more shorter lines after the last non-blank character that occurs before the n-th column of input. Make sure your program does something intelligent with very long lines, and if there are no blanks or tabs before the specified column.

In other words, wrap each line at 20 characters, as a text editor wraps words. A word is any run of characters with no blank, tab or newline in it, so punctuation is part of a word. A tab counts as one character.

**The newline that ends a line isn't counted:** a line can have 20 characters and then its newline.

A line of 20 characters or fewer is printed unchanged. A longer line is printed as several lines, each as long as it can be without going past 20 characters:

- Break at a blank or tab, so that no word is split. The word that doesn't fit starts the next line.
- Drop every blank and tab at the break, however many there are. The line before the break doesn't end with them, and the line after it doesn't start with them.
- A word longer than 20 characters has nowhere to break, so cut it after 20 characters.
- Blanks and tabs that aren't at a break stay as they are.

For example, with `·` standing for a blank:

- `the·quick·brown·fox·jumps·over·the·lazy·dog` becomes three lines. `jumps` would take the first line past 20 characters, so it starts the second, and the blank before it is dropped.
- `the·quick·brown············fox` becomes two lines, `the·quick·brown` and `fox`. All 12 blanks are at the break, so all 12 are dropped.
- `the·quick·brown··fox` is 20 characters, so it's printed unchanged, with both blanks.
- `ab·cccccccccccccccccccccccccccccc` becomes three lines: `ab`, then the first 20 of the 30 `c`s, then the other 10.

Those four, under a ruler that marks 20 characters:

```
0                  20
|                   |
the quick brown fox
jumps over the lazy
dog
the quick brown
fox
the quick brown  fox
ab
cccccccccccccccccccc
cccccccccc
```
