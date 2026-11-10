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
      if (d < 0)
        printf("error\n");
      else
        printf("%d\n", d);
    } else if (n == 2) {
      month_day(v[0], v[1], &m, &d);
      if (m == 0)
        printf("error\n");
      else
        printf("%d %d\n", m, d);
    }

  return 0;
}

static char daytab[2][13] = {
    {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31},
    {0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}};

/* day_of_year: set day of year from month & day; -1 if there's no such
   date */
int day_of_year(int year, int month, int day) {
  int i, leap;

  leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  if (month < 1 || month > 12 || day < 1 || day > daytab[leap][month])
    return -1;
  for (i = 1; i < month; i++)
    day += daytab[leap][i];
  return day;
}

/* month_day: set month, day from day of year; both 0 if there's no such
   day of the year */
void month_day(int year, int yearday, int *pmonth, int *pday) {
  int i, leap;

  leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  if (yearday < 1 || yearday > (leap ? 366 : 365)) {
    *pmonth = *pday = 0;
    return;
  }
  for (i = 1; yearday > daytab[leap][i]; i++)
    yearday -= daytab[leap][i];
  *pmonth = i;
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
