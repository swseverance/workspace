#include <stdio.h>

/* copy input to output, making tabs, backspaces and backslashes visible */
int main() {
  int c;

  while ((c = getchar()) != EOF) {
    if (c == '\t')
      printf("\\t");
    if (c != '\t') {
      if (c == '\b')
        printf("\\b");
      if (c != '\b') {
        if (c == '\\')
          printf("\\\\");
        if (c != '\\')
          putchar(c);
      }
    }
  }

  return 0;
}
