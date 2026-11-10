#include <stdio.h>
#include <string.h>

#define MAXLINES 5000  /* max #lines to be sorted */
#define MAXLEN 1000    /* max length of any input line */
#define MAXSTORE 50001 /* room for all the lines, each ended by '\0' */

char *lineptr[MAXLINES]; /* pointers to text lines */
char linestore[MAXSTORE]; /* the text of the lines */

int readlines(char *lineptr[], int maxlines, char *store, int storesize);
void writelines(char *lineptr[], int nlines);
void qsort(char *lineptr[], int left, int right);

/* sort input lines */
int main() {
  int nlines; /* number of input lines read */

  if ((nlines = readlines(lineptr, MAXLINES, linestore, MAXSTORE)) >= 0) {
    qsort(lineptr, 0, nlines - 1);
    writelines(lineptr, nlines);
    return 0;
  } else {
    printf("error: input too big to sort\n");
    return 1;
  }
}

int getline(char *s, int lim);

/* readlines: read input lines into store, which has room for storesize
   characters, instead of calling alloc */
int readlines(char *lineptr[], int maxlines, char *store, int storesize) {
  int len, nlines;
  char *p, line[MAXLEN + 2]; /* + newline and '\0' */

  p = store;
  nlines = 0;
  while ((len = getline(line, MAXLEN + 2)) > 0)
    if (nlines >= maxlines || p + len + 1 > store + storesize)
      return -1;
    else {
      if (line[len - 1] == '\n')
        line[len - 1] = '\0'; /* delete newline */
      strcpy(p, line);
      lineptr[nlines++] = p;
      p += strlen(p) + 1;
    }
  return nlines;
}

/* writelines: write output lines */
void writelines(char *lineptr[], int nlines) {
  while (nlines-- > 0)
    printf("%s\n", *lineptr++);
}

/* qsort: sort v[left]...v[right] into increasing order */
void qsort(char *v[], int left, int right) {
  int i, last;
  void swap(char *v[], int i, int j);

  if (left >= right) /* do nothing if array contains */
    return;          /* fewer than two elements */
  swap(v, left, (left + right) / 2);
  last = left;
  for (i = left + 1; i <= right; i++)
    if (strcmp(v[i], v[left]) < 0)
      swap(v, ++last, i);
  swap(v, left, last);
  qsort(v, left, last - 1);
  qsort(v, last + 1, right);
}

/* swap: interchange v[i] and v[j] */
void swap(char *v[], int i, int j) {
  char *temp;

  temp = v[i];
  v[i] = v[j];
  v[j] = temp;
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
