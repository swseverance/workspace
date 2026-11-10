#include <stdio.h>
#include <string.h>

#define MAXLINE 1000 /* maximum input line size */

void find(FILE *fp, char *name, char *pattern, int except, int number);

/* find: print lines that match the pattern, from the named files or the
   standard input; -x prints the lines that don't, -n numbers them */
int main(int argc, char *argv[]) {
  char *pattern;
  int c, except = 0, number = 0;
  FILE *fp;

  while (--argc > 0 && (*++argv)[0] == '-')
    while ((c = *++argv[0]))
      switch (c) {
      case 'x':
        except = 1;
        break;
      case 'n':
        number = 1;
        break;
      default:
        printf("find: illegal option %c\n", c);
        return 1;
      }
  if (argc < 1) {
    printf("Usage: find -x -n pattern [file ...]\n");
    return 1;
  }
  pattern = *argv;
  if (argc == 1) /* no files: the standard input */
    find(stdin, NULL, pattern, except, number);
  else
    while (--argc > 0)
      if ((fp = fopen(*++argv, "r")) == NULL)
        fprintf(stderr, "find: can't open %s\n", *argv);
      else {
        find(fp, *argv, pattern, except, number);
        fclose(fp);
      }
  return 0;
}

/* find: print the lines of fp that match pattern (or don't, if except),
   after name, if there is one, and the line number, if number */
void find(FILE *fp, char *name, char *pattern, int except, int number) {
  char line[MAXLINE + 2]; /* + newline and '\0' */
  long lineno = 0;
  int len;

  while (fgets(line, sizeof line, fp) != NULL) {
    lineno++;
    len = strlen(line);
    if (line[len - 1] == '\n')
      line[len - 1] = '\0';
    if ((strstr(line, pattern) != NULL) != except) {
      if (name != NULL)
        printf("%s:", name);
      if (number)
        printf("%ld:", lineno);
      printf("%s\n", line);
    }
  }
}
