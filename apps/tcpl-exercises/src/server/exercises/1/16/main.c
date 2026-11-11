#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
void copy(char to[], char from[]);

/* print the length of the longest input line, however long,
   and as much of its text as fits */
int main() {
  int len;               /* length of this piece of the line */
  int total;             /* length of the current line so far */
  int max;               /* length of the longest line so far */
  int firstlen;          /* length of the current line's first piece */
  int longestlen;        /* length of the text in longest */
  char line[MAXLINE];    /* current piece of a line */
  char first[MAXLINE];   /* first piece of the current line */
  char longest[MAXLINE]; /* first piece of the longest line */

  max = total = firstlen = longestlen = 0;
  while ((len = getline(line, MAXLINE)) > 0) {
    if (total == 0) {
      copy(first, line);
      firstlen = len;
    }
    total = total + len;
    if (line[len - 1] == '\n') {
      if (total > max) {
        max = total;
        copy(longest, first);
        longestlen = firstlen;
      }
      total = 0;
    }
  }
  if (total > max) { /* a last line with no newline */
    max = total;
    copy(longest, first);
    longestlen = firstlen;
  }

  if (max > 0) {
    printf("%d\n", max);
    printf("%s", longest);
    if (longest[longestlen - 1] != '\n')
      putchar('\n');
  }

  return 0;
}

/* getline: read a line into s, return length */
int getline(char s[], int lim) {
  int c, i;

  for (i = 0; i < lim - 1 && (c = getchar()) != EOF && c != '\n'; ++i)
    s[i] = c;
  if (c == '\n') {
    s[i] = c;
    ++i;
  }
  s[i] = '\0';
  return i;
}

/* copy: copy 'from' into 'to'; assume to is big enough */
void copy(char to[], char from[]) {
  int i;

  i = 0;
  while ((to[i] = from[i]) != '\0')
    ++i;
}
