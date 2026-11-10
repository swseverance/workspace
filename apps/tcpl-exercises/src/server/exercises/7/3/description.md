Revise `minprintf` to handle more of the other facilities of `printf`.

```c
#include <stdarg.h>

/* minprintf: minimal printf with variable argument list */
void minprintf(char *fmt, ...)
{
    va_list ap; /* points to each unnamed arg in turn */
    char *p, *sval;
    int ival;
    double dval;

    va_start(ap, fmt); /* make ap point to 1st unnamed arg */
    for (p = fmt; *p; p++) {
        if (*p != '%') {
            putchar(*p);
            continue;
        }
        switch (*++p) {
        case 'd':
            ival = va_arg(ap, int);
            printf("%d", ival);
            break;
        case 'f':
            dval = va_arg(ap, double);
            printf("%f", dval);
            break;
        case 's':
            for (sval = va_arg(ap, char *); *sval; sval++)
                putchar(*sval);
            break;
        default:
            putchar(*p);
            break;
        }
    }
    va_end(ap); /* clean up when done */
}
```

Handle the flags `-`, `+`, blank, `0` and `#`, a field width and a precision written as numbers, the conversions `d i o x X u c s f e E g G`, and `%%`, all as `printf` does. Each input line holds a format with at most one conversion besides `%%`, a tab, and a value: an integer for `d`, `i`, `o`, `x`, `X` and `u`; a number for `f`, `e`, `E`, `g` and `G`; a character for `c`; and text, the rest of the line, for `s`. Print the value with `minprintf`, then a newline. Lines are at most 1000 characters, and widths and precisions at most 500.
