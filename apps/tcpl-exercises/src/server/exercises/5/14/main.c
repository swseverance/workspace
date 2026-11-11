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

int numeric = 0; /* 1 if numeric sort */
int reverse = 0; /* 1 if sorting in decreasing order */

int compare(void *, void *);

/* sort input lines; -n sorts numerically, -r in decreasing order */
int main(int argc, char *argv[]) {
  int nlines; /* number of input lines read */
  int c;

  while (--argc > 0 && (*++argv)[0] == '-')
    while ((c = *++argv[0]))
      switch (c) {
      case 'n':
        numeric = 1;
        break;
      case 'r':
        reverse = 1;
        break;
      default:
        printf("sort: illegal option %c\n", c);
        return 1;
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

/* compare: compare s and t as the options say */
int compare(void *s, void *t) {
  int r;

  r = numeric ? numcmp(s, t) : strcmp(s, t);
  return reverse ? -r : r;
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

#define MAXLEN 1000 /* max length of any input line */
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
