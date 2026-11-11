#include <stdio.h>

float celsius(float fahr);

/* print Fahrenheit-Celsius table
   for fahr = 0, 20, ..., 300; floating-point version */
int main() {
  float fahr;
  float lower, upper, step;

  lower = 0;
  upper = 300;
  step = 20;

  fahr = lower;
  while (fahr <= upper) {
    printf("%3.0f %6.1f\n", fahr, celsius(fahr));
    fahr = fahr + step;
  }

  return 0;
}

/* celsius: convert fahr degrees Fahrenheit to Celsius */
float celsius(float fahr) {
  return (5.0 / 9.0) * (fahr - 32.0);
}
