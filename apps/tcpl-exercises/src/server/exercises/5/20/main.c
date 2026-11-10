#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAXTOKEN 100
#define MAXOUT 10000

enum { NAME, PARENS, BRACKETS };

void dcl(char *name, char *out);
void dirdcl(char *name, char *out);
void params(char *out);
void gettype(char *type);
int gettoken(void);
int getch(void);
void ungetch(int);

int tokentype;        /* type of last token */
char token[MAXTOKEN]; /* last token string */

/* convert declaration to words, with const and volatile before a data
   type, and parameter declarations inside a function's parentheses */
int main(void) {
  char name[MAXTOKEN], datatype[MAXTOKEN], out[MAXOUT];

  while (gettoken() != EOF) { /* 1st token on line */
    gettype(datatype);
    name[0] = out[0] = '\0';
    dcl(name, out); /* parse rest of line */
    if (tokentype != '\n' && tokentype != EOF)
      printf("syntax error\n");
    printf("%s: %s %s\n", name, out, datatype);
  }
  return 0;
}

/* gettype: read a data type, starting at the current token: any of
   const and volatile, then a type name */
void gettype(char *type) {
  type[0] = '\0';
  while (tokentype == NAME &&
         (strcmp(token, "const") == 0 || strcmp(token, "volatile") == 0)) {
    strcat(type, token);
    strcat(type, " ");
    gettoken();
  }
  strcat(type, token);
}

/* dcl: parse a declarator, putting its name in name (empty if it has
   none) and its description in out */
void dcl(char *name, char *out) {
  int ns;

  for (ns = 0; gettoken() == '*';) /* count *'s */
    ns++;
  dirdcl(name, out);
  while (ns-- > 0)
    strcat(out, " pointer to");
}

/* dirdcl: parse a direct declarator; without a name or ( dcl ), it's
   abstract, as a parameter's may be */
void dirdcl(char *name, char *out) {
  int type;

  if (tokentype == '(') { /* ( dcl ) */
    dcl(name, out);
    if (tokentype != ')')
      printf("error: missing )\n");
    type = gettoken();
  } else if (tokentype == NAME) { /* variable name */
    strcpy(name, token);
    type = gettoken();
  } else
    type = tokentype; /* no name */
  for (;; type = gettoken())
    if (type == PARENS)
      strcat(out, " function returning");
    else if (type == BRACKETS) {
      strcat(out, " array");
      strcat(out, token);
      strcat(out, " of");
    } else if (type == '(') /* parameter declarations */
      params(out);
    else
      break;
}

/* params: parse parameter declarations up to the closing ), describing
   them in out */
void params(char *out) {
  char type[MAXTOKEN], name[MAXTOKEN], pout[MAXOUT];

  strcat(out, " function taking (");
  do {
    gettoken(); /* the parameter's first word */
    gettype(type);
    name[0] = pout[0] = '\0';
    dcl(name, pout);
    if (pout[0] != '\0') {
      strcat(out, pout + 1); /* without its leading blank */
      strcat(out, " ");
    }
    strcat(out, type);
    if (tokentype == ',')
      strcat(out, ", ");
  } while (tokentype == ',');
  if (tokentype != ')')
    printf("error: missing )\n");
  strcat(out, ") returning");
}

/* gettoken: return next token */
int gettoken(void) {
  int c;
  char *p = token;

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
