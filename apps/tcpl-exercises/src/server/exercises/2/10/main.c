#include <stdio.h>

int lower(int c);

/* copy input to output, converting upper case letters to lower case */
int main() {
  int c;

  while ((c = getchar()) != EOF)
    putchar(lower(c));

  return 0;
}

/* lower: convert c to lower case; ASCII only */
int lower(int c) {
  return (c >= 'A' && c <= 'Z') ? c + 'a' - 'A' : c;
}
