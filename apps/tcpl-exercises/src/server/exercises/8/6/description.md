The standard library function `calloc(n,size)` returns a pointer to `n` objects of size `size`, with the storage initialized to zero. Write `calloc`, by calling `malloc` or by modifying it.

Return `NULL` if `n * size` is too big to represent. Use it in a program whose input lines each hold `n` and `size`. For each line: if `n * size` is at most 1,000,000, `malloc` that many bytes, fill them with `'x'` and `free` them; then call `calloc(n, size)` and print the number of bytes in the result that aren't zero, or `NULL` if it returned `NULL`, and `free` it.
