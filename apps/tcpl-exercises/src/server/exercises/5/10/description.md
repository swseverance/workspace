Write the program `expr`, which evaluates a reverse Polish expression from the command line, where each operator or operand is a separate argument. For example,

```
expr 2 3 4 + *
```

evaluates 2 &times; (3+4).

Handle `+`, `-`, `*` and `/`; an operand is a number such as `2`, `-1.5` or `.5`. Print the value with `printf("%.8g\n", ...)`. Print `error` instead if the expression is invalid: an operator without two operands, an argument that's neither an operator nor a number, division by zero, or anything other than exactly one value left at the end. The stack never needs more than 100 values.
