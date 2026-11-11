Write a program to compare two files, printing the first line where they differ.

The two file names are the arguments. Print the first line that differs, from each file, as the file name, a colon, the line number, a colon, a blank and the line, like `a.txt:3: some text`. If one file ends first, print `EOF` for its line. Lines are compared without their newlines, so a last line with no newline matches the same line with one. Print nothing if the files are the same. Lines are at most 1000 characters.
