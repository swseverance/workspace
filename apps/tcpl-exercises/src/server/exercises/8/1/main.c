#include <fcntl.h>
#include <string.h>
#include <unistd.h>

#define BUFSIZE 8192

void filecopy(int ifd, int ofd);
void error(char *msg, char *name);

/* cat: concatenate files, using system calls instead of the standard
   library */
int main(int argc, char *argv[]) {
  int fd;

  if (argc == 1) /* no args; copy standard input */
    filecopy(0, 1);
  else
    while (--argc > 0)
      if ((fd = open(*++argv, O_RDONLY, 0)) == -1) {
        error("cat: can't open ", *argv);
        return 2;
      } else {
        filecopy(fd, 1);
        close(fd);
      }
  return 0;
}

/* filecopy: copy file descriptor ifd to ofd */
void filecopy(int ifd, int ofd) {
  char buf[BUFSIZE];
  int n;

  while ((n = read(ifd, buf, BUFSIZE)) > 0)
    if (write(ofd, buf, n) != n)
      error("cat: write error", "");
}

/* error: print msg and name on the standard error */
void error(char *msg, char *name) {
  write(2, msg, strlen(msg));
  write(2, name, strlen(name));
  write(2, "\n", 1);
}
