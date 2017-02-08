/**
 * Override typings for jasmine matchers
 */
declare namespace jasmine {
  interface Matchers {
    toBeHost(expected: any, expectationFailOutput?: any): boolean;
  }
}