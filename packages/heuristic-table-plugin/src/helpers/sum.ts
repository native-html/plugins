/** Total of `values`, or `0` when there are none. */
export default function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
