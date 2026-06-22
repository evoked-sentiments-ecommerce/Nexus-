/**
 * storage.test.ts
 *
 * Unit + Integration tests for the Storage Service (Cloudflare R2).
 * External R2 SDK calls are mocked so tests run without credentials.
 */

import {
  uploadFile,
  downloadFile,
  deleteFile,
  getSignedUrl,
  listFiles,
  StorageFile,
  UploadOptions,
} from "../src/services/storageService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setEnv(vars: Record<string, string>) {
  Object.entries(vars).forEach(([k, v]) => {
    process.env[k] = v;
  });
}

function clearEnv(...keys: string[]) {
  keys.forEach((k) => delete process.env[k]);
}

// ---------------------------------------------------------------------------
// Unit tests — uploadFile
// ---------------------------------------------------------------------------

describe("storageService.uploadFile — unit tests", () => {
  beforeEach(() => {
    setEnv({
      R2_BUCKET_NAME: "test-bucket",
      R2_PUBLIC_URL: "https://cdn.nexus.app",
    });
  });

  afterEach(() => {
    clearEnv("R2_BUCKET_NAME", "R2_PUBLIC_URL");
  });

  it("returns a StorageFile with the correct key and url", async () => {
    const buffer = Buffer.from("hello world");
    const result: StorageFile = await uploadFile("docs/test.txt", buffer, {
      contentType: "text/plain",
    });

    expect(result.key).toBe("docs/test.txt");
    expect(result.url).toContain("docs/test.txt");
    expect(result.size).toBe(buffer.length);
    expect(result.contentType).toBe("text/plain");
  });

  it("defaults contentType to application/octet-stream", async () => {
    const buffer = Buffer.from("binary data");
    const result = await uploadFile("bin/data.bin", buffer);

    expect(result.contentType).toBe("application/octet-stream");
  });

  it("constructs the public URL from R2_PUBLIC_URL", async () => {
    const buffer = Buffer.from("x");
    const result = await uploadFile("images/logo.png", buffer, {
      contentType: "image/png",
    });

    expect(result.url).toBe("https://cdn.nexus.app/images/logo.png");
  });

  it("throws when R2_BUCKET_NAME is not set", async () => {
    clearEnv("R2_BUCKET_NAME");

    await expect(
      uploadFile("test.txt", Buffer.from("x"))
    ).rejects.toThrow("R2_BUCKET_NAME environment variable is not set");
  });
});

// ---------------------------------------------------------------------------
// Unit tests — downloadFile
// ---------------------------------------------------------------------------

describe("storageService.downloadFile — unit tests", () => {
  beforeEach(() => {
    setEnv({ R2_BUCKET_NAME: "test-bucket" });
  });

  afterEach(() => {
    clearEnv("R2_BUCKET_NAME");
  });

  it("returns a Buffer", async () => {
    const result = await downloadFile("docs/readme.md");
    expect(result).toBeInstanceOf(Buffer);
  });

  it("throws when R2_BUCKET_NAME is not set", async () => {
    clearEnv("R2_BUCKET_NAME");
    await expect(downloadFile("any.txt")).rejects.toThrow(
      "R2_BUCKET_NAME environment variable is not set"
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — deleteFile
// ---------------------------------------------------------------------------

describe("storageService.deleteFile — unit tests", () => {
  beforeEach(() => {
    setEnv({ R2_BUCKET_NAME: "test-bucket" });
  });

  afterEach(() => {
    clearEnv("R2_BUCKET_NAME");
  });

  it("resolves without throwing for a valid key", async () => {
    await expect(deleteFile("docs/old.txt")).resolves.toBeUndefined();
  });

  it("throws when R2_BUCKET_NAME is not set", async () => {
    clearEnv("R2_BUCKET_NAME");
    await expect(deleteFile("docs/old.txt")).rejects.toThrow(
      "R2_BUCKET_NAME environment variable is not set"
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — getSignedUrl
// ---------------------------------------------------------------------------

describe("storageService.getSignedUrl — unit tests", () => {
  beforeEach(() => {
    setEnv({
      R2_BUCKET_NAME: "test-bucket",
      R2_PUBLIC_URL: "https://cdn.nexus.app",
    });
  });

  afterEach(() => {
    clearEnv("R2_BUCKET_NAME", "R2_PUBLIC_URL");
  });

  it("returns a URL string containing the key", async () => {
    const url = await getSignedUrl("packages/pkg-001.zip");
    expect(typeof url).toBe("string");
    expect(url).toContain("packages/pkg-001.zip");
  });

  it("includes an expiry parameter in the signed URL", async () => {
    const url = await getSignedUrl("packages/pkg-001.zip", 7200);
    expect(url).toContain("expires=");
  });

  it("uses a default expiry of 3600 seconds", async () => {
    const before = Date.now();
    const url = await getSignedUrl("packages/test.zip");
    const after = Date.now();
    const match = url.match(/expires=(\d+)/);
    expect(match).not.toBeNull();
    const expires = parseInt(match![1], 10);
    expect(expires).toBeGreaterThanOrEqual(before + 3600 * 1000);
    expect(expires).toBeLessThanOrEqual(after + 3600 * 1000);
  });

  it("throws when R2_BUCKET_NAME is not set", async () => {
    clearEnv("R2_BUCKET_NAME");
    await expect(getSignedUrl("test.zip")).rejects.toThrow(
      "R2_BUCKET_NAME environment variable is not set"
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — listFiles
// ---------------------------------------------------------------------------

describe("storageService.listFiles — unit tests", () => {
  beforeEach(() => {
    setEnv({ R2_BUCKET_NAME: "test-bucket" });
  });

  afterEach(() => {
    clearEnv("R2_BUCKET_NAME");
  });

  it("returns an array", async () => {
    const files = await listFiles("docs/");
    expect(Array.isArray(files)).toBe(true);
  });

  it("works without a prefix argument", async () => {
    const files = await listFiles();
    expect(Array.isArray(files)).toBe(true);
  });

  it("throws when R2_BUCKET_NAME is not set", async () => {
    clearEnv("R2_BUCKET_NAME");
    await expect(listFiles()).rejects.toThrow(
      "R2_BUCKET_NAME environment variable is not set"
    );
  });
});

// ---------------------------------------------------------------------------
// Integration tests — upload → signed URL flow
// ---------------------------------------------------------------------------

describe("storageService upload → signed URL flow — integration tests", () => {
  beforeEach(() => {
    setEnv({
      R2_BUCKET_NAME: "test-bucket",
      R2_PUBLIC_URL: "https://cdn.nexus.app",
    });
  });

  afterEach(() => {
    clearEnv("R2_BUCKET_NAME", "R2_PUBLIC_URL");
  });

  it("uploaded file key is reflected in the signed URL", async () => {
    const key = "reports/annual-2024.pdf";
    const buffer = Buffer.from("%PDF-1.4 content here");

    const uploaded = await uploadFile(key, buffer, { contentType: "application/pdf" });
    expect(uploaded.key).toBe(key);

    const signedUrl = await getSignedUrl(key);
    expect(signedUrl).toContain(key);
  });

  it("StorageFile interface shape is correct", async () => {
    const result = await uploadFile("shape/test.txt", Buffer.from("test"), {
      contentType: "text/plain",
    });

    expect(result).toMatchObject<Partial<StorageFile>>({
      key: "shape/test.txt",
      contentType: "text/plain",
    });
    expect(typeof result.url).toBe("string");
    expect(typeof result.size).toBe("number");
  });
});

// ---------------------------------------------------------------------------
// Type-level tests — UploadOptions interface
// ---------------------------------------------------------------------------

describe("UploadOptions type contract", () => {
  it("accepts an empty options object", () => {
    const opts: UploadOptions = {};
    expect(opts).toBeDefined();
  });

  it("accepts contentType and metadata fields", () => {
    const opts: UploadOptions = {
      contentType: "image/jpeg",
      metadata: { author: "nexus", version: "1" },
    };
    expect(opts.contentType).toBe("image/jpeg");
    expect(opts.metadata?.author).toBe("nexus");
  });
});
