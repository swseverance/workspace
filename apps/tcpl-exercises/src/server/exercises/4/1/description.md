Write the function `strindex(s,t)` which returns the position of the rightmost occurrence of `t` in `s`, or -1 if there is none.

```c
/* strindex:  return index of t in s, -1 if none */
int strindex(char s[], char t[])
{
    int i, j, k;

    for (i = 0; s[i] != '\0'; i++) {
        for (j=i, k=0; t[k]!='\0' && s[j]==t[k]; j++, k++)
            ;
        if (k > 0 && t[k] == '\0')
            return i;
    }
    return -1;
}
```

The input is pairs of lines, at most 1000 characters each: `s`, then `t`, without their newlines. For each pair, print `strindex(s,t)` on a line of its own. As above, an empty `t` occurs nowhere.
