#include <stdio.h>
#define MAXLINE 500 /* maximum input line size */

int getline(char line[], int maxline);
void escape(char s[], char t[]);

/* print each input line with its newline, tabs and backslashes made
   visible */
int main() {
  /* t: the line, its newline and '\0'; s: up to twice as many characters */
  char t[MAXLINE + 2], s[2 * (MAXLINE + 1) + 1];

  while (getline(t, MAXLINE + 2) > 0) {
    escape(s, t);
    printf("%s\n", s);
  }

  return 0;
}

/* escape: copy t to s, making newlines, tabs and backslashes visible */
void escape(char s[], char t[]) {
  int i, j;

  for (i = j = 0; t[i] != '\0'; ++i)
    switch (t[i]) {
    case '\n':
      s[j++] = '\\';
      s[j++] = 'n';
      break;
    case '\t':
      s[j++] = '\\';
      s[j++] = 't';
      break;
    case '\\':
      s[j++] = '\\';
      s[j++] = '\\';
      break;
    default:
      s[j++] = t[i];
      break;
    }
  s[j] = '\0';
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
