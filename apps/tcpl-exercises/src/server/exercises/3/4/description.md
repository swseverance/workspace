In a two's complement number representation, our version of `itoa` does not handle the largest negative number, that is, the value of `n` equal to -(2<sup>wordsize-1</sup>). Explain why not. Modify it to print that value correctly, regardless of the machine on which it runs.

```c
/* itoa:  convert n to characters in s */
void itoa(int n, char s[])
{
    int i, sign;

    if ((sign = n) < 0)  /* record sign */
        n = -n;          /* make n positive */
    i = 0;
    do {      /* generate digits in reverse order */
        s[i++] = n % 10 + '0';  /* get next digit */
    } while ((n /= 10) > 0);    /* delete it */
    if (sign < 0)
        s[i++] = '-';
    s[i] = '\0';
    reverse(s);
}
```

Each input line holds an integer that fits in an `int`. Print the string `itoa` makes from it on a line of its own.
