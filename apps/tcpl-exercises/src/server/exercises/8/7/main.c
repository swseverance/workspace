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

#define MAXBYTES 1000000 /* largest request kr_malloc accepts */
#define MAXBLOCKS 10000

static Header *arenalo = NULL, *arenahi = NULL; /* bounds of all memory
                                                    from kr_morecore */

/* run malloc and free commands, numbering the blocks */
int main(void) {
  static char notmine[64]; /* never from kr_malloc */
  char line[100], *blocks[MAXBLOCKS];
  int nblocks = 0, i, k;
  size_t n;

  while (fgets(line, sizeof line, stdin) != NULL)
    if (sscanf(line, "malloc %zu", &n) == 1) {
      if (nblocks >= MAXBLOCKS)
        break;
      if ((blocks[nblocks] = kr_malloc(n)) == NULL)
        printf("NULL\n");
      else {
        memset(blocks[nblocks], 0, n);
        printf("%d\n", nblocks);
      }
      nblocks++;
    } else if (strncmp(line, "free static", 11) == 0)
      kr_free(notmine);
    else if (sscanf(line, "free %d +%d", &i, &k) == 2 && i >= 0 && i < nblocks)
      kr_free(blocks[i] + k);
    else if (sscanf(line, "free %d", &i) == 1 && i >= 0 && i < nblocks)
      kr_free(blocks[i]);
  return 0;
}

/* kr_malloc: general-purpose storage allocator; NULL for 0 bytes or
   more than MAXBYTES */
void *kr_malloc(size_t nbytes) {
  Header *p, *prevp;
  unsigned nunits;

  if (nbytes == 0 || nbytes > MAXBYTES)
    return NULL;
  nunits = (nbytes + sizeof(Header) - 1) / sizeof(Header) + 1;
  if ((prevp = freep) == NULL) { /* no free list yet */
    base.s.ptr = freep = prevp = &base;
    base.s.size = 0;
  }
  for (p = prevp->s.ptr;; prevp = p, p = p->s.ptr) {
    if (p->s.size >= nunits) { /* big enough */
      if (p->s.size == nunits) /* exactly */
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

/* kr_morecore: ask system for more memory, noting where it is */
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
  if (arenalo == NULL || up < arenalo)
    arenalo = up;
  if (arenahi == NULL || up + nu > arenahi)
    arenahi = up + nu;
  kr_free((void *)(up + 1));
  return freep;
}

/* isfree: is bp inside a block on the free list? */
static int isfree(Header *bp) {
  Header *p;

  if (freep == NULL)
    return 0;
  p = freep;
  do {
    if (bp >= p && bp < p + p->s.size)
      return 1;
    p = p->s.ptr;
  } while (p != freep);
  return 0;
}

/* kr_free: put block ap in free list, after checking that it's a block
   kr_malloc handed out and that isn't free already */
void kr_free(void *ap) {
  Header *bp, *p;

  if (ap == NULL)
    return;
  bp = (Header *)ap - 1; /* point to block header */
  if (arenalo == NULL || bp < arenalo || bp >= arenahi || bp->s.size == 0 ||
      bp->s.size > (unsigned)(arenahi - bp) || isfree(bp)) {
    printf("kr_free: bad pointer\n");
    return;
  }
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
