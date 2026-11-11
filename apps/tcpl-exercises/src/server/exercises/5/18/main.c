#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAXTOKEN 100

enum { NAME, PARENS, BRACKETS };

void dcl(void);
void dirdcl(void);
int gettoken(void);
int getch(void);
void ungetch(int);

int tokentype;           /* type of last token */
char token[MAXTOKEN];    /* last token string */
char name[MAXTOKEN];     /* identifier name */
char datatype[MAXTOKEN]; /* data type = char, int, etc. */
char out[1000];
int error;   /* 1 if the current line has an error */
int eol = 0; /* 1 once the current line's newline has been returned */

/* convert declaration to words, recovering from errors: a line with an
   error prints "syntax error" and nothing else, and the next line is
   read as if it hadn't happened */
int main(void) {
  while (eol = 0, gettoken() != EOF) { /* 1st token on line */
    error = 0;
    out[0] = '\0';
    if (tokentype == NAME) { /* is the datatype */
      strcpy(datatype, token);
      dcl(); /* parse rest of line */
    } else
      error = 1;
    if (tokentype != '\n')
      error = 1;
    while (tokentype != '\n') /* skip the rest of a bad line */
      gettoken();
    if (error)
      printf("syntax error\n");
    else
      printf("%s: %s %s\n", name, out, datatype);
  }
  return 0;
}

/* dcl: parse a declarator */
void dcl(void) {
  int ns;

  for (ns = 0; gettoken() == '*';) /* count *'s */
    ns++;
  dirdcl();
  while (ns-- > 0)
    strcat(out, " pointer to");
}

/* dirdcl: parse a direct declarator */
void dirdcl(void) {
  int type;

  if (tokentype == '(') { /* ( dcl ) */
    dcl();
    if (tokentype != ')')
      error = 1;
  } else if (tokentype == NAME) /* variable name */
    strcpy(name, token);
  else
    error = 1;
  if (error)
    return;
  while ((type = gettoken()) == PARENS || type == BRACKETS)
    if (type == PARENS)
      strcat(out, " function returning");
    else {
      strcat(out, " array");
      strcat(out, token);
      strcat(out, " of");
    }
}

/* gettoken: return next token; never reads past the end of a line, and
   treats the end of the input as the end of a line too, so one bad line
   can't swallow the next */
int gettoken(void) {
  int c;
  char *p = token;
  static int midline = 0; /* 1 if the line has had a token */

  if (eol)
    return tokentype = '\n';
  while ((c = getch()) == ' ' || c == '\t')
    ;
  if (c == '\n' || (c == EOF && midline)) {
    eol = 1;
    midline = 0;
    return tokentype = '\n';
  }
  if (c == EOF)
    return tokentype = EOF;
  midline = 1;
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
    for (*p++ = c; (c = getch()) != ']';) {
      if (c == '\n' || c == EOF) { /* no ]: an error */
        if (c == '\n')
          ungetch(c);
        return tokentype = '[';
      }
      if (p < token + MAXTOKEN - 2)
        *p++ = c;
    }
    *p++ = c;
    *p = '\0';
    return tokentype = BRACKETS;
  } else if (isalpha(c)) {
    for (*p++ = c; isalnum(c = getch());)
      if (p < token + MAXTOKEN - 1)
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
