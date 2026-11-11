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
void undef(char *);

#define MAXLINE 1000 /* maximum input line size */

/* run define, undef and lookup commands from the input */
int main(void) {
  char line[MAXLINE + 2], *name, *text, *p;
  struct nlist *np;
  int c, len;

  for (;;) {
    for (len = 0; (c = getchar()) != EOF && c != '\n';)
      if (len < MAXLINE)
        line[len++] = c;
    if (len == 0 && c == EOF)
      break;
    line[len] = '\0';

    /* split "command name text" */
    for (p = line; *p && *p != ' '; p++)
      ;
    if (*p)
      *p++ = '\0';
    name = p;
    for (; *p && *p != ' '; p++)
      ;
    if (*p)
      *p++ = '\0';
    text = p;

    if (strcmp(line, "define") == 0)
      install(name, text);
    else if (strcmp(line, "undef") == 0)
      undef(name);
    else if (strcmp(line, "lookup") == 0)
      printf("%s\n", (np = lookup(name)) != NULL ? np->defn : "undefined");
    if (c == EOF)
      break;
  }
  return 0;
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
  } else                     /* already there */
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

/* undef: remove name and its definition from hashtab, if it's there */
void undef(char *name) {
  struct nlist *np, *prev;
  unsigned h;

  prev = NULL;
  h = hash(name);
  for (np = hashtab[h]; np != NULL; prev = np, np = np->next)
    if (strcmp(name, np->name) == 0) {
      if (prev == NULL) /* first in its chain */
        hashtab[h] = np->next;
      else
        prev->next = np->next;
      free((void *)np->name);
      free((void *)np->defn);
      free((void *)np);
      return;
    }
}
