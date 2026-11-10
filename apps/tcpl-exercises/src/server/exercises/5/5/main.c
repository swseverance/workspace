#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char *s, int lim);
void chop(char *s, int len);
void reset(char *s, char *line, int size);
int sign(int n);
char *strncpy(char *s, const char *t, size_t n);
char *strncat(char *s, const char *t, size_t n);
int strncmp(const char *s, const char *t, size_t n);

/* for each group of lines s, t and n, try each function on s and t */
int main() {
  int len, n;
  char line[MAXLINE + 2], t[MAXLINE + 2], num[MAXLINE + 2];
  char s[2 * MAXLINE + 1]; /* room for strncat */

  while ((len = getline(line, MAXLINE + 2)) > 0) {
    chop(line, len);
    chop(t, getline(t, MAXLINE + 2));
    getline(num, MAXLINE + 2);
    for (n = 0, len = 0; num[len] >= '0' && num[len] <= '9'; len++)
      n = 10 * n + (num[len] - '0');

    reset(s, line, sizeof s);
    printf("%s\n", strncpy(s, t, n));
    reset(s, line, sizeof s);
    printf("%s\n", strncat(s, t, n));
    reset(s, line, sizeof s);
    printf("%d\n", sign(strncmp(s, t, n)));
  }

  return 0;
}

/* strncpy: copy at most n characters of t to s; pad with '\0's if t is
   shorter; return s */
char *strncpy(char *s, const char *t, size_t n) {
  char *start = s;

  while (n > 0 && *t) {
    *s++ = *t++;
    n--;
  }
  while (n-- > 0)
    *s++ = '\0';
  return start;
}

/* strncat: concatenate at most n characters of t to the end of s,
   ending s with '\0'; return s */
char *strncat(char *s, const char *t, size_t n) {
  char *start = s;

  while (*s)
    s++;
  while (n-- > 0 && *t)
    *s++ = *t++;
  *s = '\0';
  return start;
}

/* strncmp: compare at most n characters of s and t; return <0 if s<t,
   0 if s==t, >0 if s>t */
int strncmp(const char *s, const char *t, size_t n) {
  for (; n > 0; s++, t++, n--)
    if (*s != *t)
      return *(unsigned char *)s - *(unsigned char *)t;
    else if (*s == '\0')
      return 0;
  return 0;
}

/* reset: fill s, of size size, with '\0's, then copy line into it */
void reset(char *s, char *line, int size) {
  char *p;

  for (p = s; p < s + size; p++)
    *p = '\0';
  while ((*s++ = *line++))
    ;
}

/* sign: -1, 0 or 1 as n is negative, zero or positive */
int sign(int n) {
  return (n > 0) - (n < 0);
}

/* getline: read a line into s, return length */
int getline(char *s, int lim) {
  int c;
  char *start = s;

  while (--lim > 0 && (c = getchar()) != EOF && c != '\n')
    *s++ = c;
  if (c == '\n')
    *s++ = c;
  *s = '\0';
  return s - start;
}

/* chop: remove the newline from the end of s, which has length len */
void chop(char *s, int len) {
  if (len > 0 && s[len - 1] == '\n')
    s[len - 1] = '\0';
}
