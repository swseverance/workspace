The standard library function

```c
int fseek(FILE *fp, long offset, int origin)
```

is identical to `lseek` except that `fp` is a file pointer instead of a file descriptor and return value is an `int` status, not a position. Write `fseek`. Make sure that your `fseek` coordinates properly with the buffering done for the other functions of the library.

As with `lseek`, `origin` 0 means from the start of the file, 1 from the current position, and 2 from the end; the current position is the next character `getc` would return. `fseek` returns 0, or -1 if the position would be before the start of the file. Use it in a program whose arguments are a file name and then groups of three numbers: an origin, an offset and a count. Open the file once with `fopen`. For each group, call `fseek` on it, then read up to that many characters with `getc` and write them with `write`, then a newline; print `error` instead if `fseek` fails.
