#include <stdlib.h> /* malloc, free, NULL */
#include <fcntl.h>  /* open, creat, O_RDONLY, O_WRONLY */
#include <unistd.h> /* read, write, close, lseek */

#define EOF (-1)
#define BUFSIZ 1024
#define OPEN_MAX 20 /* max #files open at once */

typedef struct _iobuf {
  int cnt;    /* characters left */
  char *ptr;  /* next character position */
  char *base; /* location of buffer */
  int flag;   /* mode of file access */
  int fd;     /* file descriptor */
} FILE;
extern FILE _iob[OPEN_MAX];

#define stdin (&_iob[0])
#define stdout (&_iob[1])
#define stderr (&_iob[2])

enum _flags {
  _READ = 01,   /* file open for reading */
  _WRITE = 02,  /* file open for writing */
  _UNBUF = 04,  /* file is unbuffered */
  _EOF = 010,   /* EOF has occurred on this file */
  _ERR = 020    /* error occurred on this file */
};

int _fillbuf(FILE *);
int _flushbuf(int, FILE *);

#define feof(p) (((p)->flag & _EOF) != 0)
#define ferror(p) (((p)->flag & _ERR) != 0)
#define fileno(p) ((p)->fd)

#define getc(p) (--(p)->cnt >= 0 ? (unsigned char)*(p)->ptr++ : _fillbuf(p))
#define putc(x, p) (--(p)->cnt >= 0 ? *(p)->ptr++ = (x) : _flushbuf((x), p))

#define getchar() getc(stdin)
#define putchar(x) putc((x), stdout)

#define PERMS 0666 /* RW for owner, group, others */

FILE *fopen(const char *name, const char *mode);
int fseek(FILE *fp, long offset, int origin);

/* seek and read in the named file, as the arguments say */
int main(int argc, char *argv[]) {
  FILE *fp;
  int i, n, c;
  char ch;

  if (argc < 2 || (fp = fopen(argv[1], "r")) == NULL)
    return 1;
  for (i = 2; i + 2 < argc; i += 3) {
    if (fseek(fp, atol(argv[i + 1]), atoi(argv[i])) != 0) {
      write(1, "error\n", 6);
      continue;
    }
    for (n = atoi(argv[i + 2]); n > 0 && (c = getc(fp)) != EOF; n--) {
      ch = c;
      write(1, &ch, 1);
    }
    write(1, "\n", 1);
  }
  return 0;
}

/* fseek: move fp to offset from origin (0 start, 1 current position, 2
   end); return 0, or -1 on an error

   For input, the file descriptor is ahead of fp's position by the
   characters still in the buffer, so a relative seek allows for them,
   and the buffer is emptied so the next getc reads from the new place.
   For output, anything buffered is written first. */
int fseek(FILE *fp, long offset, int origin) {
  int n;

  if (fp->flag & _READ) {
    if (origin == 1)
      offset -= fp->cnt; /* unread characters in the buffer */
  } else if (fp->flag & _WRITE) {
    if (fp->base != NULL && (n = fp->ptr - fp->base) > 0) {
      if (write(fp->fd, fp->base, n) != n) {
        fp->flag |= _ERR;
        return -1;
      }
      fp->ptr = fp->base;
      fp->cnt = BUFSIZ;
    }
  } else
    return -1;
  if (lseek(fp->fd, offset, origin) < 0)
    return -1; /* the buffer is untouched */
  if (fp->flag & _READ) {
    fp->cnt = 0;
    fp->ptr = fp->base;
  }
  fp->flag &= ~_EOF;
  return 0;
}

/* fopen: open file, return file ptr */
FILE *fopen(const char *name, const char *mode) {
  int fd;
  FILE *fp;

  if (*mode != 'r' && *mode != 'w' && *mode != 'a')
    return NULL;
  for (fp = _iob; fp < _iob + OPEN_MAX; fp++)
    if ((fp->flag & (_READ | _WRITE)) == 0)
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
  fp->flag = (*mode == 'r') ? _READ : _WRITE;
  return fp;
}

/* _fillbuf: allocate and fill input buffer */
int _fillbuf(FILE *fp) {
  int bufsize;

  if ((fp->flag & (_READ | _EOF | _ERR)) != _READ)
    return EOF;
  bufsize = (fp->flag & _UNBUF) ? 1 : BUFSIZ;
  if (fp->base == NULL) /* no buffer yet */
    if ((fp->base = (char *)malloc(bufsize)) == NULL)
      return EOF; /* can't get buffer */
  fp->ptr = fp->base;
  fp->cnt = read(fp->fd, fp->ptr, bufsize);
  if (--fp->cnt < 0) {
    if (fp->cnt == -1)
      fp->flag |= _EOF;
    else
      fp->flag |= _ERR;
    fp->cnt = 0;
    return EOF;
  }
  return (unsigned char)*fp->ptr++;
}

FILE _iob[OPEN_MAX] = {
    /* stdin, stdout, stderr */
    {0, (char *)0, (char *)0, _READ, 0},
    {0, (char *)0, (char *)0, _WRITE, 1},
    {0, (char *)0, (char *)0, _WRITE | _UNBUF, 2}};
