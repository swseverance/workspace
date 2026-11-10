Make `dcl` recover from input errors.

Each input line holds one declaration, and may have errors: anything that doesn't fit the grammar, such as a missing `)` or `]`, a missing name, extra tokens at the end, a data type that isn't a name, or a blank line. For a line with an error, print `syntax error` once instead of a description, and carry on with the next line as if nothing had happened. Print the other lines as `dcl` does, and treat the end of the input like the end of a line.
