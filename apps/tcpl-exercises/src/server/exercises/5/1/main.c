#include <stdio.h>
#include <ctype.h>

int getch(void);
void ungetch(int);
int getint(int *pn);

/* print each integer in the input, skipping anything else */
int main() {
  int n, type;

  while ((type = getint(&n)) != EOF)
    if (type > 0)
      printf("%d\n", n);
    else
      getch(); /* not a number: skip a character */

  return 0;
}

/* getint: get next integer from input into *pn; return EOF, 0 if the
   input isn't a number, or a positive value if it is

   A + or - not followed by a digit is pushed back with the character
   after it. And a number right at the end of the input returns 1 rather
   than c, which would be EOF and lose it. */
int getint(int *pn) {
  int c, d, sign;

  while (isspace(c = getch())) /* skip white space */
    ;
  if (c == EOF)
    return EOF;
  if (!isdigit(c) && c != '+' && c != '-') {
    ungetch(c); /* it is not a number */
    return 0;
  }
  sign = (c == '-') ? -1 : 1;
  if (c == '+' || c == '-') {
    d = c;
    if (!isdigit(c = getch())) {
      if (c != EOF)
        ungetch(c);
      ungetch(d); /* a sign on its own: push it back */
      return 0;
    }
  }
  for (*pn = 0; isdigit(c); c = getch())
    *pn = 10 * *pn + (c - '0');
  *pn *= sign;
  if (c == EOF)
    return 1;
  ungetch(c);
  return c;
}

#define BUFSIZE 100

char buf[BUFSIZE]; /* buffer for ungetch */
int bufp = 0;      /* next free position in buf */

/* getch: get a (possibly pushed-back) character */
int getch(void) {
  return (bufp > 0) ? buf[--bufp] : getchar();
}

/* ungetch: push character back on input */
void ungetch(int c) {
  if (bufp >= BUFSIZE)
    printf("ungetch: too many characters\n");
  else
    buf[bufp++] = c;
}
