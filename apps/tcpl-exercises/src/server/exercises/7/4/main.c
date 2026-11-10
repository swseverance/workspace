#include <stdio.h>
#include <stdarg.h>
#include <string.h>
#include <ctype.h>

#define MAXSPEC 100 /* longest conversion specification */
#define MAXWORD 1000

int minscanf(char *fmt, ...);
int conversion(char *fmt);

/* read values with the format given as the argument, printing each */
int main(int argc, char *argv[]) {
  char *fmt, word[MAXWORD], c;
  int i;
  unsigned u;
  float f;

  if (argc != 2) {
    printf("usage: minscanf format\n");
    return 1;
  }
  fmt = argv[1];
  switch (conversion(fmt)) {
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
  case 's':
    while (minscanf(fmt, word) == 1)
      printf("%s\n", word);
    break;
  case 'c':
    while (minscanf(fmt, &c) == 1)
      printf("[%c]\n", c);
    break;
  }
  return 0;
}

/* conversion: the conversion character of fmt's first conversion other
   than %%, or 0 */
int conversion(char *fmt) {
  char *p;

  for (p = fmt; *p; p++)
    if (*p == '%') {
      while (isdigit(*++p))
        ;
      if (*p == '\0')
        break;
      if (*p != '%')
        return *p;
    }
  return 0;
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
    if (isspace(*p)) { /* any amount of white space */
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
    while (isdigit(*++p))
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
