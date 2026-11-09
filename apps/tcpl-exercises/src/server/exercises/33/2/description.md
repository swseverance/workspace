_Dummy exercise._ Read three integers, `lower upper step`, and print a Fahrenheit-to-Celsius table from `lower` to `upper` (inclusive) in steps of `step`.

### Format

```
Fahr  Celsius
----  -------
   0    -17.8
  20     -6.7
  40      4.4
----  -------
3 rows
```

- Fahrenheit is right-aligned in 4 columns, then two spaces, then Celsius right-aligned in 7 columns with one decimal place: `printf("%4d  %7.1f\n", ...)`.
- Celsius is `(5.0 / 9.0) * (fahr - 32)`.
- The last line counts the rows: `1 row` or `N rows`.
- Return `0` from `main`.
