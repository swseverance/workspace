#include <stdio.h>
#include <string.h>
#define MAXLEN 100 /* room for any number itob makes */

void itob(int n, char s[], int b);
void reverse(char s[]);

/* print each input number n in base b */
int main() {
  int n, b;
  char s[MAXLEN];

  while (scanf("%d %d", &n, &b) == 2) {
    itob(n, s, b);
    printf("%s\n", s);
  }

  return 0;
}

/* itob: convert n to characters in s, in base b (2 to 36)

   Like itoa in exercise 3-4, n is never negated, so the largest
   negative number works too. */
void itob(int n, char s[], int b) {
  int i, sign, d;

  sign = n;
  i = 0;
  do { /* generate digits in reverse order */
    d = n % b;
    if (d < 0)
      d = -d;
    s[i++] = (d < 10) ? d + '0' : d - 10 + 'a';
  } while ((n /= b) != 0);
  if (sign < 0)
    s[i++] = '-';
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
