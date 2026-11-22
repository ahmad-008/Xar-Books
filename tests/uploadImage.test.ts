import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/config/cloudinary", () => ({ default: {} }));
const { checkImage } = await import("@/server/utils/uploadImage");

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];

const file = (bytes: number[], type: string, size = bytes.length) => {
    const body = new Uint8Array(size);
    body.set(bytes);
    return new File([body], "cover", { type });
};

describe("checkImage", () => {
    it.each([
        ["PNG", PNG, "image/png"],
        ["JPEG", JPEG, "image/jpeg"],
        ["WEBP", WEBP, "image/webp"],
    ])("accepts a real %s", async (_name, bytes, type) => {
        await expect(checkImage(file(bytes, type))).resolves.not.toThrow();
    });

    it("rejects a file that only claims to be an image", async () => {
        const fake = file([...new TextEncoder().encode("<script>")], "image/png");
        await expect(checkImage(fake)).rejects.toThrow();
    });

    it("rejects other types", async () => {
        await expect(checkImage(file(PNG, "image/gif"))).rejects.toThrow("Only JPG, PNG or WEBP");
    });

    it("rejects files over 1 MB", async () => {
        await expect(checkImage(file(PNG, "image/png", 1024 * 1024 + 1))).rejects.toThrow("1 MB or smaller");
    });
});
