Our version of `getword` does not properly handle underscores, string constants, comments, or preprocessor control lines. Write a better version.

```c
/* getword:  get next word or character from input */
int getword(char *word, int lim)
{
    int c, getch(void);
    void ungetch(int);
    char *w = word;

    while (isspace(c = getch()))
        ;
    if (c != EOF)
        *w++ = c;
    if (!isalpha(c)) {
        *w = '\0';
        return c;
    }
    for ( ; --lim > 0; w++)
        if (!isalnum(*w = getch())) {
            ungetch(*w);
            break;
        }
    *w = '\0';
    return word[0];
}
```

Use it in the book's keyword-counting program, which prints the count and name of each C keyword in its input, in alphabetical order, with `printf("%4d %s\n", ...)`. The keywords are the 32 of ANSI C: `auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while`. A name may contain underscores and be any length; skip keywords in string and character constants, `/* */` comments and lines starting with `#`, and the letters in numbers such as `0x1F`.
