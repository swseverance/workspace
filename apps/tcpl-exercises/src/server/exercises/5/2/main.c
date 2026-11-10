#include <stdio.h>
#include <ctype.h>

int getch(void);
void ungetch(int);
int getfloat(double *pn);

/* print each number in the input, skipping anything else */
int main() {
  int type;
  double x;

  while ((type = getfloat(&x)) != EOF)
    if (type > 0)
      printf("%g\n", x);
    else
      getch(); /* not a number: skip a character */

  return 0;
}

/* getfloat: get next floating-point number from input into *pn

   It still returns an int: EOF, 0 if the input isn't a number, or a
   positive value if it is. The number itself goes through the pointer,
   so the return value only has to say what was found. */
int getfloat(double *pn) {
  int c, d, sign;
  double power;

  while (isspace(c = getch())) /* skip white space */
    ;
  if (c == EOF)
    return EOF;
  if (!isdigit(c) && c != '+' && c != '-' && c != '.') {
    ungetch(c); /* it is not a number */
    return 0;
  }
  sign = (c == '-') ? -1 : 1;
  if (c == '+' || c == '-') {
    d = c;
    if (!isdigit(c = getch()) && c != '.') {
      if (c != EOF)
        ungetch(c);
      ungetch(d); /* a sign on its own: push it back */
      return 0;
    }
  }
  if (c == '.') { /* a point needs a digit after it */
    d = getch();
    if (d != EOF)
      ungetch(d);
    if (!isdigit(d)) {
      ungetch(c);
      return 0;
    }
  }
  for (*pn = 0.0; isdigit(c); c = getch())
    *pn = 10.0 * *pn + (c - '0');
  if (c == '.')
    c = getch();
  for (power = 1.0; isdigit(c); c = getch()) {
    *pn = 10.0 * *pn + (c - '0');
    power *= 10.0;
  }
  *pn *= sign / power;
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
