Extend `entab` and `detab` to accept the shorthand

```
entab -m +n
```

to mean tab stops every `n` columns, starting at column `m`. Choose convenient (for the user) default behavior.

Write `entab` this way (Exercise 5-11 does `detab`). Count columns from 0 at the start of each line; columns before `m` have no tab stops. Without `-m`, start at column 0; without `+n`, use every 8 columns. As in Exercise 1-21, use the fewest tabs and blanks, a blank when one blank reaches a tab stop, and copy tabs in the input unchanged; a tab moves to the next tab stop.
