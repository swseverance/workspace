Rewrite the function `lower`, which converts upper case letters to lower case, with a conditional expression instead of `if-else`.

```c
/* lower:  convert c to lower case; ASCII only */
int lower(int c)
{
    if (c >= 'A' && c <= 'Z')
        return c + 'a' - 'A';
    else
        return c;
}
```

Use it in a program that copies its input to its output, converting upper case letters to lower case.
