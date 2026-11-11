#include <stdio.h>
#include <ctype.h>
#include <string.h>

#define MAXWORD 100

struct key {
  char *word;
  int count;
} keytab[] = {{"auto", 0},     {"break", 0},    {"case", 0},     {"char", 0},
              {"const", 0},    {"continue", 0}, {"default", 0},  {"do", 0},
              {"double", 0},   {"else", 0},     {"enum", 0},     {"extern", 0},
              {"float", 0},    {"for", 0},      {"goto", 0},     {"if", 0},
              {"int", 0},      {"long", 0},     {"register", 0}, {"return", 0},
              {"short", 0},    {"signed", 0},   {"sizeof", 0},   {"static", 0},
              {"struct", 0},   {"switch", 0},   {"typedef", 0},  {"union", 0},
              {"unsigned", 0}, {"void", 0},     {"volatile", 0}, {"while", 0}};

#define NKEYS (sizeof keytab / sizeof keytab[0])

int getword(char *, int);
int binsearch(char *, struct key *, int);
int getch(void);
void ungetch(int);

/* count C keywords */
int main(void) {
  int n;
  char word[MAXWORD];

  while (getword(word, MAXWORD) != EOF)
    if (isalpha(word[0]) || word[0] == '_')
      if ((n = binsearch(word, keytab, NKEYS)) >= 0)
        keytab[n].count++;
  for (n = 0; n < NKEYS; n++)
    if (keytab[n].count > 0)
      printf("%4d %s\n", keytab[n].count, keytab[n].word);
  return 0;
}

/* binsearch: find word in tab[0]...tab[n-1] */
int binsearch(char *word, struct key tab[], int n) {
  int cond;
  int low, high, mid;

  low = 0;
  high = n - 1;
  while (low <= high) {
    mid = (low + high) / 2;
    if ((cond = strcmp(word, tab[mid].word)) < 0)
      high = mid - 1;
    else if (cond > 0)
      low = mid + 1;
    else
      return mid;
  }
  return -1;
}

/* getword: get next word or character from input; a word is a letter or
   underscore, then any letters, digits and underscores. String and
   character constants, comments and preprocessor control lines are
   skipped, and a number is returned as its first digit, so the letters
   in 0x1F or 1e5 aren't taken for a word. A word longer than lim - 1
   characters is cut short, but read to its end. */
int getword(char *word, int lim) {
  int c, d, prev;
  char *w = word;
  static int linestart = 1; /* 1 if only blanks so far on this line */

  for (;;) {
    while (isspace(c = getch()))
      if (c == '\n')
        linestart = 1;
    if (c == '#' && linestart) { /* preprocessor control line */
      while ((c = getch()) != '\n' && c != EOF)
        ;
      if (c == EOF)
        break;
      continue;
    }
    linestart = 0;
    if (c == '"' || c == '\'') { /* string or character constant */
      while ((d = getch()) != c && d != EOF)
        if (d == '\\')
          getch(); /* skip the escaped character */
    } else if (c == '/') {
      if ((d = getch()) == '*') { /* comment */
        for (prev = 0; (d = getch()) != EOF && !(prev == '*' && d == '/');)
          prev = d;
      } else {
        if (d != EOF)
          ungetch(d);
        break;
      }
    } else
      break;
  }

  if (c != EOF)
    *w++ = c;
  if (!isalpha(c) && c != '_') {
    if (isdigit(c)) { /* a number: skip the rest of it */
      while (isalnum(d = getch()) || d == '_' || d == '.')
        ;
      if (d != EOF)
        ungetch(d);
    }
    *w = '\0';
    return c;
  }
  while (isalnum(d = getch()) || d == '_')
    if (w < word + lim - 1)
      *w++ = d;
  if (d != EOF)
    ungetch(d);
  *w = '\0';
  return word[0];
}

#define BUFSIZE 100

char buf[BUFSIZE]; /* buffer for ungetch */
int bufp = 0;      /* next free position in buf */

/* getch: get a (possibly pushed-back) character */
int getch(void) {
  return (bufp > 0) ? buf[--bufp] : getchar();
}

/* ungetch: push character back on input */
void ungetch(int c) {
  if (bufp >= BUFSIZE)
    printf("ungetch: too many characters\n");
  else
    buf[bufp++] = c;
}
