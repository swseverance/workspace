#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

#define MAXWORD 100
#define MAXDISTINCT 20000 /* most distinct words */

struct tnode {  /* the tree node: */
  char *word;   /* points to the text */
  int count;    /* number of occurrences */
  struct tnode *left;
  struct tnode *right;
};

struct tnode *addtree(struct tnode *, char *);
void collect(struct tnode *);
int bycount(const void *, const void *);
int getword(char *, int);

struct tnode *nodes[MAXDISTINCT]; /* every node, to sort by count */
int nnodes = 0;

/* print the distinct words, most frequent first */
int main(void) {
  struct tnode *root = NULL;
  char word[MAXWORD];
  int i;

  while (getword(word, MAXWORD) != EOF)
    root = addtree(root, word);
  collect(root);
  qsort(nodes, nnodes, sizeof nodes[0], bycount);
  for (i = 0; i < nnodes; i++)
    printf("%d %s\n", nodes[i]->count, nodes[i]->word);
  return 0;
}

/* bycount: order nodes by decreasing count, then alphabetically */
int bycount(const void *a, const void *b) {
  struct tnode *p = *(struct tnode **)a;
  struct tnode *q = *(struct tnode **)b;

  if (p->count != q->count)
    return (p->count > q->count) ? -1 : 1;
  return strcmp(p->word, q->word);
}

struct tnode *talloc(void);
char *strdup(char *);

/* addtree: add a node with w, at or below p */
struct tnode *addtree(struct tnode *p, char *w) {
  int cond;

  if (p == NULL) { /* a new word has arrived */
    p = talloc();
    p->word = strdup(w);
    p->count = 1;
    p->left = p->right = NULL;
  } else if ((cond = strcmp(w, p->word)) == 0)
    p->count++; /* repeated word */
  else if (cond < 0)
    p->left = addtree(p->left, w);
  else
    p->right = addtree(p->right, w);
  return p;
}

/* collect: put every node of tree p in nodes[] */
void collect(struct tnode *p) {
  if (p != NULL) {
    collect(p->left);
    if (nnodes < MAXDISTINCT)
      nodes[nnodes++] = p;
    collect(p->right);
  }
}

/* getword: get next word of letters, in lower case; return its first
   character, or EOF */
int getword(char *word, int lim) {
  int c;
  char *w = word;

  while ((c = getchar()) != EOF && !isalpha(c))
    ;
  if (c == EOF)
    return EOF;
  for (; isalpha(c); c = getchar())
    if (w < word + lim - 1)
      *w++ = tolower(c);
  *w = '\0';
  return word[0];
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
