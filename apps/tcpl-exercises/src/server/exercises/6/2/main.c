#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

#define MAXWORD 101   /* longest name, + '\0' */
#define MAXNAMES 5000 /* most distinct names */
#define DEFLEN 6      /* characters compared by default */

struct tnode { /* the tree node: */
  char *word;  /* points to the name */
  struct tnode *left;
  struct tnode *right;
};

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

struct tnode *addtree(struct tnode *, char *);
void collect(struct tnode *);
int getword(char *, int);
int binsearch(char *, struct key *, int);
int getch(void);
void ungetch(int);

char *names[MAXNAMES]; /* the distinct names, in order */
int nnames = 0;

/* print groups of names that are the same in their first n characters
   (6, or set with -n) but different after that */
int main(int argc, char *argv[]) {
  struct tnode *root = NULL;
  char word[MAXWORD];
  int n, i, j;

  n = DEFLEN;
  if (argc > 1 && (*++argv)[0] == '-')
    n = atoi(*argv + 1);

  while (getword(word, MAXWORD) != EOF)
    if ((isalpha(word[0]) || word[0] == '_') &&
        binsearch(word, keytab, NKEYS) < 0 && strlen(word) >= n)
      root = addtree(root, word);
  collect(root);

  for (i = 0; i < nnames; i = j) {
    for (j = i + 1; j < nnames && strncmp(names[i], names[j], n) == 0; j++)
      ;
    if (j - i >= 2) {
      printf("%s", names[i]);
      while (++i < j)
        printf(" %s", names[i]);
      printf("\n");
    }
  }
  return 0;
}

struct tnode *talloc(void);
char *strdup(char *);

/* addtree: add a node with w, at or below p, unless it's there already */
struct tnode *addtree(struct tnode *p, char *w) {
  int cond;

  if (p == NULL) { /* a new word has arrived */
    p = talloc();  /* make a new node */
    p->word = strdup(w);
    p->left = p->right = NULL;
  } else if ((cond = strcmp(w, p->word)) < 0)
    p->left = addtree(p->left, w);
  else if (cond > 0)
    p->right = addtree(p->right, w);
  return p;
}

/* collect: put the names in tree p into names[], in order */
void collect(struct tnode *p) {
  if (p != NULL) {
    collect(p->left);
    if (nnames < MAXNAMES)
      names[nnames++] = p->word;
    collect(p->right);
  }
}

/* talloc: make a tnode */
struct tnode *talloc(void) {
  return (struct tnode *)malloc(sizeof(struct tnode));
}

/* strdup: make a duplicate of s */
char *strdup(char *s) {
  char *p;

  p = (char *)malloc(strlen(s) + 1); /* +1 for '\0' */
  if (p != NULL)
    strcpy(p, s);
  return p;
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
