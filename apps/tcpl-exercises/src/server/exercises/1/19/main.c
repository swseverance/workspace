#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
void reverse(char s[]);

/* reverse input a line at a time */
int main() {
  int len;
  char line[MAXLINE];

  while ((len = getline(line, MAXLINE)) > 0) {
    if (line[len - 1] == '\n') {
      line[len - 1] = '\0';
      reverse(line);
      printf("%s\n", line);
    } else {
      reverse(line);
      printf("%s", line);
    }
  }

  return 0;
}

/* reverse: reverse the string s in place */
void reverse(char s[]) {
  int i, j;
  char temp;

  j = 0;
  while (s[j] != '\0')
    ++j;
  --j;
  i = 0;
  while (i < j) {
    temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    ++i;
    --j;
  }
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
