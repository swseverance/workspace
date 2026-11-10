#include <stdlib.h> /* malloc, NULL */
#include <fcntl.h>  /* open, creat, O_RDONLY, O_WRONLY */
#include <unistd.h> /* read, write, lseek */

#define EOF (-1)
#define BUFSIZ 1024
#define OPEN_MAX 20 /* max #files open at once */

typedef struct _iobuf {
  int cnt;    /* characters left */
  char *ptr;  /* next character position */
  char *base; /* location of buffer */
  struct {    /* mode of file access, as fields */
    unsigned int is_read : 1;  /* file open for reading */
    unsigned int is_write : 1; /* file open for writing */
    unsigned int is_unbuf : 1; /* file is unbuffered */
    unsigned int is_eof : 1;   /* EOF has occurred on this file */
    unsigned int is_err : 1;   /* error occurred on this file */
  } flag;
  int fd; /* file descriptor */
} FILE;

FILE _iob[OPEN_MAX] = {
    /* stdin, stdout, stderr */
    {0, (char *)0, (char *)0, {1, 0, 0, 0, 0}, 0},
    {0, (char *)0, (char *)0, {0, 1, 0, 0, 0}, 1},
    {0, (char *)0, (char *)0, {0, 1, 1, 0, 0}, 2}};

#define stdin (&_iob[0])
#define stdout (&_iob[1])
#define stderr (&_iob[2])

int _fillbuf(FILE *);

#define feof(p) ((p)->flag.is_eof != 0)
#define ferror(p) ((p)->flag.is_err != 0)
#define fileno(p) ((p)->fd)

#define getc(p) (--(p)->cnt >= 0 ? (unsigned char)*(p)->ptr++ : _fillbuf(p))

#define PERMS 0666 /* RW for owner, group, others */

FILE *fopen(const char *name, const char *mode);

/* copy the named files to the standard output with getc and write */
int main(int argc, char *argv[]) {
  FILE *fp;
  int c;
  char ch;

  while (--argc > 0)
    if ((fp = fopen(*++argv, "r")) != NULL)
      while ((c = getc(fp)) != EOF) {
        ch = c;
        write(1, &ch, 1);
      }
  return 0;
}

/* fopen: open file, return file ptr; flags as fields */
FILE *fopen(const char *name, const char *mode) {
  int fd;
  FILE *fp;

  if (*mode != 'r' && *mode != 'w' && *mode != 'a')
    return NULL;
  for (fp = _iob; fp < _iob + OPEN_MAX; fp++)
    if (!fp->flag.is_read && !fp->flag.is_write)
      break; /* found free slot */
  if (fp >= _iob + OPEN_MAX) /* no free slots */
    return NULL;

  if (*mode == 'w')
    fd = creat(name, PERMS);
  else if (*mode == 'a') {
    if ((fd = open(name, O_WRONLY, 0)) == -1)
      fd = creat(name, PERMS);
    lseek(fd, 0L, 2);
  } else
    fd = open(name, O_RDONLY, 0);
  if (fd == -1) /* couldn't access name */
    return NULL;
  fp->fd = fd;
  fp->cnt = 0;
  fp->base = NULL;
  fp->flag.is_read = (*mode == 'r');
  fp->flag.is_write = (*mode != 'r');
  fp->flag.is_unbuf = fp->flag.is_eof = fp->flag.is_err = 0;
  return fp;
}

/* _fillbuf: allocate and fill input buffer; flags as fields */
int _fillbuf(FILE *fp) {
  int bufsize;

  if (!fp->flag.is_read || fp->flag.is_eof || fp->flag.is_err)
    return EOF;
  bufsize = fp->flag.is_unbuf ? 1 : BUFSIZ;
  if (fp->base == NULL) /* no buffer yet */
    if ((fp->base = (char *)malloc(bufsize)) == NULL)
      return EOF; /* can't get buffer */
  fp->ptr = fp->base;
  fp->cnt = read(fp->fd, fp->ptr, bufsize);
  if (--fp->cnt < 0) {
    if (fp->cnt == -1)
      fp->flag.is_eof = 1;
    else
      fp->flag.is_err = 1;
    fp->cnt = 0;
    return EOF;
  }
  return (unsigned char)*fp->ptr++;
}
