#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

struct nlist {        /* table entry: */
  struct nlist *next; /* next entry in chain */
  char *name;         /* defined name */
  char *defn;         /* replacement text */
};

struct nlist *lookup(char *);
struct nlist *install(char *name, char *defn);
char *strdup(char *);
int getch(void);
void ungetch(int);
void copyconst(int quote);
void copycomment(void);
int getname(char *s, int lim, int c);
void directive(void);

#define MAXWORD 100  /* longest name */
#define MAXLINE 1000 /* longest replacement text */

/* copy the input, processing #define lines and replacing the names they
   define */
int main(void) {
  int c, d, linestart;
  char name[MAXWORD];
  struct nlist *np;

  linestart = 1;
  while ((c = getch()) != EOF) {
    if (c == '#' && linestart) {
      directive(); /* uses up the line, so the next one starts */
      continue;
    } else if (isalpha(c) || c == '_') {
      getname(name, MAXWORD, c);
      printf("%s", (np = lookup(name)) != NULL ? np->defn : name);
    } else if (isdigit(c)) { /* a number: copy it whole */
      putchar(c);
      while (isalnum(d = getch()) || d == '_' || d == '.')
        putchar(d);
      if (d != EOF)
        ungetch(d);
    } else if (c == '"' || c == '\'')
      copyconst(c);
    else if (c == '/' && (d = getch()) == '*')
      copycomment();
    else {
      if (c == '/' && d != EOF)
        ungetch(d);
      putchar(c);
    }
    linestart = (c == '\n');
  }
  return 0;
}

/* directive: handle a line starting with #, the # already read: install
   a #define, or copy any other line unchanged */
void directive(void) {
  char word[MAXWORD], name[MAXWORD], text[MAXLINE + 1];
  int c, i;

  for (i = 0; isalpha(c = getch()) && i < MAXWORD - 1; i++)
    word[i] = c;
  word[i] = '\0';
  if (strcmp(word, "define") != 0) { /* copy the line unchanged */
    printf("#%s", word);
    for (; c != '\n' && c != EOF; c = getch())
      putchar(c);
    if (c == '\n')
      putchar(c);
    return;
  }
  while (c == ' ' || c == '\t')
    c = getch();
  getname(name, MAXWORD, c);
  while ((c = getch()) == ' ' || c == '\t')
    ;
  for (i = 0; c != '\n' && c != EOF; c = getch())
    if (i < MAXLINE)
      text[i++] = c;
  text[i] = '\0';
  install(name, text);
}

/* getname: read a name starting with c into s */
int getname(char *s, int lim, int c) {
  char *w = s;

  for (*w++ = c; isalnum(c = getch()) || c == '_';)
    if (w < s + lim - 1)
      *w++ = c;
  *w = '\0';
  if (c != EOF)
    ungetch(c);
  return s[0];
}

/* copyconst: copy a string or character constant, its quote already
   read */
void copyconst(int quote) {
  int c;

  putchar(quote);
  while ((c = getch()) != EOF) {
    putchar(c);
    if (c == '\\') { /* copy the escaped character too */
      if ((c = getch()) != EOF)
        putchar(c);
    } else if (c == quote)
      break;
  }
}

/* copycomment: copy a comment, its opening already read */
void copycomment(void) {
  int c, prev;

  printf("/*");
  for (prev = 0; (c = getch()) != EOF; prev = c) {
    putchar(c);
    if (prev == '*' && c == '/')
      break;
  }
}

#define HASHSIZE 101

static struct nlist *hashtab[HASHSIZE]; /* pointer table */

/* hash: form hash value for string s */
unsigned hash(char *s) {
  unsigned hashval;

  for (hashval = 0; *s != '\0'; s++)
    hashval = *s + 31 * hashval;
  return hashval % HASHSIZE;
}

/* lookup: look for s in hashtab */
struct nlist *lookup(char *s) {
  struct nlist *np;

  for (np = hashtab[hash(s)]; np != NULL; np = np->next)
    if (strcmp(s, np->name) == 0)
      return np; /* found */
  return NULL;   /* not found */
}

/* install: put (name, defn) in hashtab */
struct nlist *install(char *name, char *defn) {
  struct nlist *np;
  unsigned hashval;

  if ((np = lookup(name)) == NULL) { /* not found */
    np = (struct nlist *)malloc(sizeof(*np));
    if (np == NULL || (np->name = strdup(name)) == NULL)
      return NULL;
    hashval = hash(name);
    np->next = hashtab[hashval];
    hashtab[hashval] = np;
  } else                    /* already there */
    free((void *)np->defn); /* free previous defn */
  if ((np->defn = strdup(defn)) == NULL)
    return NULL;
  return np;
}

/* strdup: make a duplicate of s */
char *strdup(char *s) {
  char *p;

  p = (char *)malloc(strlen(s) + 1); /* +1 for '\0' */
  if (p != NULL)
    strcpy(p, s);
  return p;
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
