Design and write `_flushbuf`, `fflush`, and `fclose`.

Use them in a program that copies its standard input to a file `out.txt` with `putc`, opened with `fopen("out.txt", "w")`, then closes it with `fclose`; appends the line `--` to it, opening it with `"a"`; then copies `out.txt` to the standard output with `getc` and `putchar`, calls `fflush(stdout)`, and finally writes `[end]` and a newline with `write(1, ...)`.
