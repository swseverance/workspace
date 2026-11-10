Write a function `setbits(x,p,n,y)` that returns `x` with the `n` bits that begin at position `p` set to the rightmost `n` bits of `y`, leaving the other bits unchanged.

As in `getbits`, bit position 0 is at the right end, and the `n` bits that begin at position `p` are positions `p` down to `p+1-n`. `x` and `y` are `unsigned`.

Each input line holds `x`, `p`, `n` and `y` in decimal, separated by spaces. Print `setbits(x,p,n,y)` in decimal on a line of its own.
