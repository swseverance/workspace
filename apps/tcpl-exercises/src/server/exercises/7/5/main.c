#include <stdio.h>
#include <string.h>

#define MAXLINE 1000 /* maximum input line size */
#define MAXOP 100    /* max size of operand or operator */

void push(double);
double pop(void);
void operate(char *token);

/* reverse Polish calculator, reading each line with fgets and its
   operands and operators with sscanf */
int main(void) {
  char line[MAXLINE + 2], token[MAXOP];
  char *p;
  double num;
  int n, used;

  while (fgets(line, sizeof line, stdin) != NULL) {
    for (p = line; sscanf(p, "%99s%n", token, &n) == 1; p += n)
      if (sscanf(token, "%lf%n", &num, &used) == 1 && token[used] == '\0')
        push(num);
      else
        operate(token);
    if (line[strlen(line) - 1] == '\n')
      printf("\t%.8g\n", pop());
  }
  return 0;
}

/* operate: apply an operator token */
void operate(char *token) {
  double op2;

  if (strlen(token) != 1) {
    printf("error: unknown command %s\n", token);
    return;
  }
  switch (token[0]) {
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
  default:
    printf("error: unknown command %s\n", token);
    break;
  }
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
