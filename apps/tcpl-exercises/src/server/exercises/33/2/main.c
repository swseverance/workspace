#include <stdio.h>

int main(void) {
  int lower, upper, step, rows = 0;

  scanf("%d %d %d", &lower, &upper, &step);

  printf("Fahr  Celsius\n");
  printf("----  -------\n");

  for (int fahr = lower; fahr <= upper; fahr += step) {
    printf("%4d  %7.1f\n", fahr, (5.0 / 9.0) * (fahr - 32));
    rows++;
  }

  printf("----  -------\n");
  printf("%d %s\n", rows, rows == 1 ? "row" : "rows");
  return 0;
}
