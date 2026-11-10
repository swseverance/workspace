#include <stdio.h>
#include <string.h>

#define MAXLINE 1000 /* maximum input line size */
#define PAGELEN 10   /* lines of a file on each page */

void printfile(FILE *fp, char *name);
void title(char *name, int page);

/* print the named files, each starting on a new page, with titles and
   page numbers */
int main(int argc, char *argv[]) {
  FILE *fp;

  while (--argc > 0)
    if ((fp = fopen(*++argv, "r")) == NULL)
      fprintf(stderr, "can't open %s\n", *argv);
    else {
      printfile(fp, *argv);
      fclose(fp);
    }
  return 0;
}

/* printfile: print fp, PAGELEN lines to a page */
void printfile(FILE *fp, char *name) {
  char line[MAXLINE + 2]; /* + newline and '\0' */
  int page, lines, len;

  page = 0;
  lines = PAGELEN; /* so the first line starts a page */
  while (fgets(line, sizeof line, fp) != NULL) {
    if (lines == PAGELEN) {
      title(name, ++page);
      lines = 0;
    }
    len = strlen(line);
    if (line[len - 1] == '\n')
      line[len - 1] = '\0';
    printf("%s\n", line);
    lines++;
  }
  if (page == 0) /* an empty file */
    title(name, 1);
}

/* title: start a page: a form feed before all but the first page, then
   the file name and page number, and a blank line */
void title(char *name, int page) {
  static int first = 1;

  if (!first)
    putchar('\f');
  first = 0;
  printf("%s  page %d\n\n", name, page);
}
