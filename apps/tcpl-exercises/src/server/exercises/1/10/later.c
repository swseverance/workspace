/* The same program, written with else, which the book introduces after this
   exercise, in section 1.5.4. Each if (c != ...) block above becomes an else,
   so nothing is tested twice and the nesting goes away. */
#include <stdio.h>

int main() {
  int c;

  while ((c = getchar()) != EOF) {
    if (c == '\t')
      printf("\\t");
    else if (c == '\b')
      printf("\\b");
    else if (c == '\\')
      printf("\\\\");
    else
      putchar(c);
  }

  return 0;
}
