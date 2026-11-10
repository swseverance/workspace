Write a private version of `scanf` analogous to `minprintf` from the previous section.

Handle the conversions `d`, `o`, `x` (into an `int` or `unsigned`), `f` (into a `float`), `s` and `c`, each with an optional field width, plus `%%`; white space in the format matches any amount of white space in the input, including none, and any other character must match itself. Return the number of values assigned, or `EOF` if the input ends before the first one, as `scanf` does.

Use it in a program that takes a format with one conversion as its argument and calls your `scanf` with it until that returns something other than 1, printing each value on a line of its own: integers in decimal, a `float` with `%g`, a string as it is, and a character inside brackets, like `[a]`.
