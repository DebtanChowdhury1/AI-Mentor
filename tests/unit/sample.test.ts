import { describe, expect, it } from "vitest";

const add = (a: number, b: number) => a + b;

describe("math", () => {
  it("adds numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
