#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
void chop(char s[], int len);
void squeeze(char s1[], char s2[]);

/* for each pair of lines s1 and s2, print s1 without the characters of s2 */
int main() {
  int len;
  char s1[MAXLINE], s2[MAXLINE];

  while ((len = getline(s1, MAXLINE)) > 0) {
    chop(s1, len);
    len = getline(s2, MAXLINE);
    chop(s2, len);
    squeeze(s1, s2);
    printf("%s\n", s1);
  }

  return 0;
}

/* squeeze: delete each character in s1 that is in s2 */
void squeeze(char s1[], char s2[]) {
  int i, j, k;

  for (i = j = 0; s1[i] != '\0'; i++) {
    for (k = 0; s2[k] != '\0' && s2[k] != s1[i]; k++)
      ;
    if (s2[k] == '\0') /* s1[i] isn't in s2 */
      s1[j++] = s1[i];
  }
  s1[j] = '\0';
}

/* chop: remove the newline from the end of s, which has length len */
void chop(char s[], int len) {
  if (len > 0 && s[len - 1] == '\n')
    s[len - 1] = '\0';
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
