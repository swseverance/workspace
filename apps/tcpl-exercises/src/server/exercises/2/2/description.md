Write a loop equivalent to the `for` loop above without using `&&` or `||`.

```c
for (i=0; i < lim-1 && (c=getchar()) != '\n' && c != EOF; ++i)
    s[i] = c;
```

Put your loop in `getline` in this program, which prints each line it reads after its length:

```c
#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);

/* print each input line after its length */
int main()
{
  int len;
  char line[MAXLINE];

  while ((len = getline(line, MAXLINE)) > 0) {
    printf("%d: %s", len, line);
    if (line[len-1] != '\n')
      putchar('\n');
  }
  return 0;
}

/* getline:  read a line into s, return length */
int getline(char s[], int lim)
{
  int c, i;

  /* your loop goes here */

  if (c == '\n') {
    s[i] = c;
    ++i;
  }
  s[i] = '\0';
  return i;
}
```
