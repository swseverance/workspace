Write the program `tail`, which prints the last `n` lines of its input. By default, `n` is set to 10, let us say, but it can be changed by an optional argument so that

```
tail -n
```

prints the last `n` lines. The program should behave rationally no matter how unreasonable the input or the value of `n`. Write the program so it makes the best use of available storage; lines should be stored as in the sorting program of Section 5.6, not in a two-dimensional array of fixed size.

Print the lines exactly as they are in the input: all of them if there are fewer than `n`, and none if `n` is 0. The input is at most 5000 lines of at most 1000 characters each, 50,000 characters in all.
