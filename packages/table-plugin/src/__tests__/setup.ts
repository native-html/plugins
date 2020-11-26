declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidHTML(strict?: boolean): R;
    }
  }
}

export {};
