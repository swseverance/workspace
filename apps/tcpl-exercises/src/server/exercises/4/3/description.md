Given the basic framework, it's straightforward to extend the calculator. Add the modulus (`%`) operator and provisions for negative numbers.

`%` pushes the remainder of the second element divided by the top one, computed with `fmod` from `<math.h>`, and reports a zero divisor as `/` does. A `-` followed directly by a digit or a decimal point starts a negative number; any other `-` is subtraction.
