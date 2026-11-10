#include <stdio.h>
#include <string.h>

#define MAXLINE 1000 /* maximum input line size */

void chop(char *s);

/* compare two files, printing the first line where they differ */
int main(int argc, char *argv[]) {
  FILE *fp1, *fp2;
  char line1[MAXLINE + 2], line2[MAXLINE + 2]; /* + newline and '\0' */
  char *r1, *r2;
  int n;

  if (argc != 3) {
    fprintf(stderr, "usage: %s file1 file2\n", argv[0]);
    return 1;
  }
  if ((fp1 = fopen(argv[1], "r")) == NULL) {
    fprintf(stderr, "%s: can't open %s\n", argv[0], argv[1]);
    return 1;
  }
  if ((fp2 = fopen(argv[2], "r")) == NULL) {
    fprintf(stderr, "%s: can't open %s\n", argv[0], argv[2]);
    return 1;
  }

  for (n = 1;; n++) {
    r1 = fgets(line1, sizeof line1, fp1);
    r2 = fgets(line2, sizeof line2, fp2);
    if (r1 == NULL && r2 == NULL) /* the same to the end */
      break;
    if (r1 != NULL)
      chop(line1);
    if (r2 != NULL)
      chop(line2);
    if (r1 == NULL || r2 == NULL || strcmp(line1, line2) != 0) {
      printf("%s:%d: %s\n", argv[1], n, r1 != NULL ? line1 : "EOF");
      printf("%s:%d: %s\n", argv[2], n, r2 != NULL ? line2 : "EOF");
      break;
    }
  }
  fclose(fp1);
  fclose(fp2);
  return 0;
}

/* chop: remove the newline from the end of s */
void chop(char *s) {
  int len = strlen(s);

  if (len > 0 && s[len - 1] == '\n')
    s[len - 1] = '\0';
}
