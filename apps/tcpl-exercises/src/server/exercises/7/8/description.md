Write a program to print a set of files, starting each new one on a new page, with a title and a running page count for each file.

The file names are the arguments. A page is a title line, which is the file name, two blanks, `page` and the page number; then a blank line; then up to 10 lines of the file. Page numbers start at 1 for each file, and an empty file still gets one page. Start every page but the first with a form feed character (`\f`) before its title. End every line with a newline, even a last line that has none. Lines are at most 1000 characters.
