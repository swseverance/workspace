Write a cross-referencer that prints a list of all words in a document, and for each word, a list of the line numbers on which it occurs. Remove noise words like "the," "and," and so on.

A word is a run of letters, taken in lower case; the noise words are `a an and in is it of or the to`. Print each word in alphabetical order on a line of its own, followed by the numbers of the lines it's on, in increasing order and each once, separated by blanks: `apple 1 3 5`. Lines are numbered from 1.
