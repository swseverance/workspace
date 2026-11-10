#include <stdio.h>
#include <string.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int max);
int getch(void);
void ungetch(int);
void ungets(char s[]);

/* print each input line twice, reading it again after ungets */
int main() {
  char line[MAXLINE + 2]; /* + newline and '\0' */

  while (getline(line, MAXLINE + 2) > 0) {
    printf("%s", line);
    ungets(line);
    getline(line, MAXLINE + 2);
    printf("%s", line);
  }

  return 0;
}

/* ungets: push back s onto the input, so getch returns s[0] first

   ungets doesn't need to know about buf and bufp: pushing the
   characters back with ungetch, last one first, does the job, and
   ungetch already checks for overflow. */
void ungets(char s[]) {
  int i;

  i = strlen(s);
  while (i > 0)
    ungetch(s[--i]);
}

/* getline: get line into s with getch, return length */
int getline(char s[], int lim) {
  int c, i;

  i = 0;
  while (--lim > 0 && (c = getch()) != EOF && c != '\n')
    s[i++] = c;
  if (c == '\n')
    s[i++] = c;
  s[i] = '\0';
  return i;
}

#define BUFSIZE (MAXLINE + 1) /* room for a whole line */

char buf[BUFSIZE]; /* buffer for ungetch */
int bufp = 0;      /* next free position in buf */

/* getch: get a (possibly pushed-back) character */
int getch(void) {
  return (bufp > 0) ? buf[--bufp] : getchar();
}

/* ungetch: push character back on input */
void ungetch(int c) {
  if (bufp >= BUFSIZE)
    printf("ungetch: too many characters\n");
  else
    buf[bufp++] = c;
}
