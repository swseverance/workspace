#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */
#define MAXOUT 10000 /* each 3 characters expand to at most 26 */

int getline(char line[], int maxline);
void expand(char s1[], char s2[]);
int samerange(int a, int b);

/* expand shorthand like a-z on each input line */
int main() {
  int len;
  char line[MAXLINE + 2], out[MAXOUT]; /* + newline and '\0' */

  while ((len = getline(line, MAXLINE + 2)) > 0) {
    if (line[len - 1] == '\n')
      line[len - 1] = '\0';
    expand(line, out);
    printf("%s\n", out);
  }

  return 0;
}

/* expand: copy s1 to s2, expanding shorthand like a-z into abc...xyz */
void expand(char s1[], char s2[]) {
  int i, j, c;

  i = j = 0;
  while ((c = s1[i++]) != '\0')
    if (s1[i] == '-' && samerange(c, s1[i + 1]) && c <= s1[i + 1]) {
      i++; /* skip the -; its end letter starts the next pass */
      while (c < s1[i])
        s2[j++] = c++;
    } else
      s2[j++] = c;
  s2[j] = '\0';
}

/* samerange: are a and b both lower case, both upper case or both digits? */
int samerange(int a, int b) {
  return (a >= 'a' && a <= 'z' && b >= 'a' && b <= 'z') ||
         (a >= 'A' && a <= 'Z' && b >= 'A' && b <= 'Z') ||
         (a >= '0' && a <= '9' && b >= '0' && b <= '9');
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
