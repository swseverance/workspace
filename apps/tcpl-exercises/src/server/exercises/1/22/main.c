#include <stdio.h>
#define WIDTH 20 /* fold lines longer than this */

/* fold long lines after the last blank or tab that fits */
int main() {
  char buf[WIDTH + 1]; /* the piece of the line not yet printed */
  int c, i, len, first, cut, end, next, broken, skipping;

  len = 0;
  broken = 0;   /* has this line been folded yet? */
  skipping = 0; /* dropping blanks and tabs after a break */
  while ((c = getchar()) != EOF) {
    if (c == '\n') {
      if (len > 0 || !broken) {
        for (i = 0; i < len; ++i)
          putchar(buf[i]);
        putchar('\n');
      }
      len = 0;
      broken = 0;
      skipping = 0;
    } else if (skipping && (c == ' ' || c == '\t')) {
      ; /* drop it */
    } else {
      skipping = 0;
      buf[len] = c;
      ++len;
      if (len > WIDTH) {
        /* the last blank or tab that has something before it */
        first = 0;
        while (first < len && (buf[first] == ' ' || buf[first] == '\t'))
          ++first;
        cut = 0;
        for (i = first + 1; i <= WIDTH; ++i)
          if (buf[i] == ' ' || buf[i] == '\t')
            cut = i;

        if (cut > 0) {
          end = cut;
          while (buf[end - 1] == ' ' || buf[end - 1] == '\t')
            --end;
          for (i = 0; i < end; ++i)
            putchar(buf[i]);
          putchar('\n');

          next = cut;
          while (next < len && (buf[next] == ' ' || buf[next] == '\t'))
            ++next;
          for (i = next; i < len; ++i)
            buf[i - next] = buf[i];
          len = len - next;
          if (len == 0)
            skipping = 1;
        } else { /* nowhere to break: cut after WIDTH characters */
          for (i = 0; i < WIDTH; ++i)
            putchar(buf[i]);
          putchar('\n');
          buf[0] = buf[WIDTH];
          len = 1;
        }
        broken = 1;
      }
    }
  }
  for (i = 0; i < len; ++i) /* a last line with no newline */
    putchar(buf[i]);

  return 0;
}
