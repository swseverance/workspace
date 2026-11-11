Revise the main routine of the longest-line program so it will correctly print the length of arbitrary long input lines, and as much as possible of the text.

Print the length of the longest line, counting its newline, on a line of its own. Then print as much of the line as fits in `longest` with `printf("%s", longest)`, and a newline if that text doesn't end with one. If several lines are equally long, use the first.

```c
#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
void copy(char to[], char from[]);

/* print longest input line */
int main()
{
  /* your code goes here */

  return 0;
}
```
