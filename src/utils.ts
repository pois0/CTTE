export function absPow(base: number, index: number): number {
  if (base >= 0) return Math.pow(base, index);
  else return -Math.pow(-base, index);
}
