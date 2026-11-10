#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

#define MAXWORD 100

struct lnode { /* a line number in a list */
  int line;
  struct lnode *next;
};

struct tnode {         /* the tree node: */
  char *word;          /* points to the text */
  struct lnode *first; /* the lines it's on, in order */
  struct lnode *last;
  struct tnode *left;
  struct tnode *right;
};

char *noise[] = {"a", "an", "and", "in", "is", "it", "of", "or", "the", "to"};
#define NNOISE (sizeof noise / sizeof noise[0])

struct tnode *addtree(struct tnode *, char *, int);
void treeprint(struct tnode *);
int getword(char *, int);
int isnoise(char *);

int lineno = 1; /* line getword is on */

/* cross-referencer: print each word and the lines it's on */
int main(void) {
  struct tnode *root = NULL;
  char word[MAXWORD];

  while (getword(word, MAXWORD) != EOF)
    if (!isnoise(word))
      root = addtree(root, word, lineno);
  treeprint(root);
  return 0;
}

struct tnode *talloc(void);
struct lnode *lalloc(int);
char *strdup(char *);

/* addtree: note that w is on line, at or below p */
struct tnode *addtree(struct tnode *p, char *w, int line) {
  int cond;

  if (p == NULL) { /* a new word has arrived */
    p = talloc();
    p->word = strdup(w);
    p->first = p->last = lalloc(line);
    p->left = p->right = NULL;
  } else if ((cond = strcmp(w, p->word)) == 0) {
    if (p->last->line != line) /* not on this line yet */
      p->last = p->last->next = lalloc(line);
  } else if (cond < 0)
    p->left = addtree(p->left, w, line);
  else
    p->right = addtree(p->right, w, line);
  return p;
}

/* treeprint: in-order print of tree p */
void treeprint(struct tnode *p) {
  struct lnode *q;

  if (p != NULL) {
    treeprint(p->left);
    printf("%s", p->word);
    for (q = p->first; q != NULL; q = q->next)
      printf(" %d", q->line);
    printf("\n");
    treeprint(p->right);
  }
}

/* getword: get next word of letters, in lower case, counting lines;
   return its first character, or EOF */
int getword(char *word, int lim) {
  int c;
  char *w = word;
  static int newline = 0; /* 1 if the last word ended its line */

  if (newline) {
    lineno++;
    newline = 0;
  }
  while ((c = getchar()) != EOF && !isalpha(c))
    if (c == '\n')
      lineno++;
  if (c == EOF)
    return EOF;
  for (; isalpha(c); c = getchar())
    if (w < word + lim - 1)
      *w++ = tolower(c);
  *w = '\0';
  if (c == '\n')
    newline = 1; /* counted when the next word is read */
  return word[0];
}

/* isnoise: is w a noise word? */
int isnoise(char *w) {
  int i;

  for (i = 0; i < NNOISE; i++)
    if (strcmp(w, noise[i]) == 0)
      return 1;
  return 0;
}

/* talloc: make a tnode */
struct tnode *talloc(void) {
  return (struct tnode *)malloc(sizeof(struct tnode));
}

/* lalloc: make an lnode for line */
struct lnode *lalloc(int line) {
  struct lnode *p;

  p = (struct lnode *)malloc(sizeof(struct lnode));
  p->line = line;
  p->next = NULL;
  return p;
}

/* strdup: make a duplicate of s */
char *strdup(char *s) {
  char *p;

  p = (char *)malloc(strlen(s) + 1); /* +1 for '\0' */
  if (p != NULL)
    strcpy(p, s);
  return p;
}
