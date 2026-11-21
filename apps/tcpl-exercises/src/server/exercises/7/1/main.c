#include <stdio.h>
#include <ctype.h>
#include <string.h>

/* lower or upper: convert the input's case, as the program's name says */
int main(int argc, char *argv[]) {
  int c;
  char *name;
  int (*convert)(int) = NULL; /* how to change each character, if at all */

  if ((name = strrchr(argv[0], '/')) != NULL)
    name++; /* the name after any directory */
  else
    name = argv[0];

  if (strcmp(name, "lower") == 0)
    convert = tolower;
  else if (strcmp(name, "upper") == 0)
    convert = toupper;

  while ((c = getchar()) != EOF)
    putchar(convert != NULL ? convert(c) : c);
  return 0;
}
