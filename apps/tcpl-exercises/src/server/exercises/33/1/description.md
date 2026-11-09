_Dummy exercise._ Read an integer from standard input and print **double** its value, followed by a newline.

### Requirements

- Read exactly one integer with `scanf`.
- Print the result with `printf`, ending in `\n`.
- Return `0` from `main`.

### Examples

| Input | Output |
| ----: | -----: |
|   `5` |   `10` |
|   `0` |    `0` |
|  `-3` |   `-6` |

### Getting started

1. Declare an `int` to hold the input.
2. Read it, multiply by two, and print it.

```c
int n;
scanf("%d", &n);
```

> **Tip:** negative numbers need no special handling. `%d` reads the sign for you.

See [scanf on cppreference](https://en.cppreference.com/w/c/io/fscanf) for the full list of format specifiers.
