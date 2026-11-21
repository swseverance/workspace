#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAXSPEC 100  /* longest conversion specification */
#define MAXWORD 1000 /* longest string or run of characters read, + 1 */

int minscanf(char *fmt, ...);
int conversion(char *fmt, int *width);
char *setwidth(char *fmt, int width);

/* read values with the format given as the argument, printing each */
int main(int argc, char *argv[]) {
  char *fmt, word[MAXWORD];
  int i, width;
  unsigned u;
  float f;

  if (argc != 2) {
    printf("usage: minscanf format\n");
    return 1;
  }
  fmt = argv[1];
  switch (conversion(fmt, &width)) {
  case 'd':
    while (minscanf(fmt, &i) == 1)
      printf("%d\n", i);
    break;
  case 'o':
  case 'x':
    while (minscanf(fmt, &u) == 1)
      printf("%u\n", u);
    break;
  case 'f':
    while (minscanf(fmt, &f) == 1)
      printf("%g\n", f);
    break;
  case 's': /* word must hold the string: limit a width that's too big */
    if (width == 0 || width > MAXWORD - 1)
      if ((fmt = setwidth(fmt, MAXWORD - 1)) == NULL)
        return 1;
    while (minscanf(fmt, word) == 1)
      printf("%s\n", word);
    break;
  case 'c': /* reads width characters, 1 without one, and adds no '\0' */
    if (width == 0)
      width = 1;
    else if (width > MAXWORD - 1) {
      width = MAXWORD - 1;
      if ((fmt = setwidth(fmt, width)) == NULL)
        return 1;
    }
    while (minscanf(fmt, word) == 1)
      printf("[%.*s]\n", width, word);
    break;
  }
  return 0;
}

/* conversion: the conversion character of fmt's first conversion other
   than %%, or 0; *width is its field width, 0 if it has none */
int conversion(char *fmt, int *width) {
  char *p;

  for (p = fmt; *p; p++)
    if (*p == '%') {
      for (*width = 0; isdigit((unsigned char)*++p);)
        if (*width < MAXWORD) /* any more is too big for main already */
          *width = 10 * *width + (*p - '0');
      if (*p == '\0')
        break;
      if (*p != '%')
        return *p;
    }
  return 0;
}

/* setwidth: a copy of fmt with its first conversion other than %% given
   the field width width, or NULL if there's no room for the copy */
char *setwidth(char *fmt, int width) {
  char *p, *q, *copy;

  for (p = fmt; *p != '%' || *(p + 1) == '%'; p++) /* find the conversion */
    if (*p == '%')
      p++;
  for (q = p + 1; isdigit((unsigned char)*q); q++) /* skip its width */
    ;
  if ((copy = (char *)malloc(strlen(fmt) + MAXSPEC)) != NULL)
    sprintf(copy, "%.*s%%%d%s", (int)(p - fmt), fmt, width, q);
  return copy;
}

/* minscanf: minimal scanf with variable argument list; handles d o x f s
   c with a field width, %%, white space and other characters, passing
   each conversion on to scanf */
int minscanf(char *fmt, ...) {
  va_list ap; /* points to each unnamed arg in turn */
  char *p, spec[MAXSPEC], *s;
  int c, n, r;

  va_start(ap, fmt);
  n = 0; /* values assigned */
  for (p = fmt; *p; p++) {
    if (isspace((unsigned char)*p)) { /* any amount of white space */
      while (isspace(c = getchar()))
        ;
      if (c != EOF)
        ungetc(c, stdin);
      continue;
    }
    if (*p != '%' || *(p + 1) == '%') { /* a character to match */
      if (*p == '%')
        p++;
      if ((c = getchar()) != *p) {
        if (c != EOF)
          ungetc(c, stdin);
        else if (n == 0)
          n = EOF;
        break;
      }
      continue;
    }
    s = spec; /* copy the specification: %, width, conversion */
    *s++ = '%';
    while (isdigit((unsigned char)*++p))
      if (s < spec + MAXSPEC - 2)
        *s++ = *p;
    if (*p == '\0')
      break;
    *s++ = *p;
    *s = '\0';
    switch (*p) {
    case 'd':
      r = scanf(spec, va_arg(ap, int *));
      break;
    case 'o':
    case 'x':
      r = scanf(spec, va_arg(ap, unsigned *));
      break;
    case 'f':
      r = scanf(spec, va_arg(ap, float *));
      break;
    case 's':
    case 'c':
      r = scanf(spec, va_arg(ap, char *));
      break;
    default: /* unknown conversion */
      r = 0;
      break;
    }
    if (r != 1) {
      if (r == EOF && n == 0)
        n = EOF;
      break;
    }
    n++;
  }
  va_end(ap);
  return n;
}
