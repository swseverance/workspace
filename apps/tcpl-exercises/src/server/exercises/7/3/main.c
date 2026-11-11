#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <ctype.h>

#define MAXLINE 1000 /* maximum input line size */
#define MAXSPEC 100  /* longest conversion specification */

void minprintf(char *fmt, ...);
int conversion(char *fmt);

/* print each line's value with its format, through minprintf */
int main(void) {
  char line[MAXLINE + 2], *value, *p;
  int len;

  while (fgets(line, sizeof line, stdin) != NULL) {
    len = strlen(line);
    if (len > 0 && line[len - 1] == '\n')
      line[len - 1] = '\0';
    if ((p = strchr(line, '\t')) != NULL) { /* format, tab, value */
      *p = '\0';
      value = p + 1;
    } else
      value = "";

    switch (conversion(line)) {
    case 'd':
    case 'i':
      minprintf(line, atoi(value));
      break;
    case 'o':
    case 'u':
    case 'x':
    case 'X':
      minprintf(line, (unsigned)strtoul(value, NULL, 10));
      break;
    case 'f':
    case 'e':
    case 'E':
    case 'g':
    case 'G':
      minprintf(line, atof(value));
      break;
    case 'c':
      minprintf(line, value[0]);
      break;
    case 's':
      minprintf(line, value);
      break;
    default: /* no conversion */
      minprintf(line);
      break;
    }
    putchar('\n');
  }
  return 0;
}

/* conversion: the conversion character of fmt's first conversion other
   than %%, or 0 */
int conversion(char *fmt) {
  char *p;

  for (p = fmt; *p; p++)
    if (*p == '%') {
      while (*++p && strchr("-+ 0#.0123456789", *p))
        ;
      if (*p == '\0')
        break;
      if (*p != '%')
        return *p;
    }
  return 0;
}

/* minprintf: minimal printf with variable argument list; handles flags,
   width, precision and the conversions d i o x X u c s f e E g G and %%,
   by passing each specification on to printf */
void minprintf(char *fmt, ...) {
  va_list ap; /* points to each unnamed arg in turn */
  char *p, spec[MAXSPEC], *s;

  va_start(ap, fmt); /* make ap point to 1st unnamed arg */
  for (p = fmt; *p; p++) {
    if (*p != '%') {
      putchar(*p);
      continue;
    }
    s = spec; /* copy the specification: %, flags, width, precision */
    *s++ = '%';
    while (*++p && strchr("-+ 0#.0123456789", *p))
      if (s < spec + MAXSPEC - 2)
        *s++ = *p;
    if (*p == '\0')
      break;
    *s++ = *p;
    *s = '\0';
    switch (*p) {
    case 'd':
    case 'i':
    case 'c':
      printf(spec, va_arg(ap, int));
      break;
    case 'o':
    case 'u':
    case 'x':
    case 'X':
      printf(spec, va_arg(ap, unsigned));
      break;
    case 'f':
    case 'e':
    case 'E':
    case 'g':
    case 'G':
      printf(spec, va_arg(ap, double));
      break;
    case 's':
      printf(spec, va_arg(ap, char *));
      break;
    default: /* %% or an unknown conversion: print it as it is */
      putchar(*p);
      break;
    }
  }
  va_end(ap); /* clean up when done */
}
