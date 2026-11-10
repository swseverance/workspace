#include <stdio.h>
#include <stdlib.h> /* for atof() */
#include <ctype.h>

#define MAXVAL 100 /* maximum depth of val stack */

int isnumber(char *s);
int push(double f);
int pop(double *f);

/* expr: evaluate a reverse Polish expression from the command line */
int main(int argc, char *argv[]) {
  double op1, op2;
  int ok = 1;

  while (ok && --argc > 0) {
    char *arg = *++argv;

    if (isnumber(arg))
      ok = push(atof(arg));
    else if (arg[0] != '\0' && arg[1] == '\0' && pop(&op2) && pop(&op1))
      switch (arg[0]) {
      case '+':
        ok = push(op1 + op2);
        break;
      case '-':
        ok = push(op1 - op2);
        break;
      case '*':
        ok = push(op1 * op2);
        break;
      case '/':
        ok = op2 != 0.0 && push(op1 / op2);
        break;
      default:
        ok = 0; /* unknown operator */
        break;
      }
    else
      ok = 0; /* not a number, or too few operands */
  }
  if (ok && pop(&op1) && !pop(&op2))
    printf("%.8g\n", op1);
  else
    printf("error\n");
  return 0;
}

/* isnumber: is s an optional -, then digits with at most one point, with
   at least one digit? */
int isnumber(char *s) {
  int digits = 0;

  if (*s == '-')
    s++;
  while (isdigit(*s)) {
    s++;
    digits++;
  }
  if (*s == '.')
    s++;
  while (isdigit(*s)) {
    s++;
    digits++;
  }
  return *s == '\0' && digits > 0;
}

static int sp = 0;         /* next free stack position */
static double val[MAXVAL]; /* value stack */

/* push: push f onto value stack; 0 if it's full */
int push(double f) {
  if (sp >= MAXVAL)
    return 0;
  val[sp++] = f;
  return 1;
}

/* pop: pop the top value into *f; 0 if the stack is empty */
int pop(double *f) {
  if (sp <= 0)
    return 0;
  *f = val[--sp];
  return 1;
}
