#include <stdio.h>
#include <ctype.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int max);
double atof(char s[]);

/* print the value of each input number */
int main() {
  char line[MAXLINE];

  while (getline(line, MAXLINE) > 0)
    printf("%g\n", atof(line));

  return 0;
}

/* atof: convert string s to double; handles scientific notation */
double atof(char s[]) {
  double val, power;
  int i, sign, esign, exp;

  for (i = 0; isspace(s[i]); i++) /* skip white space */
    ;
  sign = (s[i] == '-') ? -1 : 1;
  if (s[i] == '+' || s[i] == '-')
    i++;
  for (val = 0.0; isdigit(s[i]); i++)
    val = 10.0 * val + (s[i] - '0');
  if (s[i] == '.')
    i++;
  for (power = 1.0; isdigit(s[i]); i++) {
    val = 10.0 * val + (s[i] - '0');
    power *= 10;
  }
  val = sign * val / power;

  if (s[i] == 'e' || s[i] == 'E') {
    i++;
    esign = (s[i] == '-') ? -1 : 1;
    if (s[i] == '+' || s[i] == '-')
      i++;
    for (exp = 0; isdigit(s[i]); i++)
      exp = 10 * exp + (s[i] - '0');
    while (exp-- > 0)
      val = (esign > 0) ? val * 10 : val / 10;
  }
  return val;
}

/* getline: get line into s, return length */
int getline(char s[], int lim) {
  int c, i;

  i = 0;
  while (--lim > 0 && (c = getchar()) != EOF && c != '\n')
    s[i++] = c;
  if (c == '\n')
    s[i++] = c;
  s[i] = '\0';
  return i;
}
