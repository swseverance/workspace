#include <stdio.h>
#include <stdlib.h> /* for atoi() */
#include <string.h>

#define DEFLINES 10     /* lines printed by default */
#define MAXLINES 5000   /* max #lines kept */
#define MAXLEN 1000     /* max length of any input line */
#define ALLOCSIZE 55000 /* room for all the lines, each ended by '\0' */

char *lineptr[MAXLINES]; /* pointers to text lines */

int getline(char *s, int lim);
char *alloc(int n);

/* tail: print the last n lines of the input (tail -n), 10 by default */
int main(int argc, char *argv[]) {
  int n, len, nlines, first;
  char *p, line[MAXLEN + 2]; /* + newline and '\0' */

  n = DEFLINES;
  if (argc > 1 && (*++argv)[0] == '-')
    n = atoi(*argv + 1);
  if (n < 0)
    n = 0;

  nlines = 0;
  while ((len = getline(line, MAXLEN + 2)) > 0) {
    if (nlines >= MAXLINES || (p = alloc(len + 1)) == NULL) {
      printf("tail: input too big\n");
      return 1;
    }
    strcpy(p, line); /* keep the newline, if there is one */
    lineptr[nlines++] = p;
  }

  first = (n < nlines) ? nlines - n : 0;
  while (first < nlines)
    printf("%s", lineptr[first++]);
  return 0;
}

/* getline: read a line into s, return length */
int getline(char *s, int lim) {
  int c;
  char *start = s;

  while (--lim > 0 && (c = getchar()) != EOF && c != '\n')
    *s++ = c;
  if (c == '\n')
    *s++ = c;
  *s = '\0';
  return s - start;
}

static char allocbuf[ALLOCSIZE]; /* storage for alloc */
static char *allocp = allocbuf;  /* next free position */

/* alloc: return pointer to n characters */
char *alloc(int n) {
  if (allocbuf + ALLOCSIZE - allocp >= n) { /* it fits */
    allocp += n;
    return allocp - n; /* old p */
  } else               /* not enough room */
    return 0;
}
