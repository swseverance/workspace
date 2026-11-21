#include <stdio.h>
#include <stdlib.h> /* for atof() */
#include <ctype.h>

#define MAXOP 100  /* max size of operand or operator */
#define NUMBER '0' /* signal that a number was found */

int getop(char[]);
void push(double);
double pop(void);
void printtop(void);
void duplicate(void);
void swap(void);
void clear(void);
int getch(void);
void ungetch(int);

/* reverse Polish calculator, with commands to print the top element
   (?), duplicate it (d), swap the top two (s) and clear the stack (c) */
int main() {
  int type;
  double op2;
  char s[MAXOP];

  while ((type = getop(s)) != EOF) {
    switch (type) {
    case NUMBER:
      push(atof(s));
      break;
    case '+':
      push(pop() + pop());
      break;
    case '*':
      push(pop() * pop());
      break;
    case '-':
      op2 = pop();
      push(pop() - op2);
      break;
    case '/':
      op2 = pop();
      if (op2 != 0.0)
        push(pop() / op2);
      else
        printf("error: zero divisor\n");
      break;
    case '?':
      printtop();
      break;
    case 'd':
      duplicate();
      break;
    case 's':
      swap();
      break;
    case 'c':
      clear();
      break;
    case '\n':
      printf("\t%.8g\n", pop());
      break;
    default:
      printf("error: unknown command %s\n", s);
      break;
    }
  }
  return 0;
}

#define MAXVAL 100 /* maximum depth of val stack */

int sp = 0;         /* next free stack position */
double val[MAXVAL]; /* value stack */

/* push: push f onto value stack */
void push(double f) {
  if (sp < MAXVAL)
    val[sp++] = f;
  else
    printf("error: stack full, can't push %g\n", f);
}

/* pop: pop and return top value from stack */
double pop(void) {
  if (sp > 0)
    return val[--sp];
  else {
    printf("error: stack empty\n");
    return 0.0;
  }
}

/* printtop: print the top element without popping it */
void printtop(void) {
  if (sp > 0)
    printf("\t%.8g\n", val[sp - 1]);
  else
    printf("error: stack empty\n");
}

/* duplicate: push a copy of the top element */
void duplicate(void) {
  if (sp > 0)
    push(val[sp - 1]);
  else
    printf("error: stack empty\n");
}

/* swap: swap the top two elements */
void swap(void) {
  double temp;

  if (sp > 1) {
    temp = val[sp - 1];
    val[sp - 1] = val[sp - 2];
    val[sp - 2] = temp;
  } else
    printf("error: can't swap, fewer than two elements\n");
}

/* clear: empty the stack */
void clear(void) {
  sp = 0;
}

/* getop: get next character or numeric operand */
int getop(char s[]) {
  int i, c;

  while ((s[0] = c = getch()) == ' ' || c == '\t')
    ;
  s[1] = '\0';
  if (!isdigit(c) && c != '.')
    return c; /* not a number */
  i = 0;
  if (isdigit(c)) /* collect integer part */
    while (i < MAXOP - 1 && isdigit(s[++i] = c = getch()))
      ;
  if (c == '.') /* collect fraction part */
    while (i < MAXOP - 1 && isdigit(s[++i] = c = getch()))
      ;
  s[i] = '\0';
  if (c != EOF)
    ungetch(c);
  return NUMBER;
}

#define BUFSIZE 100

int buf[BUFSIZE]; /* buffer for ungetch */
int bufp = 0;     /* next free position in buf */

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
