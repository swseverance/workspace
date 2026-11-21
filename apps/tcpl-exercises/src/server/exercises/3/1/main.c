#include <stdio.h>
#define MAXN 1000 /* maximum number of elements in v */

int binsearch(int x, int v[], int n);

/* read n and v[0]...v[n-1], then search v for each remaining number */
int main() {
  int v[MAXN];
  int i, n, x;

  if (scanf("%d", &n) != 1 || n < 0 || n > MAXN)
    return 1; /* no n, or one that v can't hold */
  for (i = 0; i < n; i++)
    scanf("%d", &v[i]);

  while (scanf("%d", &x) == 1)
    printf("%d\n", binsearch(x, v, n));

  return 0;
}

/* binsearch: find the first x in v[0] <= v[1] <= ... <= v[n-1];
   one test inside the loop

   The loop doesn't stop at a match: it remembers the lowest element
   >= x seen so far and keeps looking to its left, so it always runs
   about log2(n) times and ends at the first such element. The book's
   version can stop early on a match, but makes two tests per pass. */
int binsearch(int x, int v[], int n) {
  int low, high, mid, first;

  first = -1;
  low = 0;
  high = n - 1;
  while (low <= high) {
    mid = (low + high) / 2;
    if (v[mid] >= x) {
      first = mid;
      high = mid - 1;
    } else
      low = mid + 1;
  }
  if (first >= 0 && v[first] == x)
    return first;
  return -1; /* no match */
}
