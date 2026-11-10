`malloc` accepts a size request without checking its plausibility; `free` believes that the block it is asked to free contains a valid size field. Improve these routines so they make more pains with error checking.

Make `kr_malloc` return `NULL` for a request of 0 bytes or more than 1,000,000. Make `kr_free` ignore `NULL`, and print `kr_free: bad pointer` on a line of its own and do nothing else for a pointer it didn't return, one inside a block rather than at its start, or one already freed.

Use them in a program whose input lines are commands. `malloc n` calls `kr_malloc(n)`, fills the block with zeros, and prints its number (0 for the first `malloc` command, 1 for the next, and so on) or `NULL`. `free i` frees block `i`; `free i +k` frees the address `k` bytes into block `i`; and `free static` frees the address of a static array.
