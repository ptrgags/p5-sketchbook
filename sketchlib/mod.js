// Because JavaScript doesn't handle the modulo operator
// correctly for negative numbers
export function mod(x, modulus) {
  return ((x % modulus) + modulus) % modulus;
}
