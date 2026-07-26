import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { atomicWrite, ensureDir, readJsonFile, writeJsonFile } from "../fs";

describe("fs utils", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-fs-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe("ensureDir", () => {
    it("creates a directory if it does not exist", async () => {
      const dir = join(tmpDir, "new-dir");
      await ensureDir(dir);
      expect(existsSync(dir)).toBe(true);
    });

    it("does nothing if directory exists", async () => {
      await ensureDir(tmpDir);
      expect(existsSync(tmpDir)).toBe(true);
    });
  });

  describe("atomicWrite", () => {
    it("writes a file atomically", async () => {
      const filePath = join(tmpDir, "test.txt");
      await atomicWrite(filePath, "hello");
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("hello");
    });

    it("does not leave .tmp file behind", async () => {
      const filePath = join(tmpDir, "test.txt");
      await atomicWrite(filePath, "data");
      expect(
        (await readdir(tmpDir)).some((name) => name.includes(".tmp-"))
      ).toBe(false);
    });

    it("creates parent directories", async () => {
      const filePath = join(tmpDir, "nested", "dir", "file.txt");
      await atomicWrite(filePath, "nested data");
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("nested data");
    });

    it("supports concurrent writes without temporary-file collisions", async () => {
      const filePath = join(tmpDir, "shared.json");
      const values = ["first", "second", "third"];

      await Promise.all(
        values.map((value) => atomicWrite(filePath, value))
      );

      expect(values).toContain(await readFile(filePath, "utf-8"));
      expect(
        (await readdir(tmpDir)).some((name) => name.includes(".tmp-"))
      ).toBe(false);
    });
  });

  describe("readJsonFile / writeJsonFile", () => {
    it("round-trips JSON data", async () => {
      const filePath = join(tmpDir, "data.json");
      const data = { key: "value", num: 42 };
      await writeJsonFile(filePath, data);
      const result = await readJsonFile(filePath);
      expect(result).toEqual(data);
    });

    it("returns null for non-existent file", async () => {
      const result = await readJsonFile(join(tmpDir, "nope.json"));
      expect(result).toBeNull();
    });
  });
});
