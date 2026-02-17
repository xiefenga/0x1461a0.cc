import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { computeHash } from "../hash";

describe("computeHash", () => {
  it("returns a sha256 hex string", () => {
    const hash = computeHash({ title: "Test" }, "body content");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic", () => {
    const meta = { title: "Test" };
    const body = "hello";
    expect(computeHash(meta, body)).toBe(computeHash(meta, body));
  });

  it("changes when metadata changes", () => {
    const body = "same body";
    const h1 = computeHash({ title: "A" }, body);
    const h2 = computeHash({ title: "B" }, body);
    expect(h1).not.toBe(h2);
  });

  it("changes when body changes", () => {
    const meta = { title: "Same" };
    const h1 = computeHash(meta, "body1");
    const h2 = computeHash(meta, "body2");
    expect(h1).not.toBe(h2);
  });

  it("matches manual sha256 computation", () => {
    const meta = { title: "Test" };
    const body = "content";
    const expected = createHash("sha256")
      .update(JSON.stringify(meta) + body)
      .digest("hex");
    expect(computeHash(meta, body)).toBe(expected);
  });
});
