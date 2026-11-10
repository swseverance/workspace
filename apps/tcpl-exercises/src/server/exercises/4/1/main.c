#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int max);
void chop(char s[], int len);
int strindex(char s[], char t[]);

/* for each pair of lines s and t, print the rightmost position of t in s */
int main() {
  int len;
  char s[MAXLINE + 2], t[MAXLINE + 2]; /* + newline and '\0' */

  while ((len = getline(s, MAXLINE + 2)) > 0) {
    chop(s, len);
    len = getline(t, MAXLINE + 2);
    chop(t, len);
    printf("%d\n", strindex(s, t));
  }

  return 0;
}

/* strindex: return index of the rightmost t in s, -1 if none */
int strindex(char s[], char t[]) {
  int i, j, k, pos;

  pos = -1;
  for (i = 0; s[i] != '\0'; i++) {
    for (j = i, k = 0; t[k] != '\0' && s[j] == t[k]; j++, k++)
      ;
    if (k > 0 && t[k] == '\0')
      pos = i;
  }
  return pos;
}

/* chop: remove the newline from the end of s, which has length len */
void chop(char s[], int len) {
  if (len > 0 && s[len - 1] == '\n')
    s[len - 1] = '\0';
}

/* getline: get line into s, return length */
int getline(char s[], int lim) {
  int c, i;

  i = 0;
  while (--lim > 0 && (c = getchar()) != EOF && c != '\n')
    s[i++] = c;
  if (c == '\n')
    s[i++] = c;
  s[i] = '\0';
  return i;
}
