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
  _READ = 01,  /* file open for reading */
  _WRITE = 02, /* file open for writing */
  _UNBUF = 04, /* file is unbuffered */
  _EOF = 010,  /* EOF has occurred on this file */
  _ERR = 020   /* error occurred on this file */
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
int fflush(FILE *fp);
int fclose(FILE *fp);

/* copy the input to out.txt, append "--", then print out.txt */
int main(void) {
  FILE *fp;
  int c;
  char *s;

  fp = fopen("out.txt", "w");
  while ((c = getchar()) != EOF)
    putc(c, fp);
  fclose(fp);

  fp = fopen("out.txt", "a");
  for (s = "--\n"; *s; s++)
    putc(*s, fp);
  fclose(fp);

  fp = fopen("out.txt", "r");
  while ((c = getc(fp)) != EOF)
    putchar(c);
  fclose(fp);

  fflush(stdout);
  write(1, "[end]\n", 6);
  return 0;
}

/* _flushbuf: write out a full output buffer, allocating it the first
   time, then put c in it; return c, or EOF on an error */
int _flushbuf(int c, FILE *fp) {
  int bufsize, n;
  unsigned char uc = c;

  if ((fp->flag & (_WRITE | _EOF | _ERR)) != _WRITE)
    return EOF;
  if (fp->flag & _UNBUF) { /* write each character at once */
    fp->cnt = 0;
    if (write(fp->fd, &uc, 1) != 1) {
      fp->flag |= _ERR;
      return EOF;
    }
    return uc;
  }
  bufsize = BUFSIZ;
  if (fp->base == NULL) { /* no buffer yet */
    if ((fp->base = (char *)malloc(bufsize)) == NULL) {
      fp->flag |= _ERR;
      return EOF;
    }
  } else if ((n = fp->ptr - fp->base) > 0 && write(fp->fd, fp->base, n) != n) {
    fp->flag |= _ERR;
    return EOF;
  }
  fp->ptr = fp->base;
  *fp->ptr++ = uc;
  fp->cnt = bufsize - 1;
  return uc;
}

/* fflush: write out any buffered output on fp, or on every output file
   if fp is NULL; return 0, or EOF on an error */
int fflush(FILE *fp) {
  int n, status = 0;

  if (fp == NULL) {
    for (fp = _iob; fp < _iob + OPEN_MAX; fp++)
      if ((fp->flag & _WRITE) && fflush(fp) == EOF)
        status = EOF;
    return status;
  }
  if ((fp->flag & _WRITE) == 0 || (fp->flag & _ERR))
    return EOF;
  if (fp->base != NULL && (n = fp->ptr - fp->base) > 0) {
    if (write(fp->fd, fp->base, n) != n) {
      fp->flag |= _ERR;
      status = EOF;
    }
    fp->ptr = fp->base;
    fp->cnt = BUFSIZ;
  }
  return status;
}

/* fclose: flush fp if it's for output, free its buffer, close the file
   and free its slot; return 0, or EOF on an error */
int fclose(FILE *fp) {
  int status = 0;

  if (fp == NULL || (fp->flag & (_READ | _WRITE)) == 0)
    return EOF;
  if ((fp->flag & _WRITE) && fflush(fp) == EOF)
    status = EOF;
  free(fp->base);
  if (close(fp->fd) == -1)
    status = EOF;
  fp->base = fp->ptr = NULL;
  fp->cnt = fp->flag = 0;
  return status;
}

/* fopen: open file, return file ptr */
FILE *fopen(const char *name, const char *mode) {
  int fd;
  FILE *fp;

  if (*mode != 'r' && *mode != 'w' && *mode != 'a')
    return NULL;
  for (fp = _iob; fp < _iob + OPEN_MAX; fp++)
    if ((fp->flag & (_READ | _WRITE)) == 0)
      break;                 /* found free slot */
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
