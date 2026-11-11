#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAXTOKEN 100
#define MAXOUT 1000

enum { NAME, PARENS, BRACKETS };

int gettoken(void);
int nexttoken(void);
int getch(void);
void ungetch(int);

int tokentype;        /* type of last token */
char token[MAXTOKEN]; /* last token string */
char out[MAXOUT];
int pushedback = 0; /* 1 if gettoken should return the last token again */

/* undcl: convert word descriptions to declarations, adding parentheses
   only where they're needed: around a pointer that's followed by () or
   [], which bind tighter than * */
int main(void) {
  int type;
  char temp[MAXOUT + MAXTOKEN];

  while (gettoken() != EOF) {
    strcpy(out, token);
    while ((type = gettoken()) != '\n' && type != EOF)
      if (type == PARENS || type == BRACKETS)
        strcat(out, token);
      else if (type == '*') {
        type = nexttoken();
        sprintf(temp, (type == PARENS || type == BRACKETS) ? "(*%s)" : "*%s",
                out);
        strcpy(out, temp);
      } else if (type == NAME) {
        sprintf(temp, "%s %s", token, out);
        strcpy(out, temp);
      } else
        printf("invalid input at %s\n", token);
    printf("%s\n", out);
  }
  return 0;
}

/* nexttoken: look at the next token without using it up */
int nexttoken(void) {
  int type;

  type = gettoken();
  pushedback = 1;
  return type;
}

/* gettoken: return next token */
int gettoken(void) {
  int c;
  char *p = token;

  if (pushedback) {
    pushedback = 0;
    return tokentype;
  }
  while ((c = getch()) == ' ' || c == '\t')
    ;
  if (c == '(') {
    if ((c = getch()) == ')') {
      strcpy(token, "()");
      return tokentype = PARENS;
    } else {
      if (c != EOF)
        ungetch(c);
      return tokentype = '(';
    }
  } else if (c == '[') {
    for (*p++ = c; (*p++ = getch()) != ']';)
      ;
    *p = '\0';
    return tokentype = BRACKETS;
  } else if (isalpha(c)) {
    for (*p++ = c; isalnum(c = getch());)
      *p++ = c;
    *p = '\0';
    if (c != EOF)
      ungetch(c);
    return tokentype = NAME;
  } else
    return tokentype = c;
}

#define BUFSIZE 100

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
