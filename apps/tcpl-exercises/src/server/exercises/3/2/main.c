#include <stdio.h>
#define MAXLEN 3000 /* maximum input size */

void escape(char s[], char t[]);
void unescape(char s[], char t[]);

/* print the input with escape sequences made visible, then with
   escape sequences turned into real characters */
int main() {
  char t[MAXLEN + 1], s[2 * MAXLEN + 1];
  int c, i;

  for (i = 0; i < MAXLEN && (c = getchar()) != EOF; ++i)
    t[i] = c;
  t[i] = '\0';

  escape(s, t);
  printf("%s\n", s);
  unescape(s, t);
  printf("%s", s);

  return 0;
}

/* escape: copy t to s, making newlines, tabs and backslashes visible */
void escape(char s[], char t[]) {
  int i, j;

  for (i = j = 0; t[i] != '\0'; ++i)
    switch (t[i]) {
    case '\n':
      s[j++] = '\\';
      s[j++] = 'n';
      break;
    case '\t':
      s[j++] = '\\';
      s[j++] = 't';
      break;
    case '\\':
      s[j++] = '\\';
      s[j++] = '\\';
      break;
    default:
      s[j++] = t[i];
      break;
    }
  s[j] = '\0';
}

/* unescape: copy t to s, turning \n, \t and \\ into real characters */
void unescape(char s[], char t[]) {
  int i, j;

  for (i = j = 0; t[i] != '\0'; ++i)
    if (t[i] != '\\')
      s[j++] = t[i];
    else
      switch (t[i + 1]) {
      case 'n':
        s[j++] = '\n';
        ++i;
        break;
      case 't':
        s[j++] = '\t';
        ++i;
        break;
      case '\\':
        s[j++] = '\\';
        ++i;
        break;
      default: /* not an escape sequence: copy the backslash */
        s[j++] = '\\';
        break;
      }
  s[j] = '\0';
}
