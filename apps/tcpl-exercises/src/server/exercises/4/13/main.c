#include <stdio.h>
#include <string.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int max);
void reverse(char s[]);
void reverser(char s[], int i, int j);

/* print each input line reversed */
int main() {
  int len;
  char line[MAXLINE + 2]; /* + newline and '\0' */

  while ((len = getline(line, MAXLINE + 2)) > 0) {
    if (line[len - 1] == '\n')
      line[len - 1] = '\0';
    reverse(line);
    printf("%s\n", line);
  }

  return 0;
}

/* reverse: reverse string s in place; recursive */
void reverse(char s[]) {
  reverser(s, 0, strlen(s) - 1);
}

/* reverser: reverse s[i]...s[j] by swapping the ends, then reversing
   what's between them */
void reverser(char s[], int i, int j) {
  int c;

  if (i < j) {
    c = s[i];
    s[i] = s[j];
    s[j] = c;
    reverser(s, i + 1, j - 1);
  }
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
