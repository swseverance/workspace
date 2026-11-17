Write a program to "fold" long input lines into two or more shorter lines after the last non-blank character that occurs before the n-th column of input. Make sure your program does something intelligent with very long lines, and if there are no blanks or tabs before the specified column.

In other words, wrap each line at 20 characters, the way a text editor wraps words: if the next word doesn't fit on the line, drop the blanks and tabs to its left and put it on the next line.

**The newline that ends a line isn't counted:** a line can have 20 characters and then its newline.

A few details:

- A word is any run of characters with no blank, tab or newline in it, so punctuation is part of a word.
- A tab counts as one character.
- A word longer than 20 characters doesn't fit on any line, so cut it after every 20 characters.
- Blanks and tabs at the start of an input line are never dropped. Treat them as the start of the line's first word.
- Blanks and tabs that don't fit are dropped like the ones to the left of a word that doesn't fit, and a line that has been broken never gains an empty line.

For example, with `·` standing for a blank, here are four input lines:

```
the·quick·brown·fox·jumps·over·the·lazy·dog
the·quick·brown············fox
ab·cccccccccccccccccccccccccccccc
··aaaaaaaaaaaaaaaaaaaaaa
```

And the output, under a ruler that marks 20 characters:

```
0                  20
|                   |
the quick brown fox
jumps over the lazy
dog
the quick brown
fox
ab
cccccccccccccccccccc
cccccccccc
  aaaaaaaaaaaaaaaaaa
aaaa
```
