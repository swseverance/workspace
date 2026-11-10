#include <stdio.h>

/* copy input to output, making tabs, backspaces and backslashes visible */
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
