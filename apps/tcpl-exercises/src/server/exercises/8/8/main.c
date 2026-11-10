#include <stdio.h>
#include <stddef.h> /* size_t, NULL */
#include <stdint.h> /* intptr_t */
#include <string.h>

void *sbrk(intptr_t increment);

typedef long Align; /* for alignment to long boundary */

union header { /* block header */
  struct {
    union header *ptr; /* next block if on free list */
    unsigned size;     /* size of this block */
  } s;
  Align x; /* force alignment of blocks */
};

typedef union header Header;

static Header base;          /* empty list to get started */
static Header *freep = NULL; /* start of free list */

static Header *kr_morecore(unsigned);
void *kr_malloc(size_t nbytes);
void kr_free(void *);
void bfree(void *p, size_t n);

#define ARENASIZE 10000

static char arena[ARENASIZE];

/* run bfree, malloc and free commands, saying where blocks come from */
int main(void) {
  char line[100], *last = NULL;
  size_t off, n;

  while (fgets(line, sizeof line, stdin) != NULL)
    if (sscanf(line, "bfree %zu %zu", &off, &n) == 2)
      bfree(arena + off, n);
    else if (sscanf(line, "malloc %zu", &n) == 1) {
      if ((last = kr_malloc(n)) == NULL)
        printf("NULL\n");
      else if (last >= arena && last < arena + ARENASIZE)
        printf("arena\n");
      else
        printf("heap\n");
    } else if (strncmp(line, "free", 4) == 0 && last != NULL) {
      kr_free(last);
      last = NULL;
    }
  return 0;
}

/* bfree: add the n characters at p to the free list, after aligning p
   to a Header; ignore a block too small to hold a header and a unit */
void bfree(void *p, size_t n) {
  uintptr_t start, aligned;
  Header *hp;

  start = (uintptr_t)p;
  aligned = (start + sizeof(Header) - 1) / sizeof(Header) * sizeof(Header);
  if (n < aligned - start)
    return;
  n -= aligned - start;
  if (n / sizeof(Header) < 2) /* no room for a header and a unit */
    return;
  if (freep == NULL) { /* no free list yet */
    base.s.ptr = freep = &base;
    base.s.size = 0;
  }
  hp = (Header *)aligned;
  hp->s.size = n / sizeof(Header);
  kr_free((void *)(hp + 1));
}

/* kr_malloc: general-purpose storage allocator */
void *kr_malloc(size_t nbytes) {
  Header *p, *prevp;
  unsigned nunits;

  nunits = (nbytes + sizeof(Header) - 1) / sizeof(Header) + 1;
  if ((prevp = freep) == NULL) { /* no free list yet */
    base.s.ptr = freep = prevp = &base;
    base.s.size = 0;
  }
  for (p = prevp->s.ptr;; prevp = p, p = p->s.ptr) {
    if (p->s.size >= nunits) {  /* big enough */
      if (p->s.size == nunits)  /* exactly */
        prevp->s.ptr = p->s.ptr;
      else { /* allocate tail end */
        p->s.size -= nunits;
        p += p->s.size;
        p->s.size = nunits;
      }
      freep = prevp;
      return (void *)(p + 1);
    }
    if (p == freep) /* wrapped around free list */
      if ((p = kr_morecore(nunits)) == NULL)
        return NULL; /* none left */
  }
}

#define NALLOC 1024 /* minimum #units to request */

/* kr_morecore: ask system for more memory */
static Header *kr_morecore(unsigned nu) {
  char *cp;
  Header *up;

  if (nu < NALLOC)
    nu = NALLOC;
  cp = sbrk(nu * sizeof(Header));
  if (cp == (char *)-1) /* no space at all */
    return NULL;
  up = (Header *)cp;
  up->s.size = nu;
  kr_free((void *)(up + 1));
  return freep;
}

/* kr_free: put block ap in free list */
void kr_free(void *ap) {
  Header *bp, *p;

  bp = (Header *)ap - 1; /* point to block header */
  for (p = freep; !(bp > p && bp < p->s.ptr); p = p->s.ptr)
    if (p >= p->s.ptr && (bp > p || bp < p->s.ptr))
      break; /* freed block at start or end of arena */

  if (bp + bp->s.size == p->s.ptr) { /* join to upper nbr */
    bp->s.size += p->s.ptr->s.size;
    bp->s.ptr = p->s.ptr->s.ptr;
  } else
    bp->s.ptr = p->s.ptr;
  if (p + p->s.size == bp) { /* join to lower nbr */
    p->s.size += bp->s.size;
    p->s.ptr = bp->s.ptr;
  } else
    p->s.ptr = bp;
  freep = p;
}
