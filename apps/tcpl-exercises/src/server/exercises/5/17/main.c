#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

#define MAXLINES 5000    /* max #lines to be sorted */
char *lineptr[MAXLINES]; /* pointers to text lines */

int readlines(char *lineptr[], int nlines);
void writelines(char *lineptr[], int nlines);
void quicksort(void *lineptr[], int left, int right,
               int (*comp)(void *, void *));
int numcmp(char *, char *);

#define MAXLEN 1000 /* max length of any input line */
#define MAXKEYS 10  /* max number of sort keys */

/* Key k sorts on field keyfield[k], with its own options. */
int nkeys = 0;
int keyfield[MAXKEYS];
int numeric[MAXKEYS]; /* 1 if numeric sort */
int reverse[MAXKEYS]; /* 1 if sorting in decreasing order */
int fold[MAXKEYS];    /* 1 if upper and lower case compare equal */
int dir[MAXKEYS];     /* 1 if directory order: letters, digits and blanks */

int compare(void *, void *);
int charcmp(char *, char *, int fold, int dir);
void getfield(char *s, int n, char *f);

/* sort input lines on fields: each argument is a key, + and a field
   number, then any of n, r, f and d, e.g. +1df +2n */
int main(int argc, char *argv[]) {
  int nlines; /* number of input lines read */
  char *p;

  while (--argc > 0 && (*++argv)[0] == '+') {
    if (nkeys >= MAXKEYS) {
      printf("sort: too many keys\n");
      return 1;
    }
    p = *argv + 1;
    for (keyfield[nkeys] = 0; isdigit(*p); p++)
      keyfield[nkeys] = 10 * keyfield[nkeys] + (*p - '0');
    numeric[nkeys] = reverse[nkeys] = fold[nkeys] = dir[nkeys] = 0;
    for (; *p; p++)
      switch (*p) {
      case 'n':
        numeric[nkeys] = 1;
        break;
      case 'r':
        reverse[nkeys] = 1;
        break;
      case 'f':
        fold[nkeys] = 1;
        break;
      case 'd':
        dir[nkeys] = 1;
        break;
      default:
        printf("sort: illegal option %c\n", *p);
        return 1;
      }
    nkeys++;
  }
  if ((nlines = readlines(lineptr, MAXLINES)) >= 0) {
    quicksort((void **)lineptr, 0, nlines - 1, compare);
    writelines(lineptr, nlines);
    return 0;
  } else {
    printf("input too big to sort\n");
    return 1;
  }
}

/* compare: compare lines s and t key by key, or whole if there are no
   keys */
int compare(void *s, void *t) {
  char fs[MAXLEN + 1], ft[MAXLEN + 1];
  int k, r;

  if (nkeys == 0)
    return strcmp(s, t);
  for (k = 0; k < nkeys; k++) {
    getfield(s, keyfield[k], fs);
    getfield(t, keyfield[k], ft);
    r = numeric[k] ? numcmp(fs, ft) : charcmp(fs, ft, fold[k], dir[k]);
    if (r != 0)
      return reverse[k] ? -r : r;
  }
  return 0;
}

/* getfield: copy field n of s, counting from 1, into f; fields are
   separated by blanks and tabs; empty if s has fewer fields */
void getfield(char *s, int n, char *f) {
  for (;;) {
    while (*s == ' ' || *s == '\t')
      s++;
    if (--n <= 0 || *s == '\0')
      break;
    while (*s && *s != ' ' && *s != '\t')
      s++;
  }
  while (*s && *s != ' ' && *s != '\t')
    *f++ = *s++;
  *f = '\0';
}

/* charcmp: compare s and t like strcmp, folding upper and lower case
   together if fold, and looking only at letters, digits and blanks if
   dir */
int charcmp(char *s, char *t, int fold, int dir) {
  int a, b;

  for (;; s++, t++) {
    if (dir) {
      while (*s && !isalnum((unsigned char)*s) && *s != ' ' && *s != '\t')
        s++;
      while (*t && !isalnum((unsigned char)*t) && *t != ' ' && *t != '\t')
        t++;
    }
    a = (unsigned char)*s;
    b = (unsigned char)*t;
    if (fold) {
      a = tolower(a);
      b = tolower(b);
    }
    if (a != b)
      return a - b;
    if (a == '\0')
      return 0;
  }
}

/* quicksort: sort v[left]...v[right] into increasing order */
void quicksort(void *v[], int left, int right, int (*comp)(void *, void *)) {
  int i, last;
  void swap(void *v[], int, int);

  if (left >= right) /* do nothing if array contains */
    return;          /* fewer than two elements */
  swap(v, left, (left + right) / 2);
  last = left;
  for (i = left + 1; i <= right; i++)
    if ((*comp)(v[i], v[left]) < 0)
      swap(v, ++last, i);
  swap(v, left, last);
  quicksort(v, left, last - 1, comp);
  quicksort(v, last + 1, right, comp);
}

/* swap: interchange v[i] and v[j] */
void swap(void *v[], int i, int j) {
  void *temp;

  temp = v[i];
  v[i] = v[j];
  v[j] = temp;
}

/* numcmp: compare s1 and s2 numerically */
int numcmp(char *s1, char *s2) {
  double v1, v2;

  v1 = atof(s1);
  v2 = atof(s2);
  if (v1 < v2)
    return -1;
  else if (v1 > v2)
    return 1;
  else
    return 0;
}

int getline(char *, int);
char *alloc(int);

/* readlines: read input lines */
int readlines(char *lineptr[], int maxlines) {
  int len, nlines;
  char *p, line[MAXLEN + 2]; /* + newline and '\0' */

  nlines = 0;
  while ((len = getline(line, MAXLEN + 2)) > 0)
    if (nlines >= maxlines || (p = alloc(len + 1)) == NULL)
      return -1;
    else {
      if (line[len - 1] == '\n')
        line[len - 1] = '\0'; /* delete newline */
      strcpy(p, line);
      lineptr[nlines++] = p;
    }
  return nlines;
}

/* writelines: write output lines */
void writelines(char *lineptr[], int nlines) {
  while (nlines-- > 0)
    printf("%s\n", *lineptr++);
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

#define ALLOCSIZE 10001 /* size of available space */

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
