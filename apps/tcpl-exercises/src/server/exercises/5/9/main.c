#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char *s, int lim);
int getints(char *s, int *v, int max);
int day_of_year(int year, int month, int day);
void month_day(int year, int yearday, int *pmonth, int *pday);

/* convert each date to a day of the year, and each day of the year to a
   date */
int main() {
  char line[MAXLINE];
  int v[3], n, m, d;

  while (getline(line, MAXLINE) > 0)
    if ((n = getints(line, v, 3)) == 3) {
      d = day_of_year(v[0], v[1], v[2]);
      printf("%d\n", d);
    } else if (n == 2) {
      month_day(v[0], v[1], &m, &d);
      printf("%d %d\n", m, d);
    }

  return 0;
}

static char daytab[2][13] = {
    {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31},
    {0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}};

/* day_of_year: set day of year from month & day; pointer version */
int day_of_year(int year, int month, int day) {
  int leap;
  char *p;

  leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  p = daytab[leap];
  while (--month > 0)
    day += *++p;
  return day;
}

/* month_day: set month, day from day of year; pointer version */
void month_day(int year, int yearday, int *pmonth, int *pday) {
  int leap;
  char *p;

  leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  p = daytab[leap];
  while (yearday > *++p)
    yearday -= *p;
  *pmonth = p - daytab[leap];
  *pday = yearday;
}

/* getints: convert up to max integers in s into v; return how many */
int getints(char *s, int *v, int max) {
  int n, sign;

  n = 0;
  while (n < max && *s != '\0') {
    if (*s == '-' || (*s >= '0' && *s <= '9')) {
      sign = (*s == '-') ? -1 : 1;
      if (*s == '-')
        s++;
      for (*v = 0; *s >= '0' && *s <= '9'; s++)
        *v = 10 * *v + (*s - '0');
      *v++ *= sign;
      n++;
    } else
      s++;
  }
  return n;
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
