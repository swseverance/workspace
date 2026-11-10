Add commands for handling variables. (It's easy to provide twenty-six variables with single-letter names.) Add a variable for the most recently printed value.

Each capital letter `A` to `Z` is a variable, which starts at 0; the letter pushes its value. `=` pops a variable's value and the value below it, stores that value in the variable and pushes it back, so `3 A =` sets `A` to 3 and leaves 3 on the stack. `v` pushes the value most recently printed by a newline, which starts at 0.
