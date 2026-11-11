#include <stdio.h>
#include <stdlib.h>
#include <stdint.h> /* SIZE_MAX */
#include <string.h>

#define MAXLINE 1000
#define MAXFILL 1000000 /* largest block filled with 'x' first */

void *calloc(size_t n, size_t size);

/* for each n and size, dirty some memory, then count the bytes calloc
   leaves non-zero */
int main(void) {
  char line[MAXLINE];
  unsigned long n, size;
  char *p;
  size_t i, nonzero;

  while (fgets(line, sizeof line, stdin) != NULL) {
    if (sscanf(line, "%lu %lu", &n, &size) != 2)
      continue;
    if (size == 0 || n <= MAXFILL / size) { /* n * size <= MAXFILL */
      if ((p = malloc(n * size)) != NULL) {
        memset(p, 'x', n * size);
        free(p);
      }
    }
    if ((p = calloc(n, size)) == NULL)
      printf("NULL\n");
    else {
      for (i = nonzero = 0; i < n * size; i++)
        if (p[i] != 0)
          nonzero++;
      printf("%zu\n", nonzero);
      free(p);
    }
  }
  return 0;
}

/* calloc: n objects of size size, initialized to zero; NULL if n * size
   doesn't fit in a size_t or there's no room */
void *calloc(size_t n, size_t size) {
  char *p;
  size_t i, nbytes;

  if (size != 0 && n > SIZE_MAX / size) /* n * size would overflow */
    return NULL;
  nbytes = n * size;
  if ((p = malloc(nbytes)) != NULL)
    for (i = 0; i < nbytes; i++)
      p[i] = 0;
  return p;
}
