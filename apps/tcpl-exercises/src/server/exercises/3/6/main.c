#include <stdio.h>
#include <string.h>
#define MAXLEN 200 /* room for the widest field */

void itoa(int n, char s[], int w);
void reverse(char s[]);

/* print each input number n padded to width w */
int main() {
  int n, w;
  char s[MAXLEN];

  while (scanf("%d %d", &n, &w) == 2) {
    itoa(n, s, w);
    printf("%s\n", s);
  }

  return 0;
}

/* itoa: convert n to characters in s, padded with blanks on the left
   to at least w characters */
void itoa(int n, char s[], int w) {
  int i, sign, d;

  sign = n;
  i = 0;
  do { /* generate digits in reverse order */
    d = n % 10;
    s[i++] = (d < 0 ? -d : d) + '0';
  } while ((n /= 10) != 0);
  if (sign < 0)
    s[i++] = '-';
  while (i < w)
    s[i++] = ' ';
  s[i] = '\0';
  reverse(s);
}

/* reverse: reverse string s in place */
void reverse(char s[]) {
  int c, i, j;

  for (i = 0, j = strlen(s) - 1; i < j; i++, j--) {
    c = s[i];
    s[i] = s[j];
    s[j] = c;
  }
}
