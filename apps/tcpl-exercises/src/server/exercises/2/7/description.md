Write a function `invert(x,p,n)` that returns `x` with the `n` bits that begin at position `p` inverted (i.e., 1 changed into 0 and vice versa), leaving the others unchanged.

As in `getbits`, bit position 0 is at the right end, and the `n` bits that begin at position `p` are positions `p` down to `p+1-n`. `x` is `unsigned`.

Each input line holds `x`, `p` and `n` in decimal, separated by spaces. Print `invert(x,p,n)` in decimal on a line of its own.
