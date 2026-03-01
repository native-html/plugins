declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidHTML(strict?: boolean): R;
    }
  }
}

export {};
