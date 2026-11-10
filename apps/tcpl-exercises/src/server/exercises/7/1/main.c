#include <stdio.h>
#include <ctype.h>
#include <string.h>

/* lower or upper: convert the input's case, as the program's name says */
int main(int argc, char *argv[]) {
  int c;
  char *name;

  if ((name = strrchr(argv[0], '/')) != NULL)
    name++; /* the name after any directory */
  else
    name = argv[0];

  while ((c = getchar()) != EOF)
    if (strcmp(name, "lower") == 0)
      putchar(tolower(c));
    else if (strcmp(name, "upper") == 0)
      putchar(toupper(c));
    else
      putchar(c);
  return 0;
}
